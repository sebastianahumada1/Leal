'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import RewardsPage from '@/components/RewardsPage';

export default function Rewards() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured()) {
        router.push('/auth/login');
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!session || error) {
          router.push('/auth/login');
          return;
        }

        setUserId(session.user.id);
        setLoading(false);
      } catch (error) {
        console.error('Rewards: Error verificando sesión:', error);
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

  return <RewardsPage userId={userId} />;
}
