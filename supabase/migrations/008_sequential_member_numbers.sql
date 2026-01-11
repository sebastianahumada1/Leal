-- Migración: Números de socio secuenciales
-- Fecha: 2026-01-10
-- El primer usuario registrado será socio #1, el segundo #2, etc.

-- 1. Crear secuencia para números de socio
CREATE SEQUENCE IF NOT EXISTS member_number_seq START WITH 1 INCREMENT BY 1;

-- 2. Actualizar números de miembros existentes basados en fecha de creación
-- Los usuarios más antiguos tendrán números más bajos
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

-- 5. Verificar el valor actual de la secuencia
SELECT 
    'Próximo número de socio: ' || currval('member_number_seq')::text as info;

SELECT '✅ Números de socio secuenciales configurados correctamente' as status;
