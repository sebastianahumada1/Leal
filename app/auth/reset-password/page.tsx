'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import ImmersiveHeader from '@/components/ImmersiveHeader';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);

  useEffect(() => {
    // Verificar que hay una sesión válida (token en el hash)
    // Supabase maneja automáticamente el token en el hash de la URL
    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        setError('Configuración incompleta');
        setValidatingToken(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // Escuchar eventos de autenticación para detectar PASSWORD_RECOVERY
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('RESET_PASSWORD: Auth event:', event);
          console.log('RESET_PASSWORD: Session:', session ? 'existe' : 'no existe');
          
          if (event === 'PASSWORD_RECOVERY' || session) {
            console.log('RESET_PASSWORD: Token procesado correctamente, sesión disponible');
            setValidatingToken(false);
          }
        });

        // Verificar sesión inicial
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('RESET_PASSWORD: Sesión inicial:', session ? 'existe' : 'no existe');
        console.log('RESET_PASSWORD: URL hash:', window.location.hash);

        if (sessionError) {
          console.error('RESET_PASSWORD: Error obteniendo sesión:', sessionError);
          console.error('RESET_PASSWORD: Error code:', sessionError.code);
          console.error('RESET_PASSWORD: Error message:', sessionError.message);
        }

        if (session) {
          // Ya hay sesión, el token fue procesado
          console.log('RESET_PASSWORD: Sesión encontrada, usuario:', session.user.id);
          setValidatingToken(false);
          subscription.unsubscribe();
        } else {
          // No hay sesión aún, esperar a que Supabase procese el hash
          // Si hay hash en la URL, Supabase lo procesará automáticamente
          const hasHash = window.location.hash && window.location.hash.length > 0;
          console.log('RESET_PASSWORD: No hay sesión inicial, hash presente:', hasHash);
          
          if (hasHash) {
            // Esperar a que Supabase procese el hash (máximo 3 segundos)
            let retries = 0;
            const maxRetries = 6; // 3 segundos total (500ms * 6)
            
            const checkInterval = setInterval(async () => {
              retries++;
              const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
              
              console.log(`RESET_PASSWORD: Intento ${retries}/${maxRetries}, sesión:`, retrySession ? 'existe' : 'no existe');
              
              if (retrySession) {
                console.log('RESET_PASSWORD: Sesión encontrada después de procesar hash');
                setValidatingToken(false);
                clearInterval(checkInterval);
                subscription.unsubscribe();
              } else if (retries >= maxRetries) {
                console.error('RESET_PASSWORD: Timeout esperando sesión');
                if (retryError) {
                  console.error('RESET_PASSWORD: Error en retry:', retryError);
                }
                setError('Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.');
                setValidatingToken(false);
                clearInterval(checkInterval);
                subscription.unsubscribe();
              }
            }, 500);
            
            // Cleanup
            return () => {
              clearInterval(checkInterval);
              subscription.unsubscribe();
            };
          } else {
            // No hay hash, el token no está presente
            console.error('RESET_PASSWORD: No hay hash en la URL');
            setError('Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.');
            setValidatingToken(false);
            subscription.unsubscribe();
          }
        }
      } catch (err) {
        console.error('RESET_PASSWORD: Error validando token:', err);
        setError('Error al validar el token. Por favor intenta de nuevo.');
        setValidatingToken(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validaciones
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

      // Verificar que hay sesión (token válido)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.');
        setLoading(false);
        return;
      }

      console.log('RESET_PASSWORD: Actualizando contraseña para usuario:', session.user.id);

      // Actualizar contraseña
      console.log('RESET_PASSWORD: Intentando actualizar contraseña...');
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('RESET_PASSWORD: Error actualizando contraseña:', updateError);
        console.error('RESET_PASSWORD: Error code:', updateError.code);
        console.error('RESET_PASSWORD: Error message:', updateError.message);
        console.error('RESET_PASSWORD: Error status:', updateError.status);
        console.error('RESET_PASSWORD: Error details:', JSON.stringify(updateError, null, 2));
        
        let errorMessage = updateError.message || 'Error al actualizar la contraseña. Por favor intenta de nuevo.';
        
        if (updateError.message?.includes('session')) {
          errorMessage = 'La sesión ha expirado. Por favor solicita un nuevo enlace de recuperación.';
        } else if (updateError.code === 'invalid_credentials') {
          errorMessage = 'Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      console.log('RESET_PASSWORD: Contraseña actualizada exitosamente:', updateData);

      console.log('RESET_PASSWORD: Contraseña actualizada exitosamente');
      setSuccess(true);
      setLoading(false);

      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      console.error('RESET_PASSWORD: Error inesperado:', err);
      setError('Error de conexión. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-primary selection:bg-primary/30 antialiased">
        <div className="fixed inset-0 rustic-texture"></div>
        <ImmersiveHeader
          useLogo={true}
          logoImage="/logo-principal.png"
          logoAlt="LEAL Mexican Food"
        />
        <main className="flex-1 px-4 sm:px-6 flex flex-col items-center -mt-3 sm:-mt-4 md:-mt-5 z-20 relative">
          <div className="card-blur backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl border border-primary/20 shadow-lg max-w-[480px] w-full text-center">
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="material-symbols-outlined text-4xl text-primary animate-pulse">lock</span>
              <p className="text-primary/80 text-sm font-body">Validando token...</p>
            </div>
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

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 flex flex-col items-center -mt-3 sm:-mt-4 md:-mt-5 z-20 relative">
        {/* Card de Reset Password */}
        <div className="card-blur backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl border border-primary/20 shadow-lg max-w-[480px] w-full">
          {success ? (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
                </div>
                <h2 className="header-text text-2xl font-bold text-primary mb-2">
                  Contraseña Actualizada
                </h2>
                <p className="text-primary/80 text-sm font-body">
                  Tu contraseña ha sido restablecida exitosamente.
                </p>
                <p className="text-primary/60 text-sm font-body mt-4">
                  Serás redirigido al login en un momento...
                </p>
              </div>

              <div className="pt-2 pb-1">
                <Link href="/auth/login">
                  <Button
                    type="button"
                    variant="distressed"
                    size="lg"
                    fullWidth
                    className="h-16 text-lg tracking-[0.15em]"
                  >
                    Ir al Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <h2 className="header-text text-2xl font-bold text-primary mb-2">
                  Nueva Contraseña
                </h2>
                <p className="text-primary/70 text-sm font-body">
                  Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
                </p>
              </div>

              <PasswordInput
                label="Nueva Contraseña"
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
                  {loading ? 'Actualizando...' : 'RESTABLECER CONTRASEÑA'}
                </Button>
              </div>
            </form>
          )}
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
            ¿Recordaste tu contraseña?{' '}
            <Link
              href="/auth/login"
              className="text-primary font-bold underline decoration-primary underline-offset-4 ml-1 hover:opacity-80 transition-opacity font-body"
            >
              Inicia Sesión
            </Link>
          </p>

          <div className="mt-12 opacity-30 select-none">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
        </div>
      </main>

      <div className="h-8 bg-background-dark"></div>
    </div>
  );
}
