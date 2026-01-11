-- Fix: Asegurar que los usuarios puedan actualizar su perfil inmediatamente después de crearlo
-- 
-- PROBLEMA: Cuando un usuario se registra, el trigger crea el perfil, pero las políticas RLS
-- podrían estar bloqueando la actualización inmediata del perfil.
--
-- SOLUCIÓN: Asegurar que la política de actualización permita actualizar el perfil
-- cuando el id coincide con auth.uid() (que es el caso cuando el usuario se acaba de registrar)

-- Verificar y corregir la política de actualización
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Política de actualización: permitir actualizar cuando el id coincide con auth.uid()
-- Esto funciona inmediatamente después del registro porque el usuario ya está autenticado
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verificar que la política se creó correctamente
-- SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile';
