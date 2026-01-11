# 🔢 Números de Socio Secuenciales

Esta guía explica cómo configurar los números de socio secuenciales en orden de registro.

---

## 📊 ¿Qué hace esta migración?

### Antes:
- ❌ Números aleatorios: 2853, 0145, 7892, etc.
- ❌ Sin orden lógico

### Después:
- ✅ Números secuenciales: 1, 2, 3, 4, 5...
- ✅ El primer usuario registrado = Socio #1
- ✅ El segundo usuario = Socio #2
- ✅ Y así sucesivamente...

---

## 🗄️ Ejecutar Migración en Supabase

### 1. Abrir SQL Editor
- Ve a tu proyecto en Supabase Dashboard
- Click en **SQL Editor**

### 2. Copiar y Ejecutar SQL

Copia y pega este script completo:

```sql
-- Migración: Números de socio secuenciales
-- El primer usuario registrado será socio #1, el segundo #2, etc.

-- 1. Crear secuencia para números de socio
CREATE SEQUENCE IF NOT EXISTS member_number_seq START WITH 1 INCREMENT BY 1;

-- 2. Actualizar números de miembros existentes basados en fecha de creación
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN 
        SELECT id 
        FROM profiles 
        ORDER BY created_at ASC
    LOOP
        UPDATE profiles 
        SET member_number = LPAD(counter::text, 4, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
    
    -- Ajustar la secuencia al siguiente número disponible
    PERFORM setval('member_number_seq', counter);
END $$;

-- 3. Actualizar el trigger para usar la secuencia
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, member_number, role)
    VALUES (
        NEW.id,
        NEW.email,
        LPAD(nextval('member_number_seq')::text, 4, '0'),
        'user'
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Si el perfil ya existe, no hacer nada
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar los números de socio actualizados
SELECT 
    member_number,
    full_name,
    email,
    created_at
FROM profiles
ORDER BY member_number::integer ASC
LIMIT 10;
```

### 3. Click en RUN ▶️

Deberías ver:
- Lista de usuarios con sus nuevos números de socio
- Usuario más antiguo = #0001 (Socio #1)
- Usuario más reciente = último número

---

## 🧪 Verificación

### Ver todos los números de socio actualizados:

```sql
SELECT 
    member_number as "Número de Socio",
    full_name as "Nombre",
    email as "Email",
    created_at as "Fecha de Registro"
FROM profiles
ORDER BY member_number::integer ASC;
```

### Ver el próximo número disponible:

```sql
SELECT 
    'Próximo socio será: #' || currval('member_number_seq')::text as info;
```

---

## 📝 Cambios en el Código

### ✅ Archivos Actualizados:

1. **`components/ProfileSection.tsx`**
   - Muestra el número sin ceros a la izquierda
   - Ejemplo: "0001" se muestra como "1", "0012" como "12"

2. **`app/auth/register/page.tsx`**
   - Ya no genera números aleatorios
   - El trigger de la BD asigna el número automáticamente

3. **`supabase/migrations/008_sequential_member_numbers.sql`**
   - Nueva migración con la secuencia

---

## 🔄 Cómo Funciona

### Para Usuarios Existentes:
1. La migración los ordena por `created_at`
2. Les asigna números: 1, 2, 3, 4...
3. El más antiguo recibe el #1

### Para Nuevos Usuarios:
1. Se registran normalmente
2. El trigger automáticamente les asigna el siguiente número
3. Si el último socio era #15, el nuevo será #16

---

## 🎯 Ejemplos

### Antes de la Migración:
```
Usuario A (registrado 2025-01-01) → Socio #2853
Usuario B (registrado 2025-01-05) → Socio #0145
Usuario C (registrado 2025-01-10) → Socio #7892
```

### Después de la Migración:
```
Usuario A (registrado 2025-01-01) → Socio #1 ✅
Usuario B (registrado 2025-01-05) → Socio #2 ✅
Usuario C (registrado 2025-01-10) → Socio #3 ✅
```

### Nuevo Usuario:
```
Usuario D (se registra hoy) → Socio #4 ✅ (automático)
```

---

## ⚠️ Importante

### ✅ Es Seguro:
- No afecta la autenticación
- No borra datos
- Solo reorganiza números de socio

### 🔐 Usuarios existentes:
- Sus números cambiarán para reflejar orden de registro
- Todos los sellos y recompensas se mantienen intactos
- La funcionalidad es exactamente la misma

### 📱 Frontend:
- No requiere cambios manuales
- Recarga la página y verás los nuevos números

---

## 🐛 Troubleshooting

### Error: "sequence does not exist"
**Solución:** La secuencia no se creó. Verifica que ejecutaste la primera parte del script.

### Los números no cambiaron
**Solución:** 
1. Verifica que ejecutaste TODO el script
2. Recarga la página en el navegador (F5)
3. Verifica en Supabase: `SELECT * FROM profiles ORDER BY member_number::integer;`

### El número de socio muestra "0"
**Solución:** El perfil no tiene `member_number` asignado. Ejecuta la migración.

---

## ✅ Checklist

- [ ] Ejecutar script en Supabase SQL Editor
- [ ] Verificar que los números se actualizaron correctamente
- [ ] Ver el resultado: `SELECT member_number, full_name FROM profiles ORDER BY member_number::integer;`
- [ ] Recargar la aplicación en el navegador
- [ ] Verificar que se muestra "Socio No. 1", "Socio No. 2", etc.

---

**Fecha:** 2026-01-10  
**Versión:** 2.0.0  
**Archivo:** `supabase/migrations/008_sequential_member_numbers.sql`
