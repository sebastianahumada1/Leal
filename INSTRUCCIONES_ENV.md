# ⚠️ IMPORTANTE: Configurar Variables de Entorno

El servidor necesita un archivo `.env.local` con las credenciales de Supabase para funcionar correctamente.

## Pasos Rápidos:

1. **Crea el archivo `.env.local`** en la raíz del proyecto con este contenido:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Obtén tus credenciales de Supabase:**
   - Ve a https://supabase.com
   - Crea un proyecto o usa uno existente
   - Ve a Settings > API
   - Copia el "Project URL" y el "anon public" key

3. **Ejecuta las migraciones SQL:**
   - Ve al SQL Editor en Supabase
   - Ejecuta el contenido del archivo `supabase/migrations/001_initial_schema.sql`

4. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

## Sin Supabase configurado:

Si ejecutas el servidor sin configurar Supabase, verás errores al intentar autenticarse o acceder a la base de datos. El servidor iniciará, pero las funcionalidades requerirán la configuración correcta.
