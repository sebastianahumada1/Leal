-- Migración: Corregir sistema de estampas
-- Fecha: 2026-01-13
-- Objetivo: Eliminar triggers conflictivos y configurar sistema correcto de estampas

-- ============================================================
-- 1. ELIMINAR TRIGGER PROBLEMÁTICO DE DELETE
-- ============================================================

-- Este trigger estaba modificando current_stamps directamente,
-- causando conflictos con la lógica de recalcular
DROP TRIGGER IF EXISTS trigger_decrement_stamp_on_delete ON stamps;
DROP FUNCTION IF EXISTS public.decrement_stamp_on_delete();

-- ============================================================
-- 2. MODIFICAR TRIGGER DE RECALCULAR STAMPS
-- ============================================================

-- El trigger anterior se ejecutaba en INSERT, causando recalculos innecesarios
-- cuando se creaba un stamp pendiente. Ahora solo se ejecuta en UPDATE o DELETE.
DROP TRIGGER IF EXISTS trigger_recalculate_stamp_count ON stamps;
CREATE TRIGGER trigger_recalculate_stamp_count
  AFTER UPDATE OF status OR DELETE ON stamps
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_stamp_count();

-- ============================================================
-- 3. CREAR TRIGGER PARA ESTAMPA DE BIENVENIDA
-- ============================================================

-- Cuando se crea un nuevo usuario, automáticamente recibe 1 estampa de bienvenida
CREATE OR REPLACE FUNCTION public.give_welcome_stamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar 1 stamp de bienvenida con status 'approved'
  INSERT INTO stamps (user_id, status)
  VALUES (NEW.id, 'approved');
  
  -- Inicializar current_stamps a 1 (la estampa de bienvenida)
  UPDATE profiles
  SET current_stamps = 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe (para evitar duplicados)
DROP TRIGGER IF EXISTS trigger_give_welcome_stamp ON profiles;

-- Crear trigger que se ejecuta DESPUÉS de insertar un perfil
CREATE TRIGGER trigger_give_welcome_stamp
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.give_welcome_stamp();

-- ============================================================
-- 4. RECALCULAR CURRENT_STAMPS PARA USUARIOS EXISTENTES
-- ============================================================

-- Recalcular current_stamps para todos los usuarios existentes
-- usando la lógica correcta: stamps aprobados - required_stamps de recompensas aprobadas
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
-- 5. VERIFICACIÓN FINAL
-- ============================================================

-- Comentarios para documentación
COMMENT ON FUNCTION public.give_welcome_stamp() IS 'Da 1 estampa de bienvenida automáticamente a usuarios nuevos';
COMMENT ON TRIGGER trigger_give_welcome_stamp ON profiles IS 'Ejecuta give_welcome_stamp() después de crear un perfil';

-- Verificación
SELECT '✅ Sistema de estampas corregido:' as status
UNION ALL
SELECT '  - Triggers conflictivos eliminados'
UNION ALL
SELECT '  - Trigger de recalcular ajustado (solo UPDATE/DELETE)'
UNION ALL
SELECT '  - Estampa de bienvenida configurada'
UNION ALL
SELECT '  - current_stamps recalculado para usuarios existentes';
