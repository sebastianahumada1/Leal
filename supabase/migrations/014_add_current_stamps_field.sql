-- Migración: Agregar campo current_stamps a profiles y triggers para mantenerlo actualizado
-- Fecha: 2026-01-13

-- Agregar columna current_stamps a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_stamps INTEGER DEFAULT 0 NOT NULL;

-- Inicializar current_stamps para usuarios existentes
-- current_stamps = stamps aprobados - suma de required_stamps de recompensas aprobadas
UPDATE profiles 
SET current_stamps = GREATEST(
  (
    SELECT COUNT(*) 
    FROM stamps 
    WHERE stamps.user_id = profiles.id 
    AND stamps.status = 'approved'
  ) - COALESCE(
    (
      SELECT SUM(r.required_stamps)
      FROM user_rewards ur
      JOIN rewards r ON ur.reward_id = r.id
      WHERE ur.user_id = profiles.id 
      AND ur.status = 'approved'
    ), 
    0
  ),
  0
)
WHERE current_stamps = 0 OR current_stamps IS NULL;

-- NOTA: Los triggers simples de incrementar/decrementar ya NO son suficientes
-- porque current_stamps = stamps aprobados - required_stamps de recompensas aprobadas
-- Por lo tanto, usamos la función update_user_stamp_count() para recalcular
-- cuando cambia el status de stamps o cuando se aprueba/rechaza un canje

-- Trigger para recalcular cuando cambia el status de un stamp
CREATE OR REPLACE FUNCTION public.recalculate_stamp_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular current_stamps cuando cambia el status de un stamp
  PERFORM public.update_user_stamp_count(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_recalculate_stamp_count ON stamps;
CREATE TRIGGER trigger_recalculate_stamp_count
  AFTER INSERT OR UPDATE OF status OR DELETE ON stamps
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_stamp_count();

-- Trigger para recalcular cuando cambia el status de user_rewards (aprobar/rechazar canje)
CREATE OR REPLACE FUNCTION public.recalculate_stamp_count_on_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular current_stamps cuando se aprueba/rechaza un canje
  -- En INSERT, solo NEW existe
  -- En UPDATE, tanto NEW como OLD existen
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'approved' THEN
      PERFORM public.update_user_stamp_count(NEW.user_id);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Recalcular si el status cambió a/desde 'approved'
    IF (NEW.status = 'approved' OR OLD.status = 'approved') AND NEW.status IS DISTINCT FROM OLD.status THEN
      PERFORM public.update_user_stamp_count(NEW.user_id);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_recalculate_stamp_count_on_reward ON user_rewards;
CREATE TRIGGER trigger_recalculate_stamp_count_on_reward
  AFTER INSERT OR UPDATE OF status ON user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_stamp_count_on_reward();

-- Trigger para decrementar cuando se elimina un stamp aprobado
-- Este trigger se ejecuta por cada fila eliminada, así que funcionará correctamente incluso con DELETE en lote
CREATE OR REPLACE FUNCTION public.decrement_stamp_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'approved' THEN
    UPDATE profiles 
    SET current_stamps = GREATEST(current_stamps - 1, 0)
    WHERE id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_decrement_stamp_on_delete ON stamps;
CREATE TRIGGER trigger_decrement_stamp_on_delete
  AFTER DELETE ON stamps
  FOR EACH ROW
  WHEN (OLD.status = 'approved')
  EXECUTE FUNCTION public.decrement_stamp_on_delete();

-- Función auxiliar para recalcular current_stamps de un usuario (útil para sincronización)
-- current_stamps = stamps aprobados - suma de required_stamps de recompensas aprobadas
CREATE OR REPLACE FUNCTION public.update_user_stamp_count(user_id_param UUID)
RETURNS void AS $$
DECLARE
  total_approved_stamps INTEGER;
  total_redeemed_stamps INTEGER;
  calculated_stamps INTEGER;
BEGIN
  -- Contar stamps aprobados del usuario
  SELECT COUNT(*) INTO total_approved_stamps
  FROM stamps 
  WHERE stamps.user_id = user_id_param 
  AND stamps.status = 'approved';
  
  -- Sumar required_stamps de recompensas aprobadas del usuario
  SELECT COALESCE(SUM(r.required_stamps), 0) INTO total_redeemed_stamps
  FROM user_rewards ur
  JOIN rewards r ON ur.reward_id = r.id
  WHERE ur.user_id = user_id_param 
  AND ur.status = 'approved';
  
  -- Calcular stamps disponibles (no pueden ser negativos)
  calculated_stamps := GREATEST(total_approved_stamps - total_redeemed_stamps, 0);
  
  -- Actualizar current_stamps
  UPDATE profiles 
  SET current_stamps = calculated_stamps
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON COLUMN profiles.current_stamps IS 'Número actual de sellos aprobados del usuario, mantenido automáticamente por triggers';

-- Verificación
SELECT '✅ Campo current_stamps agregado y triggers configurados' as status;
