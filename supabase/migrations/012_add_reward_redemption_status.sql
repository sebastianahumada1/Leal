-- Migración: Agregar campo status a user_rewards para manejar aprobación de canjes
-- Fecha: 2026-01-13

-- Agregar campo status si no existe
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'redemption_status') THEN
        CREATE TYPE public.redemption_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- Agregar columna status a user_rewards
DO $$ BEGIN
    ALTER TABLE user_rewards ADD COLUMN status public.redemption_status DEFAULT 'pending';
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'La columna status ya existe en user_rewards';
END $$;

-- Actualizar registros existentes que tienen redeemed_at a 'approved'
UPDATE user_rewards SET status = 'approved' WHERE redeemed_at IS NOT NULL AND (status IS NULL OR status = 'pending');

-- Agregar comentario
COMMENT ON COLUMN user_rewards.status IS 'Estado del canje: pending (pendiente de aprobación), approved (aprobado), rejected (rechazado)';

-- Verificación
SELECT '✅ Campo status agregado a user_rewards' as status;
