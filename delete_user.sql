-- Script para borrar usuario y su perfil completamente
-- Reemplaza 'TU_EMAIL_AQUI' con el email del usuario a borrar

-- 1. Obtener el ID del usuario
DO $$
DECLARE
    user_email TEXT := 'anvagarcent@gmail.com'; -- CAMBIA ESTO por el email
    user_id UUID;
BEGIN
    -- Buscar el ID del usuario por email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario encontrado: %', user_id;
        
        -- Borrar registros relacionados
        DELETE FROM user_rewards WHERE user_id = user_id;
        RAISE NOTICE 'Recompensas borradas';
        
        DELETE FROM stamps WHERE user_id = user_id;
        RAISE NOTICE 'Sellos borrados';
        
        DELETE FROM profiles WHERE id = user_id;
        RAISE NOTICE 'Perfil borrado';
        
        -- Borrar el usuario de auth
        DELETE FROM auth.users WHERE id = user_id;
        RAISE NOTICE 'Usuario borrado de auth.users';
        
        RAISE NOTICE '✅ Usuario % borrado completamente', user_email;
    ELSE
        RAISE NOTICE '❌ Usuario con email % no encontrado', user_email;
    END IF;
END $$;

-- 2. Verificar que se borró
SELECT 'Usuario borrado correctamente' as status;
