# 🚀 GUÍA RÁPIDA DE DEPLOYMENT A VERCEL

## ⚡ Pasos Rápidos (5 minutos)

### 1️⃣ Pre-requisitos
- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Proyecto en Git (GitHub, GitLab, Bitbucket)
- ✅ Credenciales de Supabase listas

### 2️⃣ Deployment

#### Opción A: Desde Vercel Dashboard (Recomendado)

1. **Ir a Vercel Dashboard**
   ```
   https://vercel.com/new
   ```

2. **Importar Proyecto**
   - Click en "Import Project"
   - Seleccionar repositorio Git
   - Vercel detectará automáticamente Next.js

3. **Configurar Variables de Entorno**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
   ```

4. **Deploy**
   - Click en "Deploy"
   - Esperar 2-3 minutos
   - ✅ ¡Listo!

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy a producción
vercel --prod
```

---

## 🔐 Configurar Supabase

### 1. Habilitar RLS Policies

```sql
-- En Supabase SQL Editor, ejecutar:
-- Archivo: configure_rls_production.sql

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Crear políticas (ver archivo completo)
```

### 2. Configurar Email

1. Ir a **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Personalizar templates de:
   - Confirmación de email
   - Reset de contraseña
   - Cambio de email

3. Configurar SMTP (opcional):
   - **Settings** > **Auth** > **SMTP Settings**
   - O usar el servicio de email de Supabase

### 3. Configurar URL del Site

1. **Settings** > **Auth** > **Site URL**
   ```
   https://tu-proyecto.vercel.app
   ```

2. **Redirect URLs** (agregar):
   ```
   https://tu-proyecto.vercel.app/**
   https://tu-proyecto.vercel.app/auth/callback
   ```

---

## 🎨 Generar Iconos PWA (Opcional)

### Opción 1: PWA Builder (Recomendado)

1. Ir a https://www.pwabuilder.com/imageGenerator
2. Subir `public/logo-principal.png`
3. Descargar iconos generados
4. Extraer en `public/icons/`

### Opción 2: Manual

Crear estos tamaños desde `logo-principal.png`:
- 192x192 → `public/icons/icon-192x192.png`
- 512x512 → `public/icons/icon-512x512.png`

### Actualizar Manifest

Editar `app/manifest.ts`:

```typescript
icons: [
  {
    src: '/icons/icon-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any maskable',
  },
  {
    src: '/icons/icon-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any maskable',
  },
],
```

---

## ✅ Verificación Post-Deploy

### 1. Funcionalidad Básica
- [ ] Homepage carga correctamente
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Email de confirmación se envía
- [ ] Dashboard de usuario carga
- [ ] QR code se genera correctamente

### 2. PWA
- [ ] Manifest accesible en `/manifest.webmanifest`
- [ ] Iconos cargan sin 404
- [ ] Prompt de instalación aparece (móvil)

### 3. Performance
```bash
# Lighthouse en Chrome DevTools
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90
```

### 4. Mobile Testing
- [ ] Probar en iPhone Safari
- [ ] Probar en Android Chrome
- [ ] Verificar viewport
- [ ] Verificar touch interactions

---

## 🐛 Troubleshooting

### Error: "SUPABASE_NOT_CONFIGURED"
**Solución:** Verificar variables de entorno en Vercel Dashboard

### Error: "new row violates row-level security policy"
**Solución:** Ejecutar `configure_rls_production.sql` en Supabase

### Error: Email no se envía
**Solución:** 
1. Verificar SMTP configurado en Supabase
2. Revisar logs en Supabase Dashboard > Logs

### Error: 404 en iconos
**Solución:** Generar iconos PWA y actualizar `app/manifest.ts`

### Error: Redirect loop
**Solución:** 
1. Verificar `NEXT_PUBLIC_APP_URL` en variables de entorno
2. Verificar Site URL en Supabase Auth settings

---

## 🔄 Actualizaciones Futuras

### Deployment Automático
Vercel hace deploy automático en cada push a `main`:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# Vercel despliega automáticamente
```

### Preview Deployments
Cada PR crea un preview deployment:

```bash
git checkout -b feature/nueva-funcionalidad
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub
# Vercel crea preview URL automáticamente
```

---

## 📊 Monitoreo

### Vercel Analytics
1. Habilitar en **Project Settings** > **Analytics**
2. Ver métricas en tiempo real

### Supabase Logs
1. **Dashboard** > **Logs**
2. Filtrar por:
   - Auth logs
   - Database logs
   - API logs

---

## 🎯 Checklist Final

### Antes de Lanzar
- [ ] Variables de entorno configuradas
- [ ] RLS policies habilitadas
- [ ] Email configurado
- [ ] Iconos PWA generados
- [ ] Tests funcionales pasados
- [ ] Performance verificado (Lighthouse)
- [ ] Mobile testing completado

### Post-Lanzamiento
- [ ] Monitorear logs primeras 24h
- [ ] Verificar emails se envían
- [ ] Revisar analytics
- [ ] Recopilar feedback de usuarios

---

## 📞 Soporte

### Recursos
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

### Logs
```bash
# Ver logs en Vercel
vercel logs

# Ver logs en tiempo real
vercel logs --follow
```

---

## 🎉 ¡Listo!

Tu aplicación está en producción en:
```
https://tu-proyecto.vercel.app
```

**Próximos pasos:**
1. Compartir URL con usuarios
2. Monitorear performance
3. Recopilar feedback
4. Iterar y mejorar

---

**Última actualización:** 2026-01-10  
**Versión:** 2.0.0
