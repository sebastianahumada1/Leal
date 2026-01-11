-- Migración: Agregar políticas RLS para que admins puedan gestionar recompensas
-- Fecha: 2026-01-13

-- Asegurar que la función is_admin_or_staff() existe (ya debería existir de migraciones anteriores)
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
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
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ELIMINAR políticas viejas si existen
DROP POLICY IF EXISTS "Anyone can view active rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can view all rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can insert rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can update rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can delete rewards" ON rewards;

-- CREAR políticas nuevas

-- 1. Cualquiera puede ver recompensas activas (para usuarios)
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT 
  USING (active = true);

-- 2. Admins/staff pueden ver TODAS las recompensas (activas e inactivas)
CREATE POLICY "Admins can view all rewards" ON rewards
  FOR SELECT 
  USING (public.is_admin_or_staff());

-- 3. Admins/staff pueden crear recompensas
CREATE POLICY "Admins can insert rewards" ON rewards
  FOR INSERT
  WITH CHECK (public.is_admin_or_staff());

-- 4. Admins/staff pueden actualizar recompensas
CREATE POLICY "Admins can update rewards" ON rewards
  FOR UPDATE
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- 5. Admins/staff pueden eliminar recompensas
CREATE POLICY "Admins can delete rewards" ON rewards
  FOR DELETE
  USING (public.is_admin_or_staff());

-- Agregar columna updated_at si no existe
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rewards_updated_at_trigger ON rewards;
CREATE TRIGGER update_rewards_updated_at_trigger
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_rewards_updated_at();

-- Verificación
SELECT '✅ Políticas RLS para rewards creadas correctamente' as status;
SELECT '✅ Columna updated_at agregada a rewards (si no existía)' as status;
SELECT '✅ Trigger para updated_at creado' as status;
