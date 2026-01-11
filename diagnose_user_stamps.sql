-- Script de diagnóstico para el usuario 307444c3-40fa-46c3-9927-3fc7c999aea3
-- Verifica la discrepancia entre stamps reales y current_stamps

-- 1. Información del perfil
SELECT 
  id,
  email,
  current_stamps,
  created_at
FROM profiles
WHERE id = '307444c3-40fa-46c3-9927-3fc7c999aea3';

-- 2. Todos los stamps del usuario (con status)
SELECT 
  id,
  status,
  created_at,
  collected_at,
  collected_by
FROM stamps
WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
ORDER BY created_at DESC;

-- 3. Conteo de stamps por status
SELECT 
  status,
  COUNT(*) as count
FROM stamps
WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
GROUP BY status;

-- 4. Total de stamps aprobados
SELECT COUNT(*) as total_approved_stamps
FROM stamps
WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
AND status = 'approved';

-- 5. Recompensas canjeadas (aprobadas)
SELECT 
  ur.id,
  ur.status,
  ur.redeemed_at,
  r.name,
  r.required_stamps
FROM user_rewards ur
JOIN rewards r ON ur.reward_id = r.id
WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
ORDER BY ur.created_at DESC;

-- 6. Suma de stamps gastados en recompensas aprobadas
SELECT COALESCE(SUM(r.required_stamps), 0) as total_redeemed_stamps
FROM user_rewards ur
JOIN rewards r ON ur.reward_id = r.id
WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
AND ur.status = 'approved';

-- 7. Cálculo manual de current_stamps (debería ser)
SELECT 
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
   AND status = 'approved') as stamps_aprobados,
  COALESCE((SELECT SUM(r.required_stamps)
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
            AND ur.status = 'approved'), 0) as stamps_gastados,
  (SELECT COUNT(*) 
   FROM stamps 
   WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
   AND status = 'approved') - 
  COALESCE((SELECT SUM(r.required_stamps)
            FROM user_rewards ur
            JOIN rewards r ON ur.reward_id = r.id
            WHERE ur.user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
            AND ur.status = 'approved'), 0) as current_stamps_deberia_ser,
  (SELECT current_stamps 
   FROM profiles 
   WHERE id = '307444c3-40fa-46c3-9927-3fc7c999aea3') as current_stamps_actual;

-- 8. Verificar si hay stamps con status NULL (esto podría causar problemas)
SELECT COUNT(*) as stamps_sin_status
FROM stamps
WHERE user_id = '307444c3-40fa-46c3-9927-3fc7c999aea3'
AND status IS NULL;
