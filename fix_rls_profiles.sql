-- Script para arreglar políticas RLS de profiles
-- Ejecutar en Supabase SQL Editor

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;

-- 2. CREAR POLÍTICAS SIMPLES Y PERMISIVAS

-- Permitir que usuarios vean su propio perfil
CREATE POLICY "allow_select_own_profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Permitir que usuarios inserten su propio perfil
CREATE POLICY "allow_insert_own_profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- Permitir que usuarios actualicen su propio perfil
CREATE POLICY "allow_update_own_profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. DAR PERMISOS A LOS ROLES
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- 4. VERIFICACIÓN
SELECT 'Políticas RLS actualizadas correctamente' as status;
