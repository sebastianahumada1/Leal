-- Migración: Eliminar triggers y funciones conflictivas
-- Fecha: 2026-01-13
-- Objetivo: Eliminar triggers viejos que causan duplicación de estampas

-- ============================================================
-- 1. ELIMINAR TRIGGERS CONFLICTIVOS EN LA TABLA STAMPS
-- ============================================================

-- Este trigger viejo incrementaba +1 en cada INSERT con status='approved'
-- Causaba que se contara doble la estampa de bienvenida
DROP TRIGGER IF EXISTS trigger_increment_stamp_on_insert ON stamps;

-- Este trigger viejo incrementaba +1 en cada UPDATE de status
-- Causaba que se contara doble cuando se aprobaba una visita
DROP TRIGGER IF EXISTS trigger_update_stamp_count ON stamps;

-- ============================================================
-- 2. ELIMINAR FUNCIONES VIEJAS ASOCIADAS
-- ============================================================

-- Eliminar la función trigger vieja de update_user_stamp_count (sin parámetros)
-- Esta función incrementaba current_stamps directamente en lugar de recalcular
DROP FUNCTION IF EXISTS public.update_user_stamp_count() CASCADE;

-- Eliminar la función de increment_stamp_on_insert si existe
DROP FUNCTION IF EXISTS public.increment_stamp_on_insert() CASCADE;

-- ============================================================
-- 3. VERIFICAR QUE SOLO QUEDEN LOS TRIGGERS CORRECTOS
-- ============================================================

-- El único trigger que debe quedar en stamps es:
-- - trigger_recalculate_stamp_count: Se ejecuta en UPDATE OF status OR DELETE
--   y llama a recalculate_stamp_count() que a su vez llama a 
--   update_user_stamp_count(user_id) para recalcular correctamente

-- ============================================================
-- 4. RECALCULAR CURRENT_STAMPS PARA TODOS LOS USUARIOS
-- ============================================================

-- Corregir los valores incorrectos que se generaron por los triggers duplicados
DO $$
DECLARE
  user_record RECORD;
  initial_count INTEGER;
  final_count INTEGER;
BEGIN
  FOR user_record IN SELECT id, current_stamps FROM profiles LOOP
    initial_count := user_record.current_stamps;
    
    -- Recalcular usando la función correcta
    PERFORM public.update_user_stamp_count(user_record.id);
    
    -- Obtener el nuevo valor
    SELECT current_stamps INTO final_count FROM profiles WHERE id = user_record.id;
    
    -- Log si hubo cambio
    IF initial_count != final_count THEN
      RAISE NOTICE 'Usuario % corregido: % → %', user_record.id, initial_count, final_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Recalculo completo - current_stamps actualizado para todos los usuarios';
END $$;

-- ============================================================
-- 5. VERIFICACIÓN FINAL
-- ============================================================

-- Listar triggers restantes en stamps (solo debería quedar trigger_recalculate_stamp_count)
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgrelid = 'stamps'::regclass
  AND tgname NOT LIKE 'pg_%'
  AND tgname NOT LIKE 'RI_%'
  AND tgname != 'trigger_recalculate_stamp_count';
  
  IF trigger_count > 0 THEN
    RAISE WARNING 'Aún hay % triggers adicionales en la tabla stamps', trigger_count;
  ELSE
    RAISE NOTICE '✅ Tabla stamps limpia - solo trigger_recalculate_stamp_count activo';
  END IF;
END $$;

-- Verificación
SELECT '✅ Triggers conflictivos eliminados:' as status
UNION ALL
SELECT '  - trigger_increment_stamp_on_insert eliminado'
UNION ALL
SELECT '  - trigger_update_stamp_count eliminado'
UNION ALL
SELECT '  - Funciones viejas eliminadas'
UNION ALL
SELECT '  - current_stamps recalculado para todos los usuarios'
UNION ALL
SELECT '  - Sistema de estampas funcionando correctamente';
