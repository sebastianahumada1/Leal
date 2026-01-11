-- Consulta rápida de diagnóstico para el usuario 307444c3-40fa-46c3-9927-3fc7c999aea3
-- Esta consulta muestra toda la información relevante en una sola tabla

SELECT 
  -- Información del perfil
  p.email,
  p.current_stamps as current_stamps_actual,
  
  -- Conteo de stamps
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3') as total_stamps,
  
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
   AND status = 'approved') as stamps_aprobados,
  
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
   AND status = 'pending') as stamps_pendientes,
  
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
   AND status = 'rejected') as stamps_rechazados,
  
  -- Stamps gastados en recompensas
  COALESCE((SELECT SUM(r.required_stamps)
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
            AND ur.status = 'approved'), 0) as stamps_gastados,
  
  -- Cálculo manual de current_stamps (debería ser)
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
   AND status = 'approved') - 
  COALESCE((SELECT SUM(r.required_stamps)
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
            AND ur.status = 'approved'), 0) as current_stamps_deberia_ser,
  
  -- Diferencia (si hay discrepancia)
  p.current_stamps - (
    (SELECT COUNT(*) 
     FROM stamps 
     WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
     AND status = 'approved') - 
    COALESCE((SELECT SUM(r.required_stamps)
              FROM user_rewards ur
              JOIN rewards r ON ur.reward_id = r.id
              WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
              AND ur.status = 'approved'), 0)
  ) as diferencia
  
FROM profiles p
WHERE p.id = '307444c3-40fa-46c3-9927-3fc7c999aea3';

-- Detalle de todos los stamps del usuario
SELECT 
  id,
  status,
  created_at,
  collected_at,
  collected_by,
  amount,
  location_code
FROM stamps
WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
ORDER BY created_at DESC;

-- Detalle de recompensas canjeadas
SELECT 
  ur.id,
  ur.status,
  ur.redeemed_at,
  ur.created_at,
  r.name as reward_name,
  r.required_stamps
FROM user_rewards ur
JOIN rewards r ON ur.reward_id = r.id
WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
ORDER BY ur.created_at DESC;
