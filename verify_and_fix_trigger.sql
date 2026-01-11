-- Script para verificar y corregir el trigger de registro
-- Ejecuta esto en el SQL Editor de Supabase para diagnosticar el problema

-- ============================================================
-- 1. Verificar que la función existe y tiene SECURITY DEFINER
-- ============================================================

SELECT 
    p.proname as function_name,
    n.nspname as schema,
    CASE 
        WHEN p.prosecdef THEN 'SECURITY DEFINER ✓'
        ELSE 'SECURITY INVOKER ✗'
    END as security_setting,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'handle_new_user';

-- ============================================================
-- 2. Verificar que la secuencia existe
-- ============================================================

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_class WHERE relname = 'member_number_seq') 
        THEN '✅ Secuencia member_number_seq existe'
        ELSE '❌ Secuencia member_number_seq NO existe'
    END as sequence_status;

SELECT 
    last_value,
    is_called
FROM member_number_seq
LIMIT 1;

-- ============================================================
-- 3. Verificar que el trigger está activo
-- ============================================================

SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgenabled = 'O' THEN '✅ Trigger ACTIVO'
        WHEN tgenabled = 'D' THEN '❌ Trigger DESHABILITADO'
        ELSE '⚠️ Trigger en otro estado'
    END as trigger_status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ============================================================
-- 4. Verificar políticas RLS actuales
-- ============================================================

SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- ============================================================
-- 5. Corregir la función si no tiene SECURITY DEFINER
-- ============================================================

-- Recrear la función asegurándonos de que use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- CRÍTICO: Esto permite que la función ejecute con privilegios elevados
SET search_path = public
AS $$
DECLARE
  member_num TEXT;
BEGIN
  -- Verificar que la secuencia existe antes de usarla
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'member_number_seq') THEN
    -- Si la secuencia no existe, crearla
    CREATE SEQUENCE IF NOT EXISTS member_number_seq
        AS INTEGER
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
  END IF;

  -- Usar la secuencia para generar el número de socio
  SELECT LPAD(nextval('member_number_seq')::text, 4, '0') INTO member_num;

  -- Insertar el perfil
  INSERT INTO public.profiles (id, email, member_number, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', 'no-email@example.com'),
    member_num,
    'user',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log detallado del error
    RAISE WARNING '[handle_new_user] Error creating profile for user %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Asegurar que la función tenga los permisos correctos
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================================
-- 6. Asegurar que el trigger esté activo
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. Verificar que las políticas permiten inserción
-- ============================================================

-- Asegurar que la política de inserción existe
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (true);

-- ============================================================
-- 8. Verificación final
-- ============================================================

SELECT '✅ Verificación completada' as status;
SELECT 'Revisa los resultados anteriores para identificar cualquier problema' as note;
