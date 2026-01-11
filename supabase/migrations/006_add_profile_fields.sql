-- Migración: Agregar campos de ciudad y foto de perfil
-- Fecha: 2026-01-10

-- Agregar campo city (ciudad)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'CDMX';

-- Agregar campo photo_url (URL de la foto de perfil)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN profiles.city IS 'Ciudad de residencia del usuario';
COMMENT ON COLUMN profiles.photo_url IS 'URL de la foto de perfil del usuario (Supabase Storage)';

-- Verificación
SELECT '✅ Campos city y photo_url agregados a profiles' as status;
