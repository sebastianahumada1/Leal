-- Migración: Agregar políticas RLS para que staff pueda gestionar canjes de recompensas
-- Fecha: 2026-01-13

-- Política para que staff pueda ver todos los user_rewards
DROP POLICY IF EXISTS "Staff can view all user_rewards" ON user_rewards;
CREATE POLICY "Staff can view all user_rewards" ON user_rewards
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Política para que staff pueda actualizar user_rewards (aprobar/rechazar)
DROP POLICY IF EXISTS "Staff can update user_rewards" ON user_rewards;
CREATE POLICY "Staff can update user_rewards" ON user_rewards
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Verificación
SELECT '✅ Políticas RLS para user_rewards agregadas' as status;
