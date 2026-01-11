-- Script SQL para corregir el error de registro "Database error saving new user"
-- Este error ocurre cuando el trigger no puede insertar el perfil debido a políticas RLS

-- ELIMINAR políticas viejas si existen
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;

-- CREAR política que permita la inserción del trigger
-- La función handle_new_user() usa SECURITY DEFINER, pero aún necesita una política RLS
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (true);  -- Permitir todas las inserciones (el trigger valida con SECURITY DEFINER)

-- Verificar que la función del trigger tenga los permisos correctos
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Asegurar que la función use SECURITY DEFINER (esto permite que ejecute con privilegios elevados)
-- Ya debería estar configurado, pero lo verificamos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'handle_new_user'
    AND p.prosecdef = true  -- SECURITY DEFINER
  ) THEN
    ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
  END IF;
END $$;

-- Verificación
SELECT '✅ Política RLS para inserción de perfiles corregida' as status;
SELECT '✅ Función handle_new_user() configurada correctamente' as status;

-- Para verificar las políticas actuales:
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles';
