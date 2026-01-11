-- ========================================
-- FIX: Políticas de Storage para profile-photos
-- Ejecutar en Supabase SQL Editor
-- ========================================

-- 1. ELIMINAR políticas existentes (si hay conflictos)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;

-- 2. CREAR políticas nuevas y permisivas
-- Permitir a todos ver las fotos (lectura pública)
CREATE POLICY "Public can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Permitir a usuarios autenticados subir fotos
CREATE POLICY "Authenticated can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

-- Permitir a usuarios autenticados actualizar fotos
CREATE POLICY "Authenticated can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');

-- Permitir a usuarios autenticados eliminar fotos
CREATE POLICY "Authenticated can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');

-- 3. VERIFICAR que las políticas se crearon
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%photo%';

-- Debería mostrar 4 políticas:
-- 1. Public can view profile photos
-- 2. Authenticated can upload photos
-- 3. Authenticated can update photos
-- 4. Authenticated can delete photos

SELECT '✅ Políticas de Storage configuradas correctamente' as status;
