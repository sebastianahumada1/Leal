'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import ImmersiveHeader from '@/components/ImmersiveHeader';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!fullName.trim()) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError('El teléfono es requerido');
      setLoading(false);
      return;
    }

    if (!birthDate.trim()) {
      setError('La fecha de nacimiento es requerida');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Verificar configuración
    if (!isSupabaseConfigured()) {
      setError('Configuración incompleta: Por favor configura las variables de entorno de Supabase en .env.local');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      console.log('REGISTER: Registrando usuario:', email);

      // Registrar usuario con metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (signUpError) {
        console.error('REGISTER: Error:', signUpError);
        console.error('REGISTER: Error code:', signUpError.code);
        console.error('REGISTER: Error message:', signUpError.message);
        console.error('REGISTER: Error details:', signUpError.details);
        
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          setError('Este correo ya está registrado. Intenta iniciar sesión.');
        } else if (signUpError.message.includes('Database error')) {
          setError('Error de base de datos. Verifica que las políticas RLS estén configuradas correctamente.');
          console.error('REGISTER: Posible problema con políticas RLS o trigger');
        } else {
          setError(signUpError.message || 'Error al registrar usuario. Por favor intenta de nuevo.');
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('REGISTER: Usuario creado:', data.user.id);
        console.log('REGISTER: Guardando perfil con nombre:', fullName.trim(), 'y teléfono:', phone.trim());

        // Esperar un momento para que el trigger cree el perfil base
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Verificar que el perfil fue creado por el trigger
        let profileExists = false;
        let retries = 3;
        while (!profileExists && retries > 0) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, member_number')
            .eq('id', data.user.id)
            .single();
          
          if (existingProfile) {
            profileExists = true;
            console.log('REGISTER: Perfil creado por trigger:', existingProfile);
          } else {
            console.log('REGISTER: Esperando que el trigger cree el perfil...');
            await new Promise(resolve => setTimeout(resolve, 500));
            retries--;
          }
        }

        // Actualizar perfil con nombre, teléfono y fecha de nacimiento
        // El member_number ya fue asignado por el trigger con la secuencia
        const profileData: any = {
          id: data.user.id,
          email: email.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          birth_date: birthDate.trim(),
        };

        console.log('REGISTER: Datos a actualizar:', profileData);
        
        const { data: insertedProfile, error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.user.id)
          .select();

        if (profileError) {
          console.error('REGISTER: Error guardando perfil:', profileError);
          console.error('REGISTER: Código de error:', profileError.code);
          console.error('REGISTER: Detalles:', profileError.details);
          setError(`Error al guardar el perfil: ${profileError.message}`);
          setLoading(false);
          return;
        }

        console.log('REGISTER: Perfil actualizado exitosamente:', insertedProfile);

        // Verificar que se guardó correctamente
        const { data: verifyProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('REGISTER: Verificación del perfil guardado:', verifyProfile);

        // Verificar si hay sesión (no requiere confirmación de email)
        if (data.session) {
          console.log('REGISTER: Sesión activa, redirigiendo...');
          // Esperar un poco más para asegurar que todo se guardó
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = '/';
        } else {
          // Requiere confirmación de email
          console.log('REGISTER: Requiere confirmación de email');
          setSuccess(true);
          setLoading(false);
        }
      } else {
        setError('Error inesperado. Por favor intenta de nuevo.');
        setLoading(false);
      }
    } catch (err) {
      console.error('REGISTER: Error inesperado:', err);
      setError('Error de conexión. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  // Mostrar mensaje de éxito si requiere confirmación
  if (success) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-primary selection:bg-primary/30 antialiased">
        <div className="fixed inset-0 rustic-texture"></div>
        <ImmersiveHeader
          useLogo={true}
          logoImage="/logo-principal.png"
          logoAlt="LEAL Mexican Food"
        />
        <main className="flex-1 px-4 sm:px-6 flex flex-col items-center -mt-3 z-20 relative">
          <div className="card-blur backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-primary/20 shadow-lg max-w-[480px] w-full text-center">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">mark_email_read</span>
            <h2 className="text-xl font-display text-primary mb-4">¡Registro Exitoso!</h2>
            <p className="text-primary/80 font-body mb-6">
              Hemos enviado un correo de confirmación a <strong>{email}</strong>. 
              Por favor revisa tu bandeja de entrada y confirma tu cuenta.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 bg-primary text-background-dark font-display rounded hover:opacity-90 transition-opacity"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-primary selection:bg-primary/30 antialiased">
      {/* Textura Rustica de Fondo */}
      <div className="fixed inset-0 rustic-texture"></div>

      {/* Header Inmersivo */}
      <ImmersiveHeader
        useLogo={true}
        logoImage="/logo-principal.png"
        logoAlt="LEAL Mexican Food"
      />

      {/* Texto descriptivo */}
      <div className="px-4 sm:px-6 text-center z-20 relative -mt-4 sm:-mt-5 md:-mt-6 mb-4">
        <div className="card-blur backdrop-blur-sm p-4 sm:p-5 rounded-lg border border-primary/20 max-w-[480px] mx-auto">
          <p className="text-primary/90 text-sm sm:text-base font-body leading-relaxed">
            Te vas a unir a la <span className="font-bold">Familia Leal</span> adquiriendo tu tarjeta de fidelización con la que podrás redimir premios por tus visitas a nuestra casa.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 flex flex-col items-center z-20 relative">
        {/* Card de Registro */}
        <div className="card-blur backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl border border-primary/20 shadow-lg max-w-[480px] w-full">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Input
              label="Nombre Completo"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              autoComplete="name"
              required
            />

            <Input
              label="Teléfono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="55 1234 5678"
              autoComplete="tel"
              required
            />

            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />

            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              required
            />

            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            <PasswordInput
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {error && (
              <div className="text-red-400 text-sm font-body px-1 py-2 bg-red-400/10 border border-red-400/30 rounded">
                {error}
              </div>
            )}

            <div className="pt-2 pb-1">
              <Button
                type="submit"
                variant="distressed"
                size="lg"
                fullWidth
                disabled={loading}
                className="h-16 text-lg tracking-[0.15em]"
              >
                {loading ? 'Registrando...' : 'REGISTRARSE'}
              </Button>
            </div>
          </form>
        </div>

        {/* Sección de Login */}
        <div className="mt-8 flex flex-col items-center gap-4 pb-12 max-w-[480px] w-full">
          <div className="flex items-center gap-4 w-full">
            <div className="h-[1px] bg-primary/20 flex-1"></div>
            <span className="text-primary/40 text-xs font-body uppercase tracking-widest">
              O continúa con
            </span>
            <div className="h-[1px] bg-primary/20 flex-1"></div>
          </div>

          <p className="text-primary/90 text-base font-body mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/auth/login"
              className="text-primary font-bold underline decoration-primary underline-offset-4 ml-1 hover:opacity-80 transition-opacity font-body"
            >
              Inicia Sesión
            </Link>
          </p>

          <div className="mt-12 opacity-30 select-none">
            <span className="material-symbols-outlined text-4xl">person_add</span>
          </div>
        </div>
      </main>

      <div className="h-8 bg-background-dark"></div>
    </div>
  );
}
