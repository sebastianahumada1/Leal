-- Migración: Agregar política RLS para actualizar stamps (admin/staff)
-- Fecha: 2026-01-12

-- Función helper para verificar si el usuario actual es admin o staff
-- Usa auth.jwt() para evitar recursión al no consultar la tabla profiles
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si el usuario tiene el claim 'role' en su JWT
  -- Esto requiere que establezcamos el rol en el JWT después del login
  -- Por ahora, usamos una política más permisiva pero verificamos directamente
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
DROP POLICY IF EXISTS "Admins can update stamps" ON stamps;

CREATE POLICY "Admins can update stamps" ON stamps
  FOR UPDATE
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- También permitir que usuarios actualicen sus propios stamps (si es necesario)
-- Pero solo pueden cambiar el status si es 'pending'
DROP POLICY IF EXISTS "Users can update own pending stamps" ON stamps;

CREATE POLICY "Users can update own pending stamps" ON stamps
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND status IN ('pending', 'approved', 'rejected')
  );

-- Comentarios para documentación
COMMENT ON FUNCTION public.is_admin_or_staff() IS 'Verifica si el usuario actual tiene rol admin o staff';
COMMENT ON POLICY "Admins can update stamps" ON stamps IS 'Permite a usuarios admin/staff actualizar cualquier stamp';
COMMENT ON POLICY "Users can update own pending stamps" ON stamps IS 'Permite a usuarios actualizar sus propios stamps pendientes';

-- Verificación
SELECT '✅ Política de UPDATE para stamps creada' as status;
