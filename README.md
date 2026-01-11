# LEAL - Tarjeta de Fidelización PWA

Sistema de tarjeta de fidelización web (PWA) construido con Next.js, TypeScript, TailwindCSS y Supabase, optimizado para iPhone (Safari).

## Características

- ✅ PWA completamente funcional
- ✅ Roles: Usuario y Admin/Staff
- ✅ Diseño sistema LEAL (mexicano rústico)
- ✅ Optimizado para iPhone Safari
- ✅ Autenticación con Supabase
- ✅ Sistema de sellos y recompensas
- ✅ QR Code para escaneo
- ✅ Historial de transacciones
- ✅ Listo para desplegar en Vercel

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Backend**: Supabase (Auth + Database)
- **PWA**: Manifest + Service Worker
- **Iconos**: Material Symbols
- **Deploy**: Vercel

## 🚀 Desplegar en Vercel

Para desplegar rápidamente en Vercel, revisa [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) para instrucciones detalladas y [CHECKLIST_PRODUCCION.md](./CHECKLIST_PRODUCCION.md) para el checklist completo.

**Resumen rápido:**
1. Sube tu código a GitHub/GitLab/Bitbucket
2. Importa el proyecto en Vercel (detectará Next.js automáticamente)
3. Configura las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (actualiza después del primer deploy con tu URL de Vercel)
4. Ejecuta las migraciones SQL en Supabase (en orden):
   - `001_initial_schema.sql`
   - `002_add_phone_to_profiles.sql`
   - `003_fix_trigger_permissions.sql`
   - `004_fix_profile_update_after_creation.sql`
5. Configura Site URL en Supabase Auth → URL Configuration con tu dominio de Vercel
6. ¡Despliega!

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar Supabase

Ejecuta los siguientes SQL en tu proyecto Supabase:

```sql
-- Crear tabla de perfiles
CREATE TABLE profiles (
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
CREATE TABLE stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  collected_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de recompensas
CREATE TABLE rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  required_stamps INTEGER NOT NULL,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de recompensas de usuario
CREATE TABLE user_rewards (
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
  -- Generar número de socio único
  SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO member_num;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE member_number = member_num) LOOP
    SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO member_num;
  END LOOP;

  INSERT INTO public.profiles (id, email, member_number, role)
  VALUES (
    NEW.id,
    NEW.email,
    member_num,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Políticas para stamps
CREATE POLICY "Users can view own stamps" ON stamps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stamps" ON stamps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins can insert stamps" ON stamps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Políticas para rewards
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para user_rewards
CREATE POLICY "Users can view own rewards" ON user_rewards
  FOR SELECT USING (auth.uid() = user_id);
```

### 4. Generar iconos PWA

Necesitas crear los iconos en `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- apple-touch-icon.png (180x180)

Puedes usar herramientas como [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) para generarlos.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
├── app/
│   ├── auth/login/       # Página de login
│   ├── admin/            # Panel de administración
│   ├── rewards/          # Página de recompensas
│   ├── history/          # Historial de transacciones
│   ├── scan/[userId]/    # Página de escaneo (staff)
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Dashboard usuario
│   └── globals.css       # Estilos globales
├── components/
│   ├── UserDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── ProfileSection.tsx
│   ├── QRCard.tsx
│   ├── ProgressSection.tsx
│   └── ...
├── lib/
│   ├── supabase-server.ts
│   ├── supabase-client.ts
│   └── database.types.ts
└── public/
    ├── manifest.json
    └── icons/
```

## Roles

- **Usuario**: Puede ver su tarjeta, progreso, recompensas e historial
- **Staff**: Puede agregar sellos escaneando códigos QR
- **Admin**: Acceso completo incluyendo gestión de recompensas y usuarios

## Diseño LEAL

El sistema de diseño está basado en:
- Colores: Verde bosque (#14533D) y crema kraft (#C5B48F)
- Tipografías: Arvo (display) e Inter (sans-serif)
- Estilo: Rústico mexicano con bordes vintage

## Licencia

MIT
