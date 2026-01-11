-- ============================================================
-- SCRIPT COMPLETO PARA CORREGIR EL REGISTRO DE USUARIOS
-- Ejecutar este script COMPLETO en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna phone si no existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Recrear la función del trigger con permisos correctos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_num TEXT;
BEGIN
  -- Generar número de socio único
  SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO member_num;
  
  -- Asegurar que sea único
  WHILE EXISTS (SELECT 1 FROM profiles WHERE member_number = member_num) LOOP
    SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO member_num;
  END LOOP;

  -- Insertar el perfil
  INSERT INTO public.profiles (id, email, member_number, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', 'no-email@example.com'),
    member_num,
    'user',
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Dar permisos a la función
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 4. Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Asegurar que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Recrear políticas RLS para profiles
-- Permitir inserción para usuarios autenticados (su propio perfil) y el trigger
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can do everything" ON profiles;
CREATE POLICY "Service role can do everything" ON profiles
  FOR ALL 
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir que usuarios autenticados inserten su propio perfil (para upsert)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 7. Dar permisos de ejecución
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON rewards TO authenticated, anon;
GRANT SELECT, INSERT ON stamps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_rewards TO authenticated;

-- 8. Verificar que todo está correcto
DO $$
BEGIN
  RAISE NOTICE '✅ Script ejecutado correctamente';
  RAISE NOTICE '✅ Función handle_new_user recreada';
  RAISE NOTICE '✅ Trigger on_auth_user_created recreado';
  RAISE NOTICE '✅ Políticas RLS actualizadas';
END $$;
