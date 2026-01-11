-- Script para corregir current_stamps del usuario 307444c3-40fa-46c3-9927-3fc7c999aea3
-- Ejecutar después de diagnosticar el problema

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
  
  -- Actualizar current_stamps
  UPDATE profiles 
  SET current_stamps = calculated_stamps
  WHERE id = user_id_param;
  
  -- Log para debugging
  RAISE NOTICE 'Usuario %: stamps aprobados=%, recompensas aprobadas=%, current_stamps=%', 
    user_id_param, total_approved_stamps, total_redeemed_stamps, calculated_stamps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Corregir current_stamps para este usuario específico
SELECT public.update_user_stamp_count('307444c3-40fa-46c3-9927-3fc7c999aea3');

-- 3. Verificar el resultado
SELECT 
  p.id,
  p.email,
  p.current_stamps as current_stamps_corregido,
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE stamps.user_id = p.id 
   AND stamps.status = 'approved') as stamps_aprobados,
  COALESCE((SELECT SUM(r.required_stamps)
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = p.id
            AND ur.status = 'approved'), 0) as stamps_gastados,
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE stamps.user_id = p.id 
   AND stamps.status = 'approved') - 
  COALESCE((SELECT SUM(r.required_stamps)
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = p.id
            AND ur.status = 'approved'), 0) as calculado_manual
FROM profiles p
WHERE p.id = '307444c3-40fa-46c3-9927-3fc7c999aea3';

SELECT '✅ current_stamps corregido para el usuario' as status;
