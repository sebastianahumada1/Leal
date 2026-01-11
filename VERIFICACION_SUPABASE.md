# Verificación de Configuración de Supabase

Este documento te ayudará a verificar y diagnosticar problemas con la configuración de Supabase.

## ✅ Checklist de Verificación

### 1. Archivo `.env.local` Existe

El archivo `.env.local` debe estar en la raíz del proyecto (misma carpeta que `package.json`).

**Verificación:**
```bash
# En PowerShell
Test-Path ".env.local"

# Debe retornar: True
```

### 2. Variables de Entorno Configuradas

El archivo `.env.local` debe contener estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Verificación:**
```bash
# En PowerShell
Get-Content .env.local | Select-String "SUPABASE"

# Debe mostrar ambas líneas
```

### 3. Valores NO son Placeholders

Asegúrate de que los valores NO contengan:
- `placeholder`
- `tu-proyecto`
- `tu-anon-key`

**Síntomas de valores placeholder:**
- Error: `Failed to fetch`
- Error: `ERR_NAME_NOT_RESOLVED`
- Error: `Supabase not configured`

### 4. Formato Correcto de la URL

La URL de Supabase debe tener este formato:
```
https://xxxxxxxxxxxxx.supabase.co
```

**Verificación:**
- Debe empezar con `https://`
- Debe terminar con `.supabase.co`
- No debe tener espacios o caracteres especiales

### 5. Formato Correcto de la Key

La `anon key` debe ser:
- Una cadena larga de caracteres alfanuméricos
- No debe tener espacios
- Generalmente empieza con `eyJ...`

**Verificación:**
- Copia la key desde Supabase > Settings > API > `anon public` key
- Pégala completamente sin espacios

### 6. Servidor Reiniciado

Después de crear o modificar `.env.local`, debes **reiniciar el servidor de desarrollo**.

**Pasos:**
1. Detén el servidor (Ctrl+C)
2. Inicia nuevamente: `npm run dev`

**Nota:** Next.js solo lee las variables de entorno al iniciar.

## 🔍 Diagnóstico de Errores Comunes

### Error: "Supabase not configured"

**Causa:** Las variables de entorno no están configuradas o contienen placeholders.

**Solución:**
1. Verifica que `.env.local` existe
2. Verifica que las variables están correctamente escritas
3. Reinicia el servidor

### Error: "Failed to fetch" o "ERR_NAME_NOT_RESOLVED"

**Causa:** La URL de Supabase es incorrecta o es un placeholder.

**Solución:**
1. Ve a tu proyecto en Supabase
2. Settings > API
3. Copia el "Project URL" completo
4. Pégalo en `.env.local`
5. Reinicia el servidor

### Error: "Invalid API key"

**Causa:** La `anon key` es incorrecta.

**Solución:**
1. Ve a tu proyecto en Supabase
2. Settings > API
3. Copia el "anon public" key completo
4. Pégalo en `.env.local`
5. Asegúrate de que no tenga espacios al inicio o final
6. Reinicia el servidor

### Error: "Table 'profiles' does not exist"

**Causa:** Las migraciones SQL no se han ejecutado.

**Solución:**
1. Ve a tu proyecto en Supabase
2. SQL Editor
3. Ejecuta el contenido de `supabase/migrations/001_initial_schema.sql`
4. Ejecuta el contenido de `supabase/migrations/002_add_phone_to_profiles.sql`

## 📝 Cómo Obtener las Credenciales

### Paso 1: Crear/Acceder a tu Proyecto
1. Ve a https://supabase.com
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto o selecciona uno existente

### Paso 2: Obtener la URL
1. En tu proyecto, ve a **Settings** (⚙️) en el menú lateral
2. Selecciona **API**
3. Busca la sección **Project URL**
4. Copia la URL (debe ser algo como `https://xxxxxxxxxxxxx.supabase.co`)

### Paso 3: Obtener la Anon Key
1. En la misma página (Settings > API)
2. Busca la sección **Project API keys**
3. Busca la key llamada **`anon` `public`**
4. Haz clic en el ícono de copiar o copia manualmente la key completa

### Paso 4: Crear el Archivo `.env.local`
1. En la raíz de tu proyecto, crea un archivo llamado `.env.local`
2. Agrega estas líneas (reemplaza con tus valores):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Paso 5: Reiniciar el Servidor
```bash
npm run dev
```

## ✅ Verificación Final

Después de configurar todo, verifica:

1. ✅ El archivo `.env.local` existe y tiene las 3 variables
2. ✅ Los valores NO son placeholders
3. ✅ La URL termina en `.supabase.co`
4. ✅ La key empieza con `eyJ`
5. ✅ El servidor fue reiniciado después de crear/modificar `.env.local`
6. ✅ Las migraciones SQL fueron ejecutadas en Supabase

## 🆘 Si Todavía Hay Problemas

1. **Verifica la consola del navegador** para mensajes de error específicos
2. **Verifica la terminal** donde corre `npm run dev` para errores
3. **Verifica los logs de Supabase** en tu proyecto
4. **Verifica que las migraciones SQL** se ejecutaron correctamente
