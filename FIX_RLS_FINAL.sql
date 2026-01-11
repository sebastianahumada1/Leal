-- ============================================
-- SOLUCIÓN DEFINITIVA PARA RLS EN PROFILES
-- ============================================

-- 1. DESHABILITAR RLS temporalmente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. BORRAR TODAS las políticas existentes
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    END LOOP;
END $$;

-- 3. HABILITAR RLS de nuevo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICA SUPER PERMISIVA (para desarrollo)
CREATE POLICY "allow_all_authenticated" ON profiles
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. DAR TODOS LOS PERMISOS
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;

-- 6. VERIFICAR
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

SELECT '✅ CONFIGURACIÓN COMPLETA - Intenta registrarte ahora' as status;
