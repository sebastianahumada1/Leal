# Fix: Recursión Infinita en Políticas RLS

## 🔴 Error Actual

```
{code: '42P17', message: 'infinite recursion detected in policy for relation "profiles"'}
```

Este error ocurre porque las políticas RLS están verificando en la tabla `profiles` dentro de políticas sobre `profiles`, causando recursión infinita.

## ✅ Solución

Ejecuta este SQL en el **SQL Editor** de Supabase para corregir el problema:

```sql
-- Fix: Corregir recursión infinita en políticas RLS

-- 1. Corregir política de inserción (para el trigger)
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (true);

-- 2. Corregir política de actualización (evitar recursión)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Corregir políticas de admins (evitar consultar profiles)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
-- Temporalmente simplificada para evitar recursión
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id  -- Solo ver propio perfil por ahora
  );

-- 4. Corregir políticas de stamps (evitar recursión)
DROP POLICY IF EXISTS "Admins can view all stamps" ON stamps;
CREATE POLICY "Admins can view all stamps" ON stamps
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert stamps" ON stamps;
CREATE POLICY "Admins can insert stamps" ON stamps
  FOR INSERT WITH CHECK (true);  -- Temporalmente permitir a todos

-- 5. Corregir política de rewards
DROP POLICY IF EXISTS "Anyone can view active rewards" ON rewards;
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (active = true);
```

## 📋 Pasos Detallados

1. **Ve a Supabase SQL Editor**
   - Abre tu proyecto en https://supabase.com
   - Menú lateral → **SQL Editor**
   - Haz clic en **New Query**

2. **Copia y pega el SQL anterior**

3. **Ejecuta el SQL**
   - Haz clic en **Run** (o Ctrl+Enter)
   - Verifica que no haya errores

4. **Prueba el registro nuevamente**
   - Ve a http://localhost:3000/auth/register
   - Intenta registrar un nuevo usuario
   - El registro debería funcionar ahora

## 🔍 Explicación del Problema

El error de recursión infinita ocurría porque:

1. **Política "Admins can view all profiles"** estaba usando:
   ```sql
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
   ```
   Esto causa que cuando se intenta actualizar/insertar un perfil, la política verifica en `profiles`, lo cual activa nuevamente las políticas RLS, creando un ciclo infinito.

2. **La solución** es usar políticas más simples que no consulten `profiles` dentro de políticas sobre `profiles`.

## ⚠️ Nota sobre Seguridad

Las políticas temporales están simplificadas para evitar recursión. Para producción, considera:

1. Usar **roles personalizados** en Supabase Auth
2. Usar **funciones auxiliares** que no causen recursión
3. Usar **auth.jwt()** para verificar roles desde el token JWT

## ✅ Verificación

Después de ejecutar el SQL, verifica:

```sql
-- Ver todas las políticas de profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Deberías ver:
- `Trigger can insert profiles` con `cmd = 'INSERT'` y `qual = null`
- `Users can update own profile` con `cmd = 'UPDATE'`
- `Users can view own profile` con `cmd = 'SELECT'`
