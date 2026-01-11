-- Migración: Crear bucket de Storage para fotos de perfil
-- Fecha: 2026-01-10
-- NOTA: Si el bucket ya existe, solo crea las políticas

-- Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- ELIMINAR políticas viejas si existen
DROP POLICY IF EXISTS "Users can upload own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete photos" ON storage.objects;

-- CREAR políticas nuevas (más permisivas)
-- Política: Todos pueden ver las fotos (públicas)
CREATE POLICY "Public can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Política: Usuarios autenticados pueden subir fotos
CREATE POLICY "Authenticated can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

-- Política: Usuarios autenticados pueden actualizar fotos
CREATE POLICY "Authenticated can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');

-- Política: Usuarios autenticados pueden eliminar fotos
CREATE POLICY "Authenticated can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');

-- Verificación
SELECT '✅ Bucket profile-photos creado/actualizado con políticas de seguridad' as status;
