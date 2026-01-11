-- Script completo para corregir y verificar current_stamps
-- Ejecutar en Supabase SQL Editor

-- 1. Asegurar que la función RPC existe y funciona correctamente
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
  
  -- Actualizar current_stamps (usando SECURITY DEFINER para bypass RLS)
  UPDATE profiles 
  SET current_stamps = calculated_stamps
  WHERE id = user_id_param;
  
  -- Log para debugging (solo en desarrollo)
  RAISE NOTICE 'Usuario %: stamps aprobados=%, recompensas aprobadas=%, current_stamps=%', 
    user_id_param, total_approved_stamps, total_redeemed_stamps, calculated_stamps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.update_user_stamp_count(UUID) TO authenticated, anon;

-- 3. Recalcular current_stamps para TODOS los usuarios
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM public.update_user_stamp_count(user_record.id);
  END LOOP;
END $$;

-- 4. Verificar que los triggers estén configurados correctamente
DROP TRIGGER IF EXISTS trigger_recalculate_stamp_count_on_reward ON user_rewards;
CREATE TRIGGER trigger_recalculate_stamp_count_on_reward
  AFTER INSERT OR UPDATE OF status ON user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_stamp_count_on_reward();

-- 5. Verificar resultados
SELECT 
  p.id,
  p.email,
  p.current_stamps,
  (SELECT COUNT(*) FROM stamps WHERE stamps.user_id = p.id AND stamps.status = 'approved') as stamps_aprobados,
  COALESCE((SELECT SUM(r.required_stamps) 
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = p.id AND ur.status = 'approved'), 0) as stamps_gastados,
  (SELECT COUNT(*) FROM stamps WHERE stamps.user_id = p.id AND stamps.status = 'approved') - 
  COALESCE((SELECT SUM(r.required_stamps) 
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = p.id AND ur.status = 'approved'), 0) as calculado_manual
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- Verificación
SELECT '✅ Función RPC actualizada, current_stamps recalculado para todos los usuarios' as status;
