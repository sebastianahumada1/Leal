-- Migración: Agregar campos para registro de visitas con aprobación
-- Fecha: 2026-01-10

-- Agregar campo status (estado del sello: pendiente, aprobado, rechazado)
ALTER TABLE stamps ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Agregar campo amount (monto de la compra)
ALTER TABLE stamps ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Agregar campo location_code (código del local/caja donde se escaneó el QR)
ALTER TABLE stamps ADD COLUMN IF NOT EXISTS location_code TEXT;

-- Crear índice para búsqueda rápida de visitas pendientes
CREATE INDEX IF NOT EXISTS idx_stamps_status ON stamps(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_stamps_location ON stamps(location_code) WHERE location_code IS NOT NULL;

-- Actualizar stamps existentes para que tengan status 'approved' por defecto
UPDATE stamps SET status = 'approved' WHERE status IS NULL;

-- Comentarios para documentación
COMMENT ON COLUMN stamps.status IS 'Estado del sello: pending (pendiente de aprobación), approved (aprobado), rejected (rechazado)';
COMMENT ON COLUMN stamps.amount IS 'Monto de la compra en pesos mexicanos';
COMMENT ON COLUMN stamps.location_code IS 'Código único del local/caja donde se escaneó el QR';

-- Verificación
SELECT '✅ Campos status, amount y location_code agregados a tabla stamps' as status;
