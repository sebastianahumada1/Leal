-- Migración: Actualizar política RLS para que todos puedan ver TODAS las recompensas
-- Fecha: 2026-01-13

-- ELIMINAR política que solo permite ver recompensas activas
DROP POLICY IF EXISTS "Anyone can view active rewards" ON rewards;

-- CREAR nueva política que permite ver TODAS las recompensas (activas e inactivas)
CREATE POLICY "Anyone can view all rewards" ON rewards
  FOR SELECT 
  USING (true); -- Permitir ver todas las recompensas a todos los usuarios

-- Verificación
SELECT '✅ Política RLS actualizada: Todos pueden ver todas las recompensas' as status;
