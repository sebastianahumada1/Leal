-- Script para permitir que staff y admin actualicen current_stamps en profiles
-- Ejecutar en Supabase SQL Editor

-- Política para que staff y admin puedan actualizar current_stamps
DROP POLICY IF EXISTS "Staff can update current_stamps" ON profiles;
CREATE POLICY "Staff can update current_stamps" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Verificación
SELECT '✅ Política para actualizar current_stamps agregada' as status;
