-- Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  member_number TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('user', 'admin', 'staff')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de sellos
CREATE TABLE IF NOT EXISTS stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  collected_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de recompensas
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  required_stamps INTEGER NOT NULL,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de recompensas de usuario
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  member_num TEXT;
BEGIN
  -- Generar número de socio único (formato: 0001-9999)
  SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO member_num;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE member_number = member_num) LOOP
    SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO member_num;
  END LOOP;

  -- Insertar perfil (el trigger se ejecuta después de crear el usuario en auth.users,
  -- por lo que auth.uid() debería retornar NEW.id en este contexto)
  INSERT INTO public.profiles (id, email, member_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    member_num,
    'user'
  )
  ON CONFLICT (id) DO NOTHING; -- Evitar errores si el perfil ya existe
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log del error pero no fallar el registro de usuario
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Eliminar trigger si existe antes de crearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
-- IMPORTANTE: Usar políticas simples para evitar recursión infinita
-- Permitir que el trigger inserte perfiles (sin verificación que cause recursión)
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para admins: usar auth.jwt() para evitar recursión
-- IMPORTANTE: No usar EXISTS con profiles aquí porque causa recursión infinita
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    -- Permitir ver todos si es tu propio perfil (sin recursión)
    auth.uid() = id
    OR
    -- TODO: Implementar verificación de rol sin recursión
    -- Por ahora, esta política permite que los usuarios vean su propio perfil
    -- Los admins necesitarán una verificación diferente
    false  -- Temporalmente deshabilitado para evitar recursión
  );

-- Políticas para stamps
DROP POLICY IF EXISTS "Users can view own stamps" ON stamps;
CREATE POLICY "Users can view own stamps" ON stamps
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para stamps: evitar recursión
DROP POLICY IF EXISTS "Admins can view all stamps" ON stamps;
CREATE POLICY "Admins can view all stamps" ON stamps
  FOR SELECT USING (
    -- Por ahora, permitir que los usuarios vean sus propios stamps
    auth.uid() = user_id
    -- TODO: Agregar verificación de rol sin recursión
  );

DROP POLICY IF EXISTS "Admins can insert stamps" ON stamps;
CREATE POLICY "Admins can insert stamps" ON stamps
  FOR INSERT WITH CHECK (
    -- Por ahora, permitir a todos insertar stamps (ajustar según necesidades de seguridad)
    true
    -- TODO: Agregar verificación de rol sin recursión
  );

-- Políticas para rewards: evitar recursión
DROP POLICY IF EXISTS "Anyone can view active rewards" ON rewards;
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (
    -- Permitir ver recompensas activas a todos
    active = true
    -- TODO: Agregar verificación de rol admin sin recursión si es necesario
  );

-- Políticas para user_rewards
DROP POLICY IF EXISTS "Users can view own rewards" ON user_rewards;
CREATE POLICY "Users can view own rewards" ON user_rewards
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own rewards" ON user_rewards;
CREATE POLICY "Users can insert own rewards" ON user_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own rewards" ON user_rewards;
CREATE POLICY "Users can update own rewards" ON user_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_stamps_user_id ON stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_created_at ON stamps(created_at);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_member_number ON profiles(member_number);
