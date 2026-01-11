-- Agregar campo de teléfono a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
