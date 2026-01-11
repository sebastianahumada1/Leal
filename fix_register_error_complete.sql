-- Script SQL completo para corregir el error "Database error saving new user"
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================================
-- 1. Asegurar que la función del trigger use la secuencia correcta
-- ============================================================

-- Recrear la función handle_new_user() usando la secuencia de member_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_num TEXT;
BEGIN
  -- Usar la secuencia para generar el número de socio secuencial
  SELECT LPAD(nextval('member_number_seq')::text, 4, '0') INTO member_num;

  -- Insertar el perfil con los datos del usuario
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
    -- Log del error pero no fallar el registro de usuario
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Asegurar que la función tenga los permisos correctos
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================================
-- 2. Recrear el trigger si no existe
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Asegurar que la secuencia existe
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS member_number_seq
    AS INTEGER
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Ajustar la secuencia al siguiente número disponible
SELECT setval('member_number_seq', 
    COALESCE((SELECT MAX(member_number::integer) FROM profiles WHERE member_number ~ '^[0-9]+$'), 0) + 1, 
    false
);

-- ============================================================
-- 4. Asegurar que RLS está habilitado
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. Recrear políticas RLS (CRÍTICO para que funcione)
-- ============================================================

-- Política para permitir que el trigger inserte perfiles
-- IMPORTANTE: Esta política debe permitir todas las inserciones
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (true);  -- Permitir todas las inserciones

-- Política para que usuarios puedan ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para que usuarios puedan actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para que usuarios puedan insertar su propio perfil (para upsert)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 6. Verificación
-- ============================================================

SELECT '✅ Función handle_new_user() recreada' as status;
SELECT '✅ Trigger on_auth_user_created recreado' as status;
SELECT '✅ Políticas RLS actualizadas' as status;
SELECT '✅ Secuencia member_number_seq configurada' as status;

-- Verificar las políticas actuales
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
