'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import UserDashboard from '@/components/UserDashboard';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Mostrar mensaje de éxito si viene del checkout
    if (searchParams?.get('visit') === 'registered') {
      setShowSuccessMessage(true);
      // Remover el parámetro de la URL
      router.replace('/');
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('HOME: Verificando autenticación...');
      
      if (!isSupabaseConfigured()) {
        console.log('HOME: Supabase no configurado');
        router.push('/auth/login');
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('HOME: Session:', session?.user?.id || 'null', 'Error:', error?.message || 'none');

        if (!session || error) {
          console.log('HOME: No hay sesión válida, redirigiendo a login');
          router.push('/auth/login');
          return;
        }

        console.log('HOME: Usuario autenticado:', session.user.id);

        // Verificar rol para redirigir admin/staff
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        console.log('HOME: Perfil obtenido:', profile, 'Error:', profileError?.message || 'none');

        if (profileError) {
          console.error('HOME: Error obteniendo perfil:', profileError);
          router.push('/auth/login');
          return;
        }

        // Esta vista es SOLO para usuarios con rol 'user'
        // Staff y Admin tienen sus propias vistas
        if (profile?.role === 'staff') {
          console.log('HOME: Usuario es staff, redirigiendo a /staff...');
          router.replace('/staff');
          return;
        }
        
        if (profile?.role === 'admin') {
          console.log('HOME: Usuario es admin, redirigiendo a /admin...');
          router.replace('/admin');
          return;
        }

        // Solo usuarios con rol 'user' pueden ver esta vista
        if (profile?.role !== 'user') {
          console.log('HOME: Usuario no tiene rol válido, redirigiendo a login');
          router.push('/auth/login');
          return;
        }

        console.log('HOME: Mostrando dashboard para usuario normal');
        setUserId(session.user.id);
        setLoading(false);
      } catch (error) {
        console.error('HOME: Error verificando sesión:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-primary font-display text-xl">Cargando...</div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <>
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-400/90 text-forest px-6 py-3 rounded shadow-lg header-text text-sm font-bold tracking-widest">
          ✓ Visita registrada exitosamente
        </div>
      )}
      <UserDashboard userId={userId} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-primary font-display text-xl">Cargando...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
