'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';
import { usePolling } from '@/lib/hooks/usePolling';

interface RewardsPageProps {
  userId: string;
}

interface Reward {
  id: string;
  name: string;
  description?: string | null;
  required_stamps: number;
  icon?: string | null;
  active: boolean;
}

interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Profile {
  photo_url: string | null;
  avatar_url: string | null;
  current_stamps?: number | null;
}

export default function RewardsPage({ userId }: RewardsPageProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stamps, setStamps] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);
  const [currentStamps, setCurrentStamps] = useState<number>(0);

  const loadData = useCallback(async () => {
    try {
      // Cargar perfil para la foto y current_stamps
      const { data: profileData } = await supabase
        .from('profiles')
        .select('photo_url, avatar_url, current_stamps')
        .eq('id', userId)
        .single();

      setProfile(profileData);
      
      // Usar current_stamps del perfil si está disponible
      if (profileData?.current_stamps !== undefined && profileData?.current_stamps !== null) {
        setCurrentStamps(profileData.current_stamps);
      }

      // Cargar sellos (para mostrar visualmente)
      const { data: stampsData } = await supabase
        .from('stamps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      setStamps(stampsData || []);
      
      // Si current_stamps no está disponible, contar manualmente como fallback
      if (profileData?.current_stamps === undefined || profileData?.current_stamps === null) {
        const approvedCount = (stampsData || []).filter(s => s.status === 'approved').length;
        setCurrentStamps(approvedCount);
      }

      // Cargar todas las recompensas configuradas
      const { data: rewardsData } = await supabase
        .from('rewards')
        .select('*')
        .order('required_stamps', { ascending: true });

      setRewards(rewardsData || []);

      // Cargar recompensas del usuario (incluyendo status)
      const { data: userRewardsData } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setUserRewards(userRewardsData || []);
      setLoading(false);
    } catch (error) {
      console.error('RewardsPage: Error cargando datos:', error);
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling para actualizar datos cada 5 segundos
  usePolling(loadData, { interval: 5000, enabled: !loading });

  const handleRedeem = async (reward: Reward) => {
    if (redeemingReward) return;

    setRedeemingReward(reward.id);

    try {
      // Verificar que el usuario tenga suficientes sellos usando currentStamps
      if (currentStamps < reward.required_stamps) {
        alert('No tienes suficientes sellos para canjear esta recompensa');
        setRedeemingReward(null);
        return;
      }

      // Verificar si ya tiene una solicitud pendiente para esta recompensa
      const pendingRedemption = userRewards.find(
        (ur) => ur.reward_id === reward.id && (ur as any).status === 'pending'
      );
      if (pendingRedemption) {
        alert('Ya tienes una solicitud de canje pendiente para esta recompensa');
        setRedeemingReward(null);
        return;
      }

      // Verificar si ya canjeó esta recompensa (aprobada)
      const alreadyRedeemed = userRewards.find(
        (ur) => ur.reward_id === reward.id && (ur as any).status === 'approved'
      );
      if (alreadyRedeemed) {
        alert('Ya has canjeado esta recompensa');
        setRedeemingReward(null);
        return;
      }

      // Crear solicitud de canje pendiente (no se marca redeemed_at hasta que se apruebe)
      const { error } = await supabase.from('user_rewards').insert({
        user_id: userId,
        reward_id: reward.id,
        status: 'pending', // Estado pendiente de aprobación
        redeemed_at: null, // Se marcará cuando se apruebe
      });

      if (error) throw error;

      // Recargar datos
      await loadData();
      alert('Solicitud de canje enviada. Espera la aprobación del personal.');
    } catch (error: any) {
      console.error('RewardsPage: Error canjeando recompensa:', error);
      alert('Error al enviar la solicitud: ' + (error.message || 'Error desconocido'));
    } finally {
      setRedeemingReward(null);
    }
  };

  const defaultPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbl1WDM1WqTkJbz9-4o6m5QoLp7awcHBQiSfoXRWFGeqnBVMj-AQZx7Za-6_q5enGIPtpuuemMh-nguGWfjckrE0PB26WI8Am8tU7CxqY099hNXLM1YB30oT7HzpF5_yf2y7MnafTG898mqa9ZMGpLEQ43x1DPOdrhQs_m2bbfCMlNMKD7bEQV0i97eEm21eJ1aBUsMBCHqGcGSWWoWgKDpFSbJD2IsKBFebLwZdzLhiyZ77L2SwUkcbFXpbxDW2wBxI_C4YmemHFf';

  const profilePhoto = profile?.photo_url || profile?.avatar_url || defaultPhoto;

  // Obtener el máximo de sellos requeridos para calcular el total
  const maxRequiredStamps = rewards.length > 0 ? Math.max(...rewards.map((r) => r.required_stamps)) : 10;
  const approvedStampsCount = currentStamps; // Usar el contador del perfil

  // Recompensas disponibles (TODAS las recompensas configuradas, sin filtrar por canjeadas)
  const availableRewards = rewards;

  // Separar recompensas canjeadas

  // Recompensas canjeadas (user_rewards con status = 'approved')
  const redeemedRewards = userRewards
    .filter((ur) => (ur as any).status === 'approved')
    .map((ur) => {
      const reward = rewards.find((r) => r.id === ur.reward_id);
      return {
        userReward: ur,
        reward: reward,
      };
    })
    .filter((item) => item.reward !== undefined)
    .map((item) => ({
      ...item.reward!,
      redeemed_at: item.userReward.redeemed_at,
      user_reward_id: item.userReward.id,
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-primary font-display text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-forest">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff05 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header */}
      <header className="flex items-center p-6 pb-4 justify-between sticky top-0 z-20 bg-forest/95 backdrop-blur-sm border-b border-primary/20">
        <div className="text-primary flex size-10 items-center justify-start">
          <span
            className="material-symbols-outlined text-2xl cursor-pointer"
            onClick={() => router.push('/')}
          >
            arrow_back_ios
          </span>
        </div>
        <h1 className="header-text text-primary text-xl font-bold flex-1 text-center">MIS RECOMPENSAS</h1>
        <div className="flex size-10 items-center justify-end">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-primary">{approvedStampsCount}</span>
            <span className="material-symbols-outlined text-primary text-sm -mt-1">confirmation_number</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 flex-1 relative z-10 pb-32">
        {/* Sección de sellos */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="header-text text-primary text-xs font-bold opacity-70 tracking-widest">Tus Sellos</h2>
            <p className="text-2xl font-display font-bold text-primary">
              {approvedStampsCount} / {maxRequiredStamps}{' '}
              <span className="text-xs uppercase opacity-60">sellos acumulados</span>
            </p>
          </div>
          <div className="size-14 rustic-border flex items-center justify-center bg-forest/40">
            <span className="material-symbols-outlined text-primary text-3xl">qr_code_2</span>
          </div>
        </div>

        {/* Recompensas Disponibles */}
        <div className="mb-8">
          <h2 className="header-text text-primary text-sm font-bold mb-4 pb-2 border-b border-primary/20">
            Recompensas Disponibles
          </h2>
          <div className="flex flex-col gap-6">
            {availableRewards.length === 0 ? (
              <div className="rustic-border bg-forest/40 p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">loyalty</span>
                <p className="text-primary/60 text-sm font-sans">No hay recompensas disponibles</p>
              </div>
            ) : (
              availableRewards.map((reward) => {
              const userReward = userRewards.find((ur) => ur.reward_id === reward.id);
              const rewardStatus = (userReward as any)?.status || null;
              const isRedeemed = rewardStatus === 'approved';
              const isPending = rewardStatus === 'pending';
              const isRejected = rewardStatus === 'rejected';
              
              // Puede canjear si tiene suficientes sellos, no está ya aprobada, y no hay solicitud pendiente
              const canRedeem = approvedStampsCount >= reward.required_stamps && !isRedeemed && !isPending;
              
              const progress = Math.min((approvedStampsCount / reward.required_stamps) * 100, 100);
              const stampsNeeded = Math.max(0, reward.required_stamps - approvedStampsCount);
              const icon = reward.icon || 'redeem';

              return (
                <div key={reward.id} className="rustic-border bg-forest/40 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="size-14 border border-primary/30 flex items-center justify-center bg-forest shadow-inner">
                        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                      </div>
                      <div>
                        <p className="header-text text-base font-bold text-primary">{reward.name}</p>
                        <p className="text-[11px] text-primary/60 font-sans uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">confirmation_number</span>
                          {reward.required_stamps} Sellos requeridos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end mb-1">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-widest ${
                          canRedeem ? 'text-primary' : isPending ? 'text-primary/80' : 'text-primary/60'
                        }`}
                      >
                        {isRedeemed
                          ? 'Ya canjeada'
                          : isPending
                          ? 'Pendiente de aprobación'
                          : isRejected
                          ? 'Canje rechazado - Intenta de nuevo'
                          : canRedeem
                          ? '¡Listo para canjear!'
                          : stampsNeeded > 0
                          ? `Te faltan ${stampsNeeded} sellos`
                          : 'Faltan sellos'}
                      </span>
                      <span
                        className={`text-xs font-bold ${canRedeem && !isRedeemed ? 'text-primary' : 'text-primary/60'}`}
                      >
                        {Math.min(approvedStampsCount, reward.required_stamps)}/{reward.required_stamps}
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {isRedeemed ? (
                      <button
                        disabled
                        className="w-full mt-2 border border-primary/40 py-3 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-primary/60 text-lg">check_circle</span>
                        <span className="header-text text-primary/60 text-sm font-bold">YA CANJEADA</span>
                      </button>
                    ) : isPending ? (
                      <button
                        disabled
                        className="w-full mt-2 border border-primary/40 py-3 flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-primary/60 text-lg animate-spin">hourglass_empty</span>
                        <span className="header-text text-primary/80 text-sm font-bold">ESPERANDO APROBACIÓN</span>
                      </button>
                    ) : canRedeem ? (
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={redeemingReward === reward.id}
                        className="w-full mt-2 bg-primary py-3 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <span className="header-text text-forest text-sm font-bold">
                          {redeemingReward === reward.id ? 'ENVIANDO...' : 'CANJEAR AHORA'}
                        </span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full mt-2 border border-primary/40 py-3 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                      >
                        <span className="header-text text-primary/60 text-sm font-bold">FALTAN SELLOS</span>
                      </button>
                    )}
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>

        {/* Recompensas Canjeadas (Historial) */}
        {redeemedRewards.length > 0 && (
          <div className="mb-8">
            <h2 className="header-text text-primary text-sm font-bold mb-4 pb-2 border-b border-primary/20">
              Recompensas Canjeadas
            </h2>
            <div className="flex flex-col gap-4">
              {redeemedRewards.map((reward) => {
                const icon = reward.icon || 'redeem';
                const redeemedDate = reward.redeemed_at ? new Date(reward.redeemed_at) : null;
                const formattedDate = redeemedDate
                  ? redeemedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                const formattedTime = redeemedDate
                  ? redeemedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div key={reward.user_reward_id || reward.id} className="rustic-border bg-forest/40 p-5">
                    <div className="flex items-center gap-4">
                      <div className="size-14 border border-primary/30 flex items-center justify-center bg-forest shadow-inner">
                        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="header-text text-base font-bold text-primary">{reward.name}</p>
                          <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                        </div>
                        {reward.description && (
                          <p className="text-[11px] text-primary/60 font-sans mb-1">{reward.description}</p>
                        )}
                        <p className="text-[10px] text-primary/50 font-sans uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">confirmation_number</span>
                          {reward.required_stamps} Sellos canjeados
                        </p>
                        {redeemedDate && (
                          <p className="text-[10px] text-primary/50 font-sans mt-1">
                            Canjeado el {formattedDate} a las {formattedTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 mb-6 text-center">
          <p className="header-text text-[10px] text-primary/40 tracking-widest">
            Sigue visitándonos para obtener más beneficios
          </p>
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-forest border-t border-primary/20 px-8 py-3 flex justify-between items-center backdrop-blur-md z-30">
        <button
          onClick={() => router.push('/')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Inicio</span>
        </button>
        <div className="flex flex-col items-center text-primary">
          <span className="material-symbols-outlined text-2xl">loyalty</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Catálogo</span>
        </div>
        <button
          onClick={() => router.push('/profile/edit')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <div className="size-6 rounded-full border border-primary/40 overflow-hidden mb-0.5">
            {profilePhoto ? (
              <Image
                src={profilePhoto}
                alt="User"
                width={24}
                height={24}
                className="w-full h-full object-cover grayscale opacity-50"
              />
            ) : (
              <img
                alt="User"
                className="w-full h-full object-cover grayscale opacity-50"
                src={defaultPhoto}
              />
            )}
          </div>
          <span className="text-[8px] uppercase font-bold tracking-tighter">Perfil</span>
        </button>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24"></div>
    </div>
  );
}
