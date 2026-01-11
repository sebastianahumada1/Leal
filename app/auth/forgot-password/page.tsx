'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import ImmersiveHeader from '@/components/ImmersiveHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Verificar configuración
    if (!isSupabaseConfigured()) {
      setError('Configuración incompleta: Por favor configura las variables de entorno de Supabase en .env.local');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      console.log('FORGOT_PASSWORD: Solicitando reset para:', email);

      // Obtener URL de la app para redirección
      const appUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const redirectTo = `${appUrl}/auth/reset-password`;

      // Enviar email de reset
      console.log('FORGOT_PASSWORD: URL de redirect:', redirectTo);
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        console.error('FORGOT_PASSWORD: Error completo:', resetError);
        console.error('FORGOT_PASSWORD: Error code:', resetError.code);
        console.error('FORGOT_PASSWORD: Error message:', resetError.message);
        console.error('FORGOT_PASSWORD: Error status:', resetError.status);
        console.error('FORGOT_PASSWORD: Error details:', JSON.stringify(resetError, null, 2));
        
        // Mensajes de error más específicos
        let errorMessage = resetError.message || 'Error desconocido';
        
        if (resetError.message?.includes('For security purposes, you can only request this once every 60 seconds')) {
          errorMessage = 'Por favor espera 60 segundos antes de solicitar otro reset';
        } else if (resetError.message?.includes('recovery email') || resetError.message?.includes('Error sending')) {
          errorMessage = `Error al enviar email: ${resetError.message}. Verifica: 1) Que el email esté registrado, 2) Configuración SMTP en Supabase, 3) Revisa los logs en Supabase Dashboard → Authentication → Logs`;
        } else if (resetError.code === 'email_not_confirmed') {
          errorMessage = 'El email no ha sido confirmado. Por favor confirma tu email primero.';
        } else if (resetError.code === 'user_not_found') {
          errorMessage = 'No existe una cuenta con este email. Verifica que el email sea correcto.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      console.log('FORGOT_PASSWORD: Respuesta exitosa:', data);

      console.log('FORGOT_PASSWORD: Email de reset enviado exitosamente');
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('FORGOT_PASSWORD: Error inesperado:', err);
      setError('Error de conexión. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

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
        {/* Card de Forgot Password */}
        <div className="card-blur backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl border border-primary/20 shadow-lg max-w-[480px] w-full">
          {success ? (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary">mail</span>
                </div>
                <h2 className="header-text text-2xl font-bold text-primary mb-2">
                  Email Enviado
                </h2>
                <p className="text-primary/80 text-sm font-body">
                  Hemos enviado un enlace para restablecer tu contraseña a{' '}
                  <span className="font-bold text-primary">{email}</span>
                </p>
                <p className="text-primary/60 text-sm font-body mt-4">
                  Revisa tu bandeja de entrada y haz clic en el enlace para continuar.
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
                    Volver al Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <h2 className="header-text text-2xl font-bold text-primary mb-2">
                  Recuperar Contraseña
                </h2>
                <p className="text-primary/70 text-sm font-body">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              <Input
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
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
                  {loading ? 'Enviando...' : 'ENVIAR ENLACE'}
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
            ¿Recuerdas tu contraseña?{' '}
            <Link
              href="/auth/login"
              className="text-primary font-bold underline decoration-primary underline-offset-4 ml-1 hover:opacity-80 transition-opacity font-body"
            >
              Inicia Sesión
            </Link>
          </p>

          <div className="mt-12 opacity-30 select-none">
            <span className="material-symbols-outlined text-4xl">lock_reset</span>
          </div>
        </div>
      </main>

      <div className="h-8 bg-background-dark"></div>
    </div>
  );
}
