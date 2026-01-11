# ✅ Checklist Pre-Deploy a Vercel

Usa este checklist antes de desplegar en Vercel para asegurar que todo esté listo.

## 📋 Configuración del Proyecto

- [ ] **Variables de entorno configuradas en Vercel:**
  - `NEXT_PUBLIC_SUPABASE_URL` (URL de tu proyecto Supabase)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon key de Supabase)
  - `NEXT_PUBLIC_APP_URL` (URL de tu proyecto en Vercel, ej: `https://tu-proyecto.vercel.app`)

- [ ] **Supabase configurado:**
  - [ ] Migraciones SQL ejecutadas (`001_initial_schema.sql`, `002_add_phone_to_profiles.sql`, `003_fix_trigger_permissions.sql`, `004_fix_profile_update_after_creation.sql`)
  - [ ] Site URL configurado en Supabase Auth → URL Configuration con tu dominio de Vercel
  - [ ] Redirect URLs configuradas en Supabase Auth → URL Configuration

- [ ] **Código revisado:**
  - [ ] No hay referencias a `localhost` hardcodeadas
  - [ ] Todas las variables de entorno usan `NEXT_PUBLIC_*` si necesitan estar en el cliente
  - [ ] `.env.local` está en `.gitignore` (no se sube al repo)

## 🔧 Verificación Técnica

- [ ] **Build exitoso:**
  ```bash
  npm run build
  ```
  - Verifica que no haya errores de TypeScript
  - Verifica que no haya errores de linting

- [ ] **Sin errores de consola:**
  - Revisa que no haya warnings críticos
  - Los console.log/error son aceptables para debugging

- [ ] **Archivos importantes:**
  - [ ] `package.json` tiene todos los scripts necesarios
  - [ ] `next.config.js` está configurado correctamente
  - [ ] `vercel.json` existe (opcional, pero recomendado)

## 🗄️ Base de Datos

- [ ] **Migraciones ejecutadas en orden:**
  1. `001_initial_schema.sql`
  2. `002_add_phone_to_profiles.sql`
  3. `003_fix_trigger_permissions.sql`
  4. `004_fix_profile_update_after_creation.sql`

- [ ] **Políticas RLS verificadas:**
  - Ejecuta `SELECT * FROM pg_policies WHERE tablename = 'profiles';` en Supabase
  - Verifica que existan las políticas necesarias

- [ ] **Trigger verificado:**
  - Ejecuta `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';` en Supabase
  - Verifica que el trigger exista y esté activo

## 🚀 Deploy en Vercel

1. [ ] **Sube el código a Git:**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```

2. [ ] **Importa en Vercel:**
   - Conecta tu repositorio
   - Vercel detectará automáticamente que es Next.js

3. [ ] **Configura variables de entorno:**
   - Settings → Environment Variables
   - Agrega las 3 variables necesarias

4. [ ] **Primer deploy:**
   - Vercel construirá y desplegará automáticamente
   - Revisa los logs de build por errores

5. [ ] **Actualiza `NEXT_PUBLIC_APP_URL`:**
   - Después del primer deploy, actualiza la variable con tu URL real de Vercel
   - Esto hará un nuevo deploy automáticamente

## ✅ Post-Deploy

- [ ] **Verificar URLs:**
  - Login: `https://tu-dominio.vercel.app/auth/login`
  - Register: `https://tu-dominio.vercel.app/auth/register`
  - Dashboard: `https://tu-dominio.vercel.app/`

- [ ] **Probar funcionalidad:**
  - [ ] Registrar un nuevo usuario
  - [ ] Iniciar sesión
  - [ ] Verificar que se guarden nombre y teléfono
  - [ ] Probar QR code (si aplica)

- [ ] **Configurar dominio personalizado (opcional):**
  - Settings → Domains → Agregar dominio
  - Actualizar URLs en Supabase y variables de entorno

## 🐛 Solución de Problemas Comunes

### Build Fails
- Revisa los logs de build en Vercel
- Verifica errores de TypeScript: `npm run build` localmente
- Asegúrate de que todas las dependencias estén en `package.json`

### Error "Supabase not configured"
- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de que los nombres sean exactos (case-sensitive)
- Verifica que las variables no tengan espacios extras

### Error de CORS o "Failed to fetch"
- Verifica Site URL en Supabase Auth → URL Configuration
- Agrega tu dominio de Vercel a las URLs permitidas
- Asegúrate de que `NEXT_PUBLIC_APP_URL` tenga el valor correcto

### Base de datos no funciona
- Verifica que las migraciones SQL se ejecutaron
- Revisa los logs de Supabase
- Verifica las políticas RLS con `SELECT * FROM pg_policies;`

## 📝 Notas Finales

- **Variables de entorno**: En Vercel, las variables `NEXT_PUBLIC_*` se inyectan en build-time
- **Secrets**: Nunca uses `service_role` key en variables públicas
- **Logs**: Los console.log en producción aparecerán en los logs de Vercel
- **Cache**: Vercel cachea builds y deployments, puedes forzar un rebuild si es necesario

## 🔗 Enlaces Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
