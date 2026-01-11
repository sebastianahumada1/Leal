-- SOLUCIÓN TEMPORAL: Deshabilitar RLS en profiles
-- IMPORTANTE: Solo para desarrollo. En producción hay que configurar RLS correctamente.

-- Deshabilitar RLS en profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verificación
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Deberías ver: rowsecurity = false

SELECT 'RLS deshabilitado en profiles. Ahora puedes registrarte.' as status;
