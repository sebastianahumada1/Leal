-- Migración: Agregar campo birth_date a profiles
-- Fecha: 2026-01-13

-- Agregar columna birth_date a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Agregar comentario
COMMENT ON COLUMN profiles.birth_date IS 'Fecha de nacimiento del usuario';

-- Verificación
SELECT '✅ Campo birth_date agregado a profiles' as status;
