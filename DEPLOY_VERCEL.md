# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar el proyecto LEAL en Vercel.

## 📋 Prerequisitos

1. Una cuenta en [Vercel](https://vercel.com)
2. Un proyecto en [Supabase](https://supabase.com)
3. El código del proyecto en GitHub, GitLab o Bitbucket

## 🚀 Pasos para Desplegar

### 1. Preparar el Proyecto

Asegúrate de que tu código esté en un repositorio Git:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### 2. Crear Proyecto en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta (puedes usar GitHub)
3. Haz clic en **"Add New..."** → **"Project"**
4. Importa tu repositorio

### 3. Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agrega estas variables de entorno:

**Variables Requeridas:**
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

**Pasos:**
1. En el dashboard del proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega cada variable:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key de Supabase
   - `NEXT_PUBLIC_APP_URL`: URL de tu proyecto en Vercel (se actualizará automáticamente después del primer deploy)

### 4. Configurar Supabase

Asegúrate de que en Supabase esté configurado:

1. **Site URL** en Authentication → URL Configuration:
   - Agrega tu dominio de Vercel: `https://tu-dominio.vercel.app`
   - Agrega URLs de redirección: `https://tu-dominio.vercel.app/**`

2. **Ejecutar migraciones SQL**:
   - Ve a SQL Editor en Supabase
   - Ejecuta `supabase/migrations/001_initial_schema.sql`
   - Ejecuta `supabase/migrations/002_add_phone_to_profiles.sql`
   - Ejecuta `supabase/migrations/003_fix_trigger_permissions.sql`
   - Ejecuta `supabase/migrations/004_fix_profile_update_after_creation.sql`

### 5. Desplegar

1. Haz clic en **"Deploy"** en Vercel
2. Vercel construirá y desplegará tu proyecto automáticamente
3. Una vez completado, recibirás una URL: `https://tu-proyecto.vercel.app`

### 6. Actualizar URL en Variables de Entorno

Después del primer deploy:

1. Ve a **Settings** → **Environment Variables** en Vercel
2. Actualiza `NEXT_PUBLIC_APP_URL` con tu URL de Vercel
3. Haz un nuevo deploy (Vercel lo hará automáticamente al detectar cambios)

## 🔧 Configuración Adicional

### Dominio Personalizado (Opcional)

1. En Vercel, ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

### Actualizar Supabase con el Dominio Final

Después de configurar tu dominio:

1. En Supabase → Authentication → URL Configuration
2. Actualiza **Site URL** con tu dominio personalizado
3. Actualiza las **Redirect URLs** si es necesario

## ✅ Verificación Post-Deploy

1. **Probar registro**: Ve a `https://tu-dominio.vercel.app/auth/register`
2. **Probar login**: Ve a `https://tu-dominio.vercel.app/auth/login`
3. **Verificar PWA**: Abre en móvil y prueba "Agregar a pantalla de inicio"

## 🐛 Solución de Problemas

### Error: "Supabase not configured"
- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de que los nombres de las variables sean exactos (case-sensitive)

### Error: "Failed to fetch" o CORS
- Verifica la configuración de Site URL en Supabase
- Asegúrate de que tu dominio de Vercel esté agregado en Supabase Auth → URL Configuration

### Error: "Database error"
- Verifica que las migraciones SQL se ejecutaron correctamente
- Revisa los logs de Supabase para errores específicos

### Build Fails
- Revisa los logs de build en Vercel
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que no haya errores de TypeScript

## 📝 Notas Importantes

- **Variables de entorno**: Todas las variables `NEXT_PUBLIC_*` son públicas y se incluyen en el bundle del cliente
- **Secrets**: Nunca agregues `service_role` key en variables públicas
- **URLs**: Actualiza `NEXT_PUBLIC_APP_URL` después del primer deploy con tu URL real
- **Migraciones**: Ejecuta todas las migraciones SQL en Supabase antes de usar la app en producción

## 🔄 Deploy Automático

Vercel despliega automáticamente cuando:
- Haces push a la rama principal
- Creas un pull request
- Haces cambios en el código

Puedes deshabilitar esto en **Settings** → **Git** si prefieres deploys manuales.
