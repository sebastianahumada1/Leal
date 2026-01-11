-- Script SQL para corregir el problema de que admins no pueden ver visitas pendientes
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================================
-- 1. Asegurar que la función is_admin_or_staff() existe
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si el usuario actual es admin o staff
  -- Usa SECURITY DEFINER para evitar problemas de permisos
  RETURN (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );
EXCEPTION
  WHEN others THEN
    -- Si hay error, retornar false por seguridad
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 2. ELIMINAR políticas viejas de SELECT en stamps
-- ============================================================

DROP POLICY IF EXISTS "Users can view own stamps" ON stamps;
DROP POLICY IF EXISTS "Admins can view all stamps" ON stamps;

-- ============================================================
-- 3. CREAR políticas nuevas que permitan a admins ver todos los stamps
-- ============================================================

-- Política para usuarios: pueden ver sus propios stamps
CREATE POLICY "Users can view own stamps" ON stamps
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para admins/staff: pueden ver TODOS los stamps
CREATE POLICY "Admins can view all stamps" ON stamps
  FOR SELECT 
  USING (public.is_admin_or_staff());

-- ============================================================
-- 4. Asegurar que también puedan ver los perfiles de otros usuarios
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT 
  USING (
    auth.uid() = id  -- Todos pueden ver su propio perfil
    OR 
    public.is_admin_or_staff()  -- Admins pueden ver todos
  );

-- ============================================================
-- 5. Verificación
-- ============================================================

SELECT '✅ Política de SELECT para stamps corregida' as status;
SELECT '✅ Admins ahora pueden ver todos los stamps pendientes' as status;

-- Verificar las políticas actuales
SELECT 
    policyname, 
    cmd, 
    CASE 
        WHEN qual IS NULL THEN 'No restriction'
        ELSE substring(qual::text, 1, 50)
    END as using_clause
FROM pg_policies 
WHERE tablename = 'stamps' 
AND cmd = 'SELECT'
ORDER BY policyname;
