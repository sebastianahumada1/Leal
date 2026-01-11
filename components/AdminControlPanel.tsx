'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

interface AdminControlPanelProps {
  userId: string;
}

interface ActivityItem {
  id: string;
  type: 'registration' | 'stamp' | 'reward';
  title: string;
  description: string;
  time: string;
  icon: string;
}

export default function AdminControlPanel({ userId }: AdminControlPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [totalClients, setTotalClients] = useState(0);
  const [stampsToday, setStampsToday] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar foto de perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('photo_url, avatar_url')
          .eq('id', userId)
          .single();

        if (profile?.photo_url || profile?.avatar_url) {
          setProfilePhoto(profile.photo_url || profile.avatar_url);
        }

        // Contar total de clientes (usuarios con rol 'user')
        const { count: clientsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user');

        setTotalClients(clientsCount || 0);

        // Contar sellos de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const { count: stampsCount } = await supabase
          .from('stamps')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .gte('created_at', todayISO);

        setStampsToday(stampsCount || 0);

        // Cargar actividad reciente
        // Últimos registros de usuarios
        const { data: recentProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, created_at')
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(3);

        // Últimos sellos aprobados (con join a profiles)
        const { data: recentStamps } = await supabase
          .from('stamps')
          .select(`
            id,
            user_id,
            created_at,
            profiles:user_id(id, full_name)
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(3);

        // Últimas recompensas canjeadas (con joins a rewards y profiles)
        const { data: recentRewards } = await supabase
          .from('user_rewards')
          .select(`
            id,
            user_id,
            redeemed_at,
            rewards(id, name),
            profiles:user_id(id, full_name)
          `)
          .not('redeemed_at', 'is', null)
          .order('redeemed_at', { ascending: false })
          .limit(3);

        // Combinar y formatear actividades con timestamps para ordenar
        interface ActivityWithDate extends ActivityItem {
          date: Date;
        }
        const activities: ActivityWithDate[] = [];

        if (recentProfiles) {
          recentProfiles.forEach((profile: any) => {
            const date = new Date(profile.created_at);
            activities.push({
              id: `reg-${profile.id}`,
              type: 'registration',
              title: 'Registro Exitoso',
              description: `Nuevo cliente registrado: ${profile.full_name || 'Usuario'}`,
              time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              icon: 'person_add',
              date,
            });
          });
        }

        if (recentStamps) {
          recentStamps.forEach((stamp: any) => {
            const date = new Date(stamp.created_at);
            const profile = Array.isArray(stamp.profiles) ? stamp.profiles[0] : stamp.profiles;
            activities.push({
              id: `stamp-${stamp.id}`,
              type: 'stamp',
              title: 'Sello Asignado',
              description: `Cliente ${profile?.full_name || 'Usuario'} ha recibido un sello.`,
              time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              icon: 'potted_plant',
              date,
            });
          });
        }

        if (recentRewards) {
          recentRewards.forEach((reward: any) => {
            const date = new Date(reward.redeemed_at);
            const profile = Array.isArray(reward.profiles) ? reward.profiles[0] : reward.profiles;
            const rewardData = Array.isArray(reward.rewards) ? reward.rewards[0] : reward.rewards;
            activities.push({
              id: `reward-${reward.id}`,
              type: 'reward',
              title: 'Recompensa Canjeada',
              description: `${rewardData?.name || 'Recompensa'} entregada a ${profile?.full_name || 'Usuario'}.`,
              time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              icon: 'redeem',
              date,
            });
          });
        }

        // Ordenar por fecha (más reciente primero) y tomar los primeros 3
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Remover el campo date antes de guardar
        const activitiesWithoutDate: ActivityItem[] = activities.slice(0, 3).map(({ date, ...activity }) => activity);

        setRecentActivity(activitiesWithoutDate);
        setLoading(false);
      } catch (error) {
        console.error('AdminControlPanel: Error cargando datos:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [userId, supabase]);

  const defaultPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbl1WDM1WqTkJbz9-4o6m5QoLp7awcHBQiSfoXRWFGeqnBVMj-AQZx7Za-6_q5enGIPtpuuemMh-nguGWfjckrE0PB26WI8Am8tU7CxqY099hNXLM1YB30oT7HzpF5_yf2y7MnafTG898mqa9ZMGpLEQ43x1DPOdrhQs_m2bbfCMlNMKD7bEQV0i97eEm21eJ1aBUsMBCHqGcGSWWoWgKDpFSbJD2IsKBFebLwZdzLhiyZ77L2SwUkcbFXpbxDW2wBxI_C4YmemHFf';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-forest">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff05 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header */}
      <header className="flex items-center p-6 pb-4 justify-between sticky top-0 z-20 bg-forest/95 backdrop-blur-sm border-b border-primary/20">
        <div className="text-primary flex size-10 items-center justify-start">
          <span className="material-symbols-outlined text-2xl cursor-pointer" onClick={() => router.push('/')}>
            menu
          </span>
        </div>
        <h1 className="header-text text-primary text-lg font-bold flex-1 text-center">PANEL DE CONTROL</h1>
        <div className="flex size-10 items-center justify-end gap-2">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="text-primary/80 hover:text-primary transition-colors p-2"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
          <div className="size-8 rounded-full border border-primary overflow-hidden">
            {profilePhoto ? (
              <Image src={profilePhoto} alt="Admin" width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <img alt="Admin" className="w-full h-full object-cover" src={defaultPhoto} />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Resumen General */}
        <section className="p-6 relative z-10">
          <h2 className="header-text text-primary text-[10px] font-bold mb-4 opacity-70 tracking-[0.2em]">RESUMEN GENERAL</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="vintage-card p-4">
              <p className="text-primary/70 text-[10px] font-sans uppercase tracking-wider">Total Clientes</p>
              <div className="flex items-end justify-between mt-1">
                <span className="header-text text-2xl font-bold text-primary leading-none">
                  {loading ? '...' : totalClients.toLocaleString()}
                </span>
                <span className="material-symbols-outlined text-primary/40 text-xl">groups</span>
              </div>
            </div>
            <div className="vintage-card p-4">
              <p className="text-primary/70 text-[10px] font-sans uppercase tracking-wider">Sellos Hoy</p>
              <div className="flex items-end justify-between mt-1">
                <span className="header-text text-2xl font-bold text-primary leading-none">{loading ? '...' : stampsToday}</span>
                <span className="material-symbols-outlined text-primary/40 text-xl">potted_plant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Actividad Reciente */}
        <section className="px-6 py-4 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="header-text text-primary text-[10px] font-bold opacity-70 tracking-[0.2em]">ACTIVIDAD RECIENTE</h2>
            <span className="material-symbols-outlined text-lg text-primary/40">history</span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 border-b border-primary/10 pb-4">
                    <div className="size-10 flex-shrink-0 border border-primary/20 flex items-center justify-center bg-forest/40">
                      <div className="w-5 h-5 bg-primary/20 rounded animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-primary/20 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-2 bg-primary/10 rounded w-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 border-b border-primary/10 pb-4">
                  <div className="size-10 flex-shrink-0 border border-primary/20 flex items-center justify-center bg-forest/40">
                    <span className="material-symbols-outlined text-primary text-xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="header-text text-[11px] text-primary font-bold">{activity.title}</p>
                      <span className="text-[9px] text-primary/40 font-sans">{activity.time}</span>
                    </div>
                    <p className="text-[10px] text-primary/60 font-sans mt-1">{activity.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-primary/40 text-sm font-sans">No hay actividad reciente</p>
              </div>
            )}

            {/* Placeholder para más actividades */}
            {!loading && recentActivity.length > 0 && (
              <div className="pt-2 opacity-30">
                <div className="space-y-3">
                  <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-[65%]"></div>
                  </div>
                  <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-[40%]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-forest/95 border-t border-primary/30 px-8 py-4 flex justify-between items-center backdrop-blur-md z-30">
        <button
          onClick={() => router.push('/admin')}
          className="flex flex-col items-center text-primary hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-2xl">dashboard</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Panel</span>
        </button>
        <button
          onClick={() => router.push('/admin/users')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">groups</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Usuarios</span>
        </button>
        <button
          onClick={() => router.push('/admin/analytics')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">analytics</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Datos</span>
        </button>
        <button
          onClick={() => router.push('/admin/rewards')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">loyalty</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Catálogo</span>
        </button>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24"></div>
    </div>
  );
}
