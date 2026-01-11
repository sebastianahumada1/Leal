'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import AdminRewardsCatalog from '@/components/AdminRewardsCatalog';

export default function AdminRewardsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('ADMIN_REWARDS: Verificando autenticación...');

      if (!isSupabaseConfigured()) {
        console.log('ADMIN_REWARDS: Supabase no configurado');
        router.push('/auth/login');
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('ADMIN_REWARDS: Session:', session?.user?.id || 'null', 'Error:', error?.message || 'none');

        if (!session || error) {
          console.log('ADMIN_REWARDS: No hay sesión válida, redirigiendo a login');
          router.push('/auth/login');
          return;
        }

        console.log('ADMIN_REWARDS: Usuario autenticado:', session.user.id);

        // Verificar rol
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        console.log('ADMIN_REWARDS: Perfil obtenido:', profile, 'Error:', profileError?.message || 'none');

        if (profileError) {
          console.error('ADMIN_REWARDS: Error obteniendo perfil:', profileError);
          router.push('/auth/login');
          return;
        }

        // Solo permitir acceso a usuarios con rol 'admin'
        if (profile?.role !== 'admin') {
          console.log('ADMIN_REWARDS: Usuario no es admin, redirigiendo...');
          if (profile?.role === 'staff') {
            router.push('/staff');
          } else {
            router.push('/');
          }
          return;
        }

        console.log('ADMIN_REWARDS: Acceso autorizado como admin');
        setUserId(session.user.id);
        setLoading(false);
      } catch (error) {
        console.error('ADMIN_REWARDS: Error verificando sesión:', error);
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

  return <AdminRewardsCatalog userId={userId} />;
}
