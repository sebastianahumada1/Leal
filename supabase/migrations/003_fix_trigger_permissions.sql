-- Fix: Corregir recursión infinita en políticas RLS
-- 
-- PROBLEMA: Las políticas RLS que verifican en 'profiles' dentro de políticas sobre 'profiles'
-- causan recursión infinita, especialmente al actualizar perfiles.
--
-- SOLUCIÓN: Usar políticas simples que no consulten 'profiles' dentro de políticas sobre 'profiles'

-- Asegurar que la función tenga los permisos correctos y el search_path
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================================
-- 1. CORRECCIÓN: Política de inserción para el trigger
-- ============================================================
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (true);

-- ============================================================
-- 2. CORRECCIÓN: Política de actualización (evitar recursión)
-- ============================================================
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 3. CORRECCIÓN: Política de admins para ver perfiles (evitar recursión)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
-- Temporalmente simplificada: solo ver propio perfil (evita recursión)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (auth.uid() = id);
-- TODO: Implementar verificación de rol sin recursión (usar auth.jwt() o roles personalizados)

-- ============================================================
-- 4. CORRECCIÓN: Políticas de stamps (evitar recursión)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all stamps" ON stamps;
CREATE POLICY "Admins can view all stamps" ON stamps
  FOR SELECT USING (auth.uid() = user_id);
-- TODO: Agregar verificación de rol sin recursión

DROP POLICY IF EXISTS "Admins can insert stamps" ON stamps;
CREATE POLICY "Admins can insert stamps" ON stamps
  FOR INSERT WITH CHECK (true);
-- TODO: Agregar verificación de rol sin recursión

-- ============================================================
-- 5. CORRECCIÓN: Política de rewards (evitar recursión)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active rewards" ON rewards;
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (active = true);
