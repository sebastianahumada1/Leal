# Instrucciones para Corregir el Error de Registro

## 🔴 Error Actual

```
AuthApiError: Database error saving new user
```

Este error ocurre porque el trigger que crea automáticamente el perfil del usuario está siendo bloqueado por las políticas RLS (Row Level Security).

## ✅ Solución

Necesitas ejecutar la migración SQL que corrige las políticas RLS para permitir que el trigger inserte perfiles.

### Paso 1: Ir al SQL Editor de Supabase

1. Ve a tu proyecto en https://supabase.com
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New Query**

### Paso 2: Ejecutar la Migración de Corrección

Copia y pega el siguiente SQL en el editor:

```sql
-- Fix: Agregar política RLS para permitir inserción de perfiles por el trigger
-- Este archivo corrige el error "Database error saving new user"

-- Asegurar que la función tenga los permisos correctos
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Agregar política para permitir inserción del trigger
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (
    -- Permitir inserción cuando el id coincide con auth.uid()
    -- En el contexto del trigger AFTER INSERT, auth.uid() retornará NEW.id
    auth.uid() = id
  );
```

### Paso 3: Ejecutar el SQL

1. Haz clic en **Run** (o presiona Ctrl+Enter)
2. Verifica que no haya errores

### Paso 4: Probar el Registro

1. Ve a tu aplicación en http://localhost:3000/auth/register
2. Intenta registrar un nuevo usuario
3. El registro debería funcionar correctamente ahora

## 🔍 Si Todavía Hay Problemas

Si después de ejecutar el SQL anterior el error persiste, intenta esta alternativa:

```sql
-- Alternativa: Permitir todas las inserciones (solo si la anterior no funciona)
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (true);
```

**Nota:** Esta política alternativa es menos restrictiva pero debería funcionar si la primera no lo hace.

## 📋 Verificación

Para verificar que la política se creó correctamente:

```sql
-- Ver todas las políticas de la tabla profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Deberías ver una política llamada `Trigger can insert profiles` con `cmd = 'INSERT'`.

## ⚠️ Importante

Después de ejecutar el SQL, **no necesitas reiniciar el servidor** de Next.js. Los cambios en la base de datos se aplican inmediatamente.

## 🆘 Problemas Comunes

### "policy already exists"
Si ves este error, significa que la política ya existe. Puedes ignorarlo o ejecutar primero:
```sql
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
```

### "permission denied"
Asegúrate de estar usando una cuenta con permisos de administrador en Supabase, o usa el **SQL Editor** en lugar de la **Table Editor**.

### El registro todavía falla
1. Verifica que ejecutaste el SQL correctamente
2. Verifica que la tabla `profiles` existe
3. Verifica que el trigger `on_auth_user_created` existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
