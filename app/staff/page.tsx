'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import AdminDashboard from '@/components/AdminDashboard';

export default function StaffPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('STAFF: Verificando autenticación...');

      if (!isSupabaseConfigured()) {
        console.log('STAFF: Supabase no configurado');
        router.push('/auth/login');
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('STAFF: Session:', session?.user?.id || 'null', 'Error:', error?.message || 'none');

        if (!session || error) {
          console.log('STAFF: No hay sesión válida, redirigiendo a login');
          router.push('/auth/login');
          return;
        }

        console.log('STAFF: Usuario autenticado:', session.user.id);

        // Verificar rol
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        console.log('STAFF: Perfil obtenido:', profile, 'Error:', profileError?.message || 'none');

        if (profileError) {
          console.error('STAFF: Error obteniendo perfil:', profileError);
          router.push('/auth/login');
          return;
        }

        // Solo permitir acceso a usuarios con rol 'staff'
        if (profile?.role !== 'staff') {
          console.log('STAFF: Usuario no es staff, redirigiendo a home');
          router.push('/');
          return;
        }

        console.log('STAFF: Acceso autorizado como staff');
        setUserId(session.user.id);
        setLoading(false);
      } catch (error) {
        console.error('STAFF: Error verificando sesión:', error);
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

  return <AdminDashboard userId={userId} />;
}
