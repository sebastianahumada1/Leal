'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { usePolling } from '@/lib/hooks/usePolling';
import ProfileSection from './ProfileSection';
import ScannerButton from './ScannerButton';
import ProgressSection from './ProgressSection';
import NextRewardSection from './NextRewardSection';
import Header from './Header';

interface UserDashboardProps {
  userId: string;
}

interface Stamp {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function UserDashboard({ userId }: UserDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [stampsCount, setStampsCount] = useState(0);
  const [nextReward, setNextReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadData = useCallback(async () => {
    // Cargar perfil (incluye current_stamps)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('UserDashboard: Error obteniendo perfil:', profileError);
    } else {
      setProfile(profileData);
      // Usar current_stamps del perfil si existe, si no contar manualmente
      if (profileData?.current_stamps !== undefined && profileData?.current_stamps !== null) {
        setStampsCount(profileData.current_stamps);
      }
    }

    // Cargar sellos con estados (solo para mostrar visualmente)
    const { data: stampsData, error: stampsError } = await supabase
      .from('stamps')
      .select('id, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (stampsError) {
      console.error('UserDashboard: Error obteniendo sellos:', stampsError);
    } else {
      setStamps(stampsData || []);
      // Si current_stamps no está disponible, contar manualmente como fallback
      if (profileData?.current_stamps === undefined || profileData?.current_stamps === null) {
        const approvedCount = (stampsData || []).filter(s => s.status === 'approved').length;
        setStampsCount(approvedCount);
      }
    }

    // Cargar próxima recompensa
    const { data: rewardData } = await supabase
      .from('rewards')
      .select('*')
      .eq('active', true)
      .order('required_stamps', { ascending: true })
      .limit(1)
      .single();

    setNextReward(rewardData);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling para actualizar sellos cada 5 segundos
  usePolling(loadData, { interval: 5000, enabled: !loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-primary font-display text-xl">Cargando datos...</div>
      </div>
    );
  }

  const currentStamps = stampsCount;
  const requiredStamps = 8; // Máximo 8 círculos (7 sellos + 1 recompensa)
  const progressPercentage = (currentStamps / requiredStamps) * 100;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex p-6 @container">
        <div className="flex w-full flex-col gap-4 items-center">
          <ProfileSection profile={profile} />
        </div>
      </div>
      <div className="px-6 pb-8">
        <ScannerButton userId={userId} />
      </div>
      <div className="px-6 pb-2">
        <h2 className="header-text text-primary text-lg font-bold pb-4 border-b border-primary/20">
          Tu Progreso
        </h2>
      </div>
      <div className="flex flex-col gap-6 p-6">
        <ProgressSection
          currentStamps={currentStamps}
          requiredStamps={requiredStamps}
          progressPercentage={progressPercentage}
          stamps={stamps}
        />
      </div>
      {nextReward && (
        <>
          <div className="px-6 pt-4 pb-2">
            <h2 className="header-text text-primary text-md font-bold border-b border-primary/20 pb-2">
              Próxima Recompensa
            </h2>
          </div>
          <div className="px-6 pb-12">
            <NextRewardSection
              reward={nextReward}
              currentStamps={currentStamps}
            />
          </div>
        </>
      )}
      <div className="h-8"></div>
    </div>
  );
}
