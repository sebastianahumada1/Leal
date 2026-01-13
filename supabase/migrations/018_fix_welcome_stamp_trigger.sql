-- Migración: Corregir trigger de estampa de bienvenida
-- Fecha: 2026-01-13
-- Objetivo: Eliminar actualización manual de current_stamps y usar la función de recalculo

-- ============================================================
-- CORREGIR FUNCIÓN DE ESTAMPA DE BIENVENIDA
-- ============================================================

-- El problema anterior era que el trigger actualizaba current_stamps manualmente,
-- lo cual podía causar desincronización. Ahora solo insertamos el stamp y 
-- llamamos a la función de recalculo para mantener consistencia.

CREATE OR REPLACE FUNCTION public.give_welcome_stamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar 1 stamp de bienvenida con status 'approved'
  INSERT INTO stamps (user_id, status)
  VALUES (NEW.id, 'approved');
  
  -- Recalcular current_stamps usando la función centralizada
  -- Esto garantiza que el conteo sea siempre correcto
  PERFORM public.update_user_stamp_count(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RECALCULAR CURRENT_STAMPS PARA USUARIOS EXISTENTES
-- ============================================================

-- Recalcular current_stamps para todos los usuarios para corregir
-- cualquier inconsistencia que haya quedado del trigger anterior
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM public.update_user_stamp_count(user_record.id);
  END LOOP;
  
  RAISE NOTICE 'current_stamps recalculado para todos los usuarios';
END $$;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

-- Comentario actualizado
COMMENT ON FUNCTION public.give_welcome_stamp() IS 'Da 1 estampa de bienvenida y recalcula current_stamps usando la función centralizada';

-- Verificación
SELECT '✅ Trigger de estampa de bienvenida corregido' as status
UNION ALL
SELECT '  - Eliminada actualización manual de current_stamps'
UNION ALL
SELECT '  - Ahora usa la función de recalculo centralizada'
UNION ALL
SELECT '  - current_stamps recalculado para todos los usuarios';
