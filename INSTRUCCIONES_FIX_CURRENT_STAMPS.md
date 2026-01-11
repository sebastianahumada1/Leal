# Instrucciones para Corregir current_stamps

## Problema
El usuario `307444c3-40fa-46c3-9927-3fc7c999aea3` tiene 2 stamps pero `current_stamps` muestra 3.

## Causa Probable
El campo `current_stamps` se calcula como:
```
current_stamps = stamps aprobados - stamps gastados en recompensas aprobadas
```

Puede haber quedado desincronizado debido a:
- Operaciones manuales en la base de datos
- Errores en los triggers
- Cambios en el status de stamps sin que se recalcule

## Solución

### Paso 1: Diagnosticar el problema

Ejecuta el script `diagnose_user_stamps.sql` en el SQL Editor de Supabase. Este script mostrará:
- El valor actual de `current_stamps`
- Todos los stamps del usuario con sus status
- Conteo de stamps por status
- Recompensas canjeadas
- El valor que **debería** tener `current_stamps` (cálculo manual)

### Paso 2: Corregir el problema

Ejecuta el script `fix_user_stamps.sql` en el SQL Editor de Supabase. Este script:
1. Asegura que la función `update_user_stamp_count` existe y funciona correctamente
2. Recalcula `current_stamps` para este usuario específico
3. Verifica que el valor se haya corregido

### Paso 3: Verificar

Después de ejecutar el script de corrección, verifica que:
- `current_stamps` ahora coincide con el cálculo manual
- El valor tiene sentido (no puede ser negativo)
- El usuario ve el número correcto en la aplicación

## Notas

- La función `update_user_stamp_count` usa `SECURITY DEFINER` para bypassear RLS y actualizar el perfil
- El cálculo garantiza que `current_stamps` nunca sea negativo (usa `GREATEST(..., 0)`)
- Los triggers deberían mantener `current_stamps` sincronizado automáticamente, pero si hay discrepancias, este script las corrige

## Para corregir otros usuarios

Si encuentras más usuarios con problemas similares, puedes ejecutar:

```sql
-- Corregir un usuario específico
SELECT public.update_user_stamp_count('USER_ID_AQUI');

-- O corregir todos los usuarios
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM public.update_user_stamp_count(user_record.id);
  END LOOP;
END $$;
```
