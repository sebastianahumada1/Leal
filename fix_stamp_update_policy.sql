-- Script SQL para corregir el problema de actualización de stamps
-- Ejecuta este script en el SQL Editor de Supabase

-- ELIMINAR políticas viejas si existen
DROP POLICY IF EXISTS "Admins can update stamps" ON stamps;
DROP POLICY IF EXISTS "Users can update own pending stamps" ON stamps;
DROP FUNCTION IF EXISTS public.is_admin_or_staff();

-- CREAR función helper para verificar rol (evita recursión usando SECURITY DEFINER)
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

-- Política para que admins/staff puedan actualizar stamps
CREATE POLICY "Admins can update stamps" ON stamps
  FOR UPDATE
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- Verificación
SELECT '✅ Política de UPDATE para stamps creada correctamente' as status;

-- Para verificar que funciona, ejecuta esto después:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'stamps' AND cmd = 'UPDATE';
