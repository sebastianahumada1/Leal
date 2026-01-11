-- Script para asegurar que la función RPC update_user_stamp_count funcione correctamente
-- Ejecutar en Supabase SQL Editor

-- Asegurar que la función existe y tiene SECURITY DEFINER
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

-- Dar permisos de ejecución a authenticated
GRANT EXECUTE ON FUNCTION public.update_user_stamp_count(UUID) TO authenticated;

-- Comentario
COMMENT ON FUNCTION public.update_user_stamp_count(UUID) IS 'Recalcula current_stamps de un usuario contando sus sellos aprobados. Usa SECURITY DEFINER para bypass RLS.';

-- Verificación: mostrar la función
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proacl as permissions
FROM pg_proc 
WHERE proname = 'update_user_stamp_count';

-- Verificación
SELECT '✅ Función update_user_stamp_count verificada y configurada' as status;
