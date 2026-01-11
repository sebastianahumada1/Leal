'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import ImmersiveHeader from '@/components/ImmersiveHeader';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Verificar configuración
    if (!isSupabaseConfigured()) {
      setError('Configuración incompleta: Por favor configura las variables de entorno de Supabase en .env.local');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      console.log('LOGIN: Iniciando sesión para:', email);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('LOGIN: Error:', signInError.message);
        setError(signInError.message === 'Invalid login credentials' 
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : signInError.message);
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        console.log('LOGIN: Sesión creada exitosamente para:', data.user.id);
        console.log('LOGIN: Session access_token:', data.session.access_token.substring(0, 20) + '...');
        
        // Verificar cookies en el navegador
        console.log('LOGIN: Cookies actuales:', document.cookie);
        
        // Esperar un momento para que las cookies se establezcan
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar que la sesión esté establecida
        const { data: { session: checkSession } } = await supabase.auth.getSession();
        console.log('LOGIN: Sesión verificada:', checkSession ? 'OK ✓' : 'FALLO ✗');
        console.log('LOGIN: Cookies después:', document.cookie);
        
        // Obtener rol del usuario para determinar redirección
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('LOGIN: Error obteniendo perfil:', profileError);
          // Si hay error obteniendo el perfil, redirigir a home
          window.location.href = '/';
          return;
        }

        // Redirigir según el rol:
        // - staff → /staff
        // - admin → /admin
        // - user → / (dashboard normal)
        let redirectTo = '/';
        if (profile?.role === 'staff') {
          redirectTo = '/staff';
        } else if (profile?.role === 'admin') {
          redirectTo = '/admin';
        }
        
        console.log('LOGIN: Rol obtenido:', profile?.role || 'user');
        console.log('LOGIN: Redirigiendo a:', redirectTo);
        
        // Redirigir inmediatamente con replace para evitar problemas de navegación
        console.log('LOGIN: ⚡ Redirigiendo...');
        window.location.replace(redirectTo);
      } else {
        setError('Error inesperado. Por favor intenta de nuevo.');
        setLoading(false);
      }
    } catch (err) {
      console.error('LOGIN: Error inesperado:', err);
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
        {/* Card de Login */}
        <div className="card-blur backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl border border-primary/20 shadow-lg max-w-[480px] w-full">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="text-red-400 text-sm font-body px-1 py-2 bg-red-400/10 border border-red-400/30 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end px-1 pt-1 pb-2">
              <a
                href="#"
                className="text-primary/80 text-sm font-body hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className="pt-2 pb-1">
              <Button
                type="submit"
                variant="distressed"
                size="lg"
                fullWidth
                disabled={loading}
                className="h-16 text-lg tracking-[0.15em]"
              >
                {loading ? 'Iniciando...' : 'INICIAR SESIÓN'}
              </Button>
            </div>
          </form>
        </div>

        {/* Sección de Registro */}
        <div className="mt-8 flex flex-col items-center gap-4 pb-12 max-w-[480px] w-full">
          <div className="flex items-center gap-4 w-full">
            <div className="h-[1px] bg-primary/20 flex-1"></div>
            <span className="text-primary/40 text-xs font-body uppercase tracking-widest">
              O continúa con
            </span>
            <div className="h-[1px] bg-primary/20 flex-1"></div>
          </div>

          <p className="text-primary/90 text-base font-body mt-4">
            ¿Eres nuevo?{' '}
            <Link
              href="/auth/register"
              className="text-primary font-bold underline decoration-primary underline-offset-4 ml-1 hover:opacity-80 transition-opacity font-body"
            >
              Regístrate
            </Link>
          </p>

          <div className="mt-12 opacity-30 select-none">
            <span className="material-symbols-outlined text-4xl">verified_user</span>
          </div>
        </div>
      </main>

      <div className="h-8 bg-background-dark"></div>
    </div>
  );
}
