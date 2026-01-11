# Guía de Configuración Rápida - LEAL PWA

## Pasos de Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a SQL Editor y ejecuta el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ve a Settings > API y copia:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Crear Usuario Admin Manualmente

Después de crear tu primer usuario en la app:

```sql
-- Reemplaza 'email@ejemplo.com' con el email de tu cuenta
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'email@ejemplo.com';
```

### 5. Generar Iconos PWA

Necesitas crear iconos en `public/icons/` con estos tamaños:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- apple-touch-icon.png (180x180)

Puedes usar herramientas online como:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

Visita http://localhost:3000

## Notas Importantes

- **iPhone Safari**: La PWA está optimizada para iPhone. Los usuarios pueden agregar a la pantalla de inicio desde Safari.
- **Roles**: 
  - `user`: Usuario regular (por defecto)
  - `staff`: Puede agregar sellos
  - `admin`: Acceso completo
- **Base de Datos**: El trigger automático crea un perfil cuando se registra un usuario en Supabase Auth.

## Testing en iPhone

1. Despliega la app (Vercel, Netlify, etc.)
2. Abre en Safari en iPhone
3. Toca el botón "Compartir" → "Agregar a Pantalla de Inicio"
4. La app se abrirá como una PWA standalone
