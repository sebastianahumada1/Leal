-- Configuración RLS correcta para producción en profiles
-- Este script configura políticas seguras y funcionales

-- 1. Habilitar RLS (seguridad)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR todas las políticas existentes para empezar limpio
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    END LOOP;
END $$;

-- 3. CREAR POLÍTICAS CORRECTAS

-- Política para SELECT: Usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own_profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política para INSERT: Permitir inserción si el usuario es el dueño del perfil
-- O si no hay usuario autenticado (para el trigger)
CREATE POLICY "users_insert_own_profile" ON profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = id OR auth.uid() IS NULL
    );

-- Política para UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para DELETE: Solo service_role puede borrar (seguridad)
CREATE POLICY "service_role_delete_profiles" ON profiles
    FOR DELETE
    USING (auth.role() = 'service_role');

-- 4. PERMISOS para roles
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- 5. VERIFICAR configuración
SELECT 
    'RLS configurado correctamente para producción' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
