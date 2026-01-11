# 📸 Configuración de Fotos de Perfil

Esta guía explica cómo configurar el sistema de fotos de perfil en Supabase.

---

## 🗄️ Migración de Base de Datos

### 1. Agregar Campos a Profiles

Ejecutar en **Supabase SQL Editor**:

```sql
-- Archivo: supabase/migrations/006_add_profile_fields.sql

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'CDMX';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
```

---

## 📦 Configuración de Storage

### 2. Crear Bucket para Fotos

Ejecutar en **Supabase SQL Editor**:

```sql
-- Archivo: supabase/migrations/007_create_storage_bucket.sql
-- Crear bucket público para fotos de perfil

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;
```

### 3. Configurar Políticas de Seguridad

```sql
-- Los usuarios pueden subir su propia foto
CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Los usuarios pueden actualizar su propia foto
CREATE POLICY "Users can update own profile photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
)
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Los usuarios pueden eliminar su propia foto
CREATE POLICY "Users can delete own profile photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Todos pueden ver las fotos (públicas)
CREATE POLICY "Public can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

---

## 🔧 Configuración Manual (Alternativa)

Si prefieres configurar desde el Dashboard de Supabase:

### Paso 1: Crear Bucket
1. Ve a **Storage** en el panel de Supabase
2. Click en **New bucket**
3. Configuración:
   - **Name:** `profile-photos`
   - **Public:** ✅ Yes
   - **File size limit:** 5MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/jpg`
4. Click en **Create bucket**

### Paso 2: Configurar Políticas
1. Selecciona el bucket `profile-photos`
2. Ve a **Policies**
3. Click en **New policy**
4. Crea las 4 políticas mencionadas arriba

---

## 🧪 Verificación

### 1. Verificar Campos en Profiles
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('city', 'photo_url');
```

Debe retornar:
```
city      | text | 'CDMX'::text
photo_url | text | NULL
```

### 2. Verificar Bucket
```sql
SELECT * FROM storage.buckets WHERE id = 'profile-photos';
```

Debe retornar un registro con:
- `id`: profile-photos
- `public`: true
- `file_size_limit`: 5242880

### 3. Verificar Políticas
```sql
SELECT policyname
FROM storage.policies
WHERE bucket_id = 'profile-photos';
```

Debe mostrar las 4 políticas creadas.

---

## 🎨 Funcionalidades Implementadas

### En el Frontend

**Componente:** `ProfilePhotoUpload.tsx`
- ✅ Subida de fotos (JPEG, PNG, WebP)
- ✅ Preview en tiempo real
- ✅ Límite de 5MB
- ✅ Compresión automática en el navegador (opcional)
- ✅ Actualización en la base de datos

**Página:** `/profile/edit`
- ✅ Edición completa de perfil
- ✅ Cambio de foto de perfil
- ✅ Actualización de datos personales
- ✅ Cambio de contraseña
- ✅ Selección de ciudad
- ✅ Cerrar sesión

---

## 📁 Estructura de Archivos en Storage

```
profile-photos/
└── avatars/
    ├── {userId}-{random}.jpg
    ├── {userId}-{random}.png
    └── {userId}-{random}.webp
```

**Ejemplo:**
```
profile-photos/avatars/abc123-xyz789.jpg
```

---

## 🔐 Seguridad

### Políticas RLS
- ✅ Los usuarios solo pueden subir/actualizar/eliminar sus propias fotos
- ✅ Las fotos son públicas (accesibles por URL)
- ✅ Límite de tamaño: 5MB
- ✅ Solo formatos de imagen permitidos

### Validación
- ✅ Validación de tipo MIME en el backend (Supabase)
- ✅ Validación de tamaño en el frontend y backend
- ✅ Nombres de archivo únicos (userId + random)

---

## 🐛 Troubleshooting

### Error: "Bucket not found"
**Solución:** Ejecutar el script `007_create_storage_bucket.sql`

### Error: "new row violates row-level security policy"
**Solución:** Verificar que las políticas estén creadas correctamente

### Error: "File too large"
**Solución:** La foto debe ser menor a 5MB. Comprimir antes de subir.

### Error: "Invalid file type"
**Solución:** Solo se permiten: JPEG, PNG, WebP, JPG

### Las fotos no se ven
**Solución:** 
1. Verificar que el bucket sea público
2. Verificar la política "Public can view profile photos"
3. Verificar que la URL en la BD sea correcta

---

## 🚀 Deploy a Producción

### Checklist
- [ ] Ejecutar migración `006_add_profile_fields.sql`
- [ ] Ejecutar migración `007_create_storage_bucket.sql`
- [ ] Verificar que el bucket sea público
- [ ] Verificar políticas de seguridad
- [ ] Probar subida de foto
- [ ] Probar actualización de perfil
- [ ] Verificar que las URLs sean accesibles

---

## 📚 Referencias

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase RLS for Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

**Fecha:** 2026-01-10  
**Versión:** 2.0.0
