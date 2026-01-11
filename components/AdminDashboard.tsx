'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { usePolling } from '@/lib/hooks/usePolling';
import { formatDistanceToNow, format } from 'date-fns';

interface AdminDashboardProps {
  userId: string;
}

interface PendingVisit {
  id: string;
  user_id: string;
  amount: number;
  location_code: string;
  created_at: string;
  user_name?: string;
  member_number?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

interface PendingRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  created_at: string;
  user_name?: string;
  member_number?: string;
  reward_name?: string;
  reward_icon?: string;
  required_stamps?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

interface Metrics {
  totalApprovedToday: number;
  totalPending: number;
  totalPendingRedemptions: number;
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'redemptions'>('pending');
  const [pendingVisits, setPendingVisits] = useState<PendingVisit[]>([]);
  const [historyVisits, setHistoryVisits] = useState<PendingVisit[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<PendingRedemption[]>([]);
  const [processingVisit, setProcessingVisit] = useState<string | null>(null);
  const [processingRedemption, setProcessingRedemption] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({ totalApprovedToday: 0, totalPending: 0, totalPendingRedemptions: 0 });
  const [selectedVisit, setSelectedVisit] = useState<PendingVisit | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const loadPendingVisits = useCallback(async () => {
    try {
      console.log('AdminDashboard: Cargando visitas pendientes...');
      const { data: visits, error: visitsError } = await supabase
        .from('stamps')
        .select('id, user_id, amount, location_code, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (visitsError) {
        console.error('AdminDashboard: Error loading pending visits:', visitsError);
        console.error('AdminDashboard: Error code:', visitsError.code);
        console.error('AdminDashboard: Error message:', visitsError.message);
        return;
      }

      console.log('AdminDashboard: Visitas encontradas:', visits?.length || 0, visits);

      if (!visits || visits.length === 0) {
        setPendingVisits([]);
        setMetrics(prev => ({ ...prev, totalPending: 0 }));
        return;
      }

      const userIds = visits.map(v => v.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, member_number')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      const userNamesMap = new Map<string, { name: string; memberNumber: string }>();
      (profiles || []).forEach(profile => {
        if (profile.id) {
          userNamesMap.set(profile.id, {
            name: profile.full_name || 'Usuario',
            memberNumber: profile.member_number || 'N/A'
          });
        }
      });

      const formattedVisits: PendingVisit[] = (visits || []).map((visit: any) => {
        const userInfo = userNamesMap.get(visit.user_id);
        return {
          id: visit.id,
          user_id: visit.user_id,
          amount: visit.amount || 0,
          location_code: visit.location_code || '',
          created_at: visit.created_at,
          user_name: userInfo?.name,
          member_number: userInfo?.memberNumber,
        };
      });

      setPendingVisits(formattedVisits);
      setMetrics(prev => ({ ...prev, totalPending: formattedVisits.length }));
    } catch (error) {
      console.error('Error loading pending visits:', error);
    }
  }, [supabase]);

  const loadHistoryVisits = useCallback(async () => {
    try {
      console.log('AdminDashboard: Cargando historial de visitas...');
      const { data: visits, error: visitsError } = await supabase
        .from('stamps')
        .select('id, user_id, amount, location_code, created_at, status, collected_by')
        .in('status', ['approved', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(50); // Limitar a las últimas 50 visitas

      if (visitsError) {
        console.error('AdminDashboard: Error loading history visits:', visitsError);
        return;
      }

      if (!visits || visits.length === 0) {
        setHistoryVisits([]);
        return;
      }

      const userIds = [...new Set(visits.map(v => v.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, member_number')
        .in('id', userIds);

      if (profilesError) {
        console.error('AdminDashboard: Error loading profiles for history:', profilesError);
      }

      const userNamesMap = new Map<string, { name: string; memberNumber: string }>();
      (profiles || []).forEach(profile => {
        if (profile.id) {
          userNamesMap.set(profile.id, {
            name: profile.full_name || 'Usuario',
            memberNumber: profile.member_number || 'N/A'
          });
        }
      });

      const formattedVisits: PendingVisit[] = (visits || []).map((visit: any) => {
        const userInfo = userNamesMap.get(visit.user_id);
        return {
          id: visit.id,
          user_id: visit.user_id,
          amount: visit.amount || 0,
          location_code: visit.location_code || '',
          created_at: visit.created_at,
          user_name: userInfo?.name,
          member_number: userInfo?.memberNumber,
          status: visit.status,
        };
      });

      setHistoryVisits(formattedVisits);
      console.log('AdminDashboard: Historial cargado:', formattedVisits.length, 'visitas');
    } catch (error) {
      console.error('AdminDashboard: Error loading history visits:', error);
    }
  }, [supabase]);

  const loadPendingRedemptions = useCallback(async () => {
    console.log('AdminDashboard: Cargando canjes pendientes...');
    try {
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('user_rewards')
        .select('id, user_id, reward_id, created_at, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (redemptionsError) {
        console.error('AdminDashboard: Error loading pending redemptions:', redemptionsError);
        return;
      }

      if (!redemptions || redemptions.length === 0) {
        setPendingRedemptions([]);
        setMetrics(prev => ({ ...prev, totalPendingRedemptions: 0 }));
        return;
      }

      const userIds = [...new Set(redemptions.map((r: any) => r.user_id))];
      const rewardIds = [...new Set(redemptions.map((r: any) => r.reward_id))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, member_number')
        .in('id', userIds);

      const { data: rewards } = await supabase
        .from('rewards')
        .select('id, name, icon, required_stamps')
        .in('id', rewardIds);

      const userNamesMap = new Map<string, { name: string; memberNumber: string }>();
      (profiles || []).forEach((profile: any) => {
        if (profile.id) {
          userNamesMap.set(profile.id, {
            name: profile.full_name || 'Usuario',
            memberNumber: profile.member_number || 'N/A'
          });
        }
      });

      const rewardsMap = new Map<string, { name: string; icon: string; required_stamps: number }>();
      (rewards || []).forEach((reward: any) => {
        if (reward.id) {
          rewardsMap.set(reward.id, {
            name: reward.name,
            icon: reward.icon || 'redeem',
            required_stamps: reward.required_stamps
          });
        }
      });

      const formattedRedemptions: PendingRedemption[] = (redemptions || []).map((redemption: any) => {
        const userInfo = userNamesMap.get(redemption.user_id);
        const rewardInfo = rewardsMap.get(redemption.reward_id);
        return {
          id: redemption.id,
          user_id: redemption.user_id,
          reward_id: redemption.reward_id,
          created_at: redemption.created_at,
          user_name: userInfo?.name,
          member_number: userInfo?.memberNumber,
          reward_name: rewardInfo?.name,
          reward_icon: rewardInfo?.icon,
          required_stamps: rewardInfo?.required_stamps,
          status: 'pending',
        };
      });

      setPendingRedemptions(formattedRedemptions);
      setMetrics(prev => ({ ...prev, totalPendingRedemptions: formattedRedemptions.length }));
      console.log('AdminDashboard: Canjes pendientes cargados:', formattedRedemptions.length);
    } catch (error) {
      console.error('AdminDashboard: Error loading pending redemptions:', error);
    }
  }, [supabase]);

  const loadMetrics = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Contar stamps aprobados hoy
      const { count, error: countError } = await supabase
        .from('stamps')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('created_at', todayISO);

      if (!countError && count !== null) {
        setMetrics(prev => ({ 
          ...prev, 
          totalApprovedToday: count || 0 
        }));
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, [supabase]);

  usePolling(() => {
    loadPendingVisits();
    loadMetrics();
    loadPendingRedemptions();
    if (activeTab === 'history') {
      loadHistoryVisits();
    }
  }, { interval: 5000, enabled: true });

  useEffect(() => {
    loadPendingVisits();
    loadMetrics();
    loadPendingRedemptions();
    if (activeTab === 'history') {
      loadHistoryVisits();
    }
  }, [loadPendingVisits, loadMetrics, loadHistoryVisits, loadPendingRedemptions, activeTab]);

  const handleApproveVisit = async (visitId: string) => {
    setProcessingVisit(visitId);
    console.log('AdminDashboard: Aprobando visita:', visitId);
    try {
      const { data, error } = await supabase
        .from('stamps')
        .update({
          status: 'approved',
          collected_by: userId,
        })
        .eq('id', visitId)
        .select();

      if (error) {
        console.error('AdminDashboard: Error al aprobar:', error);
        throw error;
      }

      console.log('AdminDashboard: Visita aprobada exitosamente:', data);

      await loadPendingVisits();
      await loadHistoryVisits();
      await loadMetrics();
      if (showVisitModal) {
        setShowVisitModal(false);
        setSelectedVisit(null);
      }
    } catch (error: any) {
      console.error('AdminDashboard: Error approving visit:', error);
      alert('Error al aprobar la visita: ' + (error.message || 'Error desconocido'));
    } finally {
      setProcessingVisit(null);
    }
  };

  const handleRejectVisit = async (visitId: string, skipConfirm = false) => {
    if (!skipConfirm && !confirm('¿Estás seguro de que deseas rechazar esta visita?')) {
      return;
    }

    setProcessingVisit(visitId);
    console.log('AdminDashboard: Rechazando visita:', visitId);
    try {
      const { data, error } = await supabase
        .from('stamps')
        .update({
          status: 'rejected',
          collected_by: userId,
        })
        .eq('id', visitId)
        .select();

      if (error) {
        console.error('AdminDashboard: Error al rechazar:', error);
        throw error;
      }

      console.log('AdminDashboard: Visita rechazada exitosamente:', data);

      await loadPendingVisits();
      await loadHistoryVisits();
      await loadMetrics();
      if (showVisitModal) {
        setShowVisitModal(false);
        setSelectedVisit(null);
      }
    } catch (error: any) {
      console.error('AdminDashboard: Error rejecting visit:', error);
      alert('Error al rechazar la visita: ' + (error.message || 'Error desconocido'));
    } finally {
      setProcessingVisit(null);
    }
  };

  const handleApproveRedemption = async (redemption: PendingRedemption) => {
    setProcessingRedemption(redemption.id);
    console.log('AdminDashboard: Aprobando canje:', redemption.id);

    try {
      const requiredStamps = redemption.required_stamps || 0;
      
      // 1. Verificar que el usuario tenga suficientes sellos disponibles
      // Obtener el perfil para ver current_stamps
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('current_stamps')
        .eq('id', redemption.user_id)
        .single();

      if (profileError) throw profileError;

      const availableStamps = userProfile?.current_stamps || 0;
      if (availableStamps < requiredStamps) {
        alert('El usuario no tiene suficientes sellos disponibles para canjear esta recompensa');
        setProcessingRedemption(null);
        return;
      }

      // 2. Actualizar el user_reward como aprobado (NO eliminamos los stamps)
      // Los stamps se mantienen en la tabla, solo se descuentan del conteo
      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({
          status: 'approved',
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', redemption.id);

      if (updateError) throw updateError;

      // 3. Recalcular current_stamps usando función RPC (stamps aprobados - required_stamps de recompensas aprobadas)
      console.log('AdminDashboard: Llamando a update_user_stamp_count para usuario:', redemption.user_id);
      const { data: rpcData, error: updateStampsError } = await supabase.rpc('update_user_stamp_count', {
        user_id_param: redemption.user_id
      });

      if (updateStampsError) {
        console.error('AdminDashboard: Error actualizando current_stamps con RPC:', updateStampsError);
        console.error('AdminDashboard: Detalles del error:', JSON.stringify(updateStampsError, null, 2));
        
        // Verificar el perfil después del error
        const { data: profileAfterError } = await supabase
          .from('profiles')
          .select('current_stamps')
          .eq('id', redemption.user_id)
          .single();
        console.log('AdminDashboard: current_stamps después del error:', profileAfterError?.current_stamps);
      } else {
        console.log('AdminDashboard: RPC ejecutado exitosamente');
        
        // Verificar que se actualizó correctamente
        const { data: profileAfterUpdate } = await supabase
          .from('profiles')
          .select('current_stamps')
          .eq('id', redemption.user_id)
          .single();
        console.log(`AdminDashboard: Canje aprobado. current_stamps actualizado a: ${profileAfterUpdate?.current_stamps}`);
      }

      await loadPendingRedemptions();
      await loadMetrics();
    } catch (error: any) {
      console.error('AdminDashboard: Error approving redemption:', error);
      alert('Error al aprobar el canje: ' + (error.message || 'Error desconocido'));
    } finally {
      setProcessingRedemption(null);
    }
  };

  const handleRejectRedemption = async (redemption: PendingRedemption) => {
    if (!confirm('¿Estás seguro de que deseas rechazar este canje?')) {
      return;
    }

    setProcessingRedemption(redemption.id);
    console.log('AdminDashboard: Rechazando canje:', redemption.id);

    try {
      // Solo marcar como rechazado, no descontar sellos
      const { error } = await supabase
        .from('user_rewards')
        .update({
          status: 'rejected',
        })
        .eq('id', redemption.id);

      if (error) throw error;

      console.log('AdminDashboard: Canje rechazado exitosamente');

      await loadPendingRedemptions();
      await loadMetrics();
    } catch (error: any) {
      console.error('AdminDashboard: Error rejecting redemption:', error);
      alert('Error al rechazar el canje: ' + (error.message || 'Error desconocido'));
    } finally {
      setProcessingRedemption(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true
      });
    } catch {
      return 'Hace un momento';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark overflow-x-hidden">
      {/* Textura de fondo */}
      <div className="absolute inset-0 rustic-texture opacity-20 z-0"></div>
      <div className="absolute inset-0 grain-overlay z-0"></div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="material-symbols-outlined text-primary cursor-pointer"
          >
            menu
          </button>
          <h1 className="header-text text-2xl font-bold tracking-[0.15em] text-center uppercase text-primary">
            LEAL
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="material-symbols-outlined text-primary cursor-pointer"
          >
            logout
          </button>
        </div>
        <h2 className="header-text text-lg font-bold text-center tracking-widest mb-6 text-primary">
          GESTIÓN DE VISITAS
        </h2>
        <div className="flex p-1 bg-forest/50 rounded-xl border border-primary/20">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === 'pending'
                ? 'bg-primary text-forest'
                : 'text-primary/60 hover:text-primary'
            }`}
          >
            Visitas
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 relative ${
              activeTab === 'redemptions'
                ? 'bg-primary text-forest'
                : 'text-primary/60 hover:text-primary'
            }`}
          >
            Canjes
            {pendingRedemptions.length > 0 && (
              <span className="absolute -top-1 -right-1 size-4 bg-primary text-forest rounded-full flex items-center justify-center text-[8px] font-bold">
                {pendingRedemptions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-primary text-forest'
                : 'text-primary/60 hover:text-primary'
            }`}
          >
            Historial
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 pb-32">
        {activeTab === 'pending' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                Visitas Pendientes
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {pendingVisits.length} TOTAL
              </span>
            </div>
            <div className="space-y-4">
              {pendingVisits.length === 0 ? (
                <div className="bg-forest/40 rounded-2xl p-8 border-2 dotted-border text-center">
                  <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">
                    inbox
                  </span>
                  <p className="text-primary/60 text-sm font-sans">
                    No hay visitas pendientes
                  </p>
                </div>
              ) : (
                pendingVisits.map((visit, index) => (
                  <div
                    key={visit.id}
                    className={`bg-forest/40 rounded-2xl p-5 border-2 dotted-border relative overflow-hidden ${
                      index > 0 ? 'opacity-90' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-background-dark flex items-center justify-center border border-primary/30">
                          <span className="material-symbols-outlined text-xl text-primary">person</span>
                        </div>
                        <div>
                          <h4 className="header-text text-sm font-bold text-primary">
                            {visit.user_name || 'Usuario Desconocido'}
                          </h4>
                          <p className="text-[10px] text-primary/50 uppercase tracking-tighter">
                            ID: {visit.member_number || visit.user_id.substring(0, 5)} • {formatTimeAgo(visit.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="header-text text-sm font-bold text-primary">
                          {formatCurrency(visit.amount)}
                        </p>
                        <p className="text-[10px] text-primary/60 italic">
                          Local: {visit.location_code?.toUpperCase() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveVisit(visit.id)}
                        disabled={processingVisit === visit.id}
                        className="flex-1 bg-primary text-forest py-3 rounded-lg header-text font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {processingVisit === visit.id ? 'Aprobando...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleRejectVisit(visit.id)}
                        disabled={processingVisit === visit.id}
                        className="flex-1 border-2 border-primary/40 text-primary py-3 rounded-lg header-text font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {processingVisit === visit.id ? 'Rechazando...' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : activeTab === 'redemptions' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                Canjes Pendientes
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {pendingRedemptions.length} TOTAL
              </span>
            </div>
            <div className="space-y-4">
              {pendingRedemptions.length === 0 ? (
                <div className="bg-forest/40 rounded-2xl p-8 border-2 dotted-border text-center">
                  <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">
                    loyalty
                  </span>
                  <p className="text-primary/60 text-sm font-sans">
                    No hay canjes pendientes
                  </p>
                </div>
              ) : (
                pendingRedemptions.map((redemption, index) => (
                  <div
                    key={redemption.id}
                    className={`bg-forest/40 rounded-2xl p-5 border-2 dotted-border relative overflow-hidden ${
                      index > 0 ? 'opacity-90' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-background-dark flex items-center justify-center border border-primary/30">
                          <span className="material-symbols-outlined text-2xl text-primary">
                            {redemption.reward_icon || 'redeem'}
                          </span>
                        </div>
                        <div>
                          <h4 className="header-text text-sm font-bold text-primary">
                            {redemption.user_name || 'Usuario Desconocido'}
                          </h4>
                          <p className="text-[10px] text-primary/50 uppercase tracking-tighter">
                            ID: {redemption.member_number || redemption.user_id.substring(0, 5)} • {formatTimeAgo(redemption.created_at)}
                          </p>
                          <p className="text-xs text-primary/70 font-sans mt-1">
                            <span className="material-symbols-outlined text-xs align-middle">redeem</span>
                            {' '}
                            {redemption.reward_name || 'Recompensa'}
                          </p>
                          <p className="text-[10px] text-primary/60 mt-1">
                            Requiere: {redemption.required_stamps || 0} sellos
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRedemption(redemption)}
                        disabled={processingRedemption === redemption.id}
                        className="flex-1 bg-primary text-forest py-3 rounded-lg header-text font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {processingRedemption === redemption.id ? 'Aprobando...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleRejectRedemption(redemption)}
                        disabled={processingRedemption === redemption.id}
                        className="flex-1 border-2 border-primary/40 text-primary py-3 rounded-lg header-text font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {processingRedemption === redemption.id ? 'Rechazando...' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                Historial de Visitas
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {historyVisits.length} TOTAL
              </span>
            </div>
            <div className="space-y-4">
              {historyVisits.length === 0 ? (
                <div className="bg-forest/40 rounded-2xl p-8 border-2 dotted-border text-center">
                  <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">
                    history
                  </span>
                  <p className="text-primary/60 text-sm font-sans">
                    No hay visitas en el historial
                  </p>
                </div>
              ) : (
                historyVisits.map((visit) => {
                  const visitStatus = (visit as any).status || 'approved';
                  const isApproved = visitStatus === 'approved';
                  const isRejected = visitStatus === 'rejected';
                  
                  return (
                    <div
                      key={visit.id}
                      onClick={() => {
                        setSelectedVisit(visit);
                        setShowVisitModal(true);
                      }}
                      className={`bg-forest/40 rounded-2xl p-5 border-2 dotted-border relative overflow-hidden cursor-pointer hover:bg-forest/50 transition-colors ${
                        isApproved ? 'border-primary/50' : isRejected ? 'border-red-400/30 opacity-75' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-full bg-background-dark flex items-center justify-center border ${
                            isApproved ? 'border-primary/30' : 'border-red-400/30'
                          }`}>
                            <span className={`material-symbols-outlined text-xl ${
                              isApproved ? 'text-primary' : 'text-red-400'
                            }`}>
                              {isApproved ? 'check_circle' : 'cancel'}
                            </span>
                          </div>
                          <div>
                            <h4 className="header-text text-sm font-bold text-primary">
                              {visit.user_name || 'Usuario Desconocido'}
                            </h4>
                            <p className="text-[10px] text-primary/50 uppercase tracking-tighter">
                              ID: {visit.member_number || visit.user_id.substring(0, 5)} • {formatTimeAgo(visit.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="header-text text-sm font-bold text-primary">
                            {formatCurrency(visit.amount)}
                          </p>
                          <p className={`text-[10px] italic ${
                            isApproved ? 'text-primary/60' : 'text-red-400/70'
                          }`}>
                            {isApproved ? '✓ Aprobado' : '✗ Rechazado'}
                          </p>
                          <p className="text-[10px] text-primary/50 mt-1">
                            Local: {visit.location_code?.toUpperCase() || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* Bottom Metrics Section */}
      <section className="fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-forest rounded-t-[2.5rem] px-8 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] border-t border-primary/20 relative">
          <div className="absolute inset-0 rustic-texture opacity-10 rounded-t-[2.5rem]"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-1 bg-primary/20 rounded-full mb-6"></div>
              <h4 className="header-text text-xs font-bold uppercase tracking-[0.3em] mb-6 text-primary">
                Métricas Rápidas
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-dark/40 p-4 rounded-xl border border-primary/10 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-1">
                  Aprobadas Hoy
                </p>
                <p className="header-text text-2xl font-bold text-primary">
                  {metrics.totalApprovedToday}
                </p>
              </div>
              <div className="bg-background-dark/40 p-4 rounded-xl border border-primary/10 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-1">
                  Pendientes
                </p>
                <p className="header-text text-2xl font-bold text-primary">
                  {metrics.totalPending}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-forest pb-2 flex justify-center">
          <div className="w-32 h-1.5 bg-primary/10 rounded-full"></div>
        </div>
      </section>

      {/* Modal de Detalle de Visita */}
      {showVisitModal && selectedVisit && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVisitModal(false);
              setSelectedVisit(null);
            }
          }}
        >
          <div className="bg-forest rounded-2xl p-6 border-2 border-primary/30 max-w-md w-full relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="header-text text-lg font-bold text-primary uppercase tracking-wider">
                Detalle de Visita
              </h3>
              <button
                onClick={() => {
                  setShowVisitModal(false);
                  setSelectedVisit(null);
                }}
                className="material-symbols-outlined text-primary cursor-pointer hover:text-primary/70"
              >
                close
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-primary/20">
                <div className={`size-14 rounded-full bg-background-dark flex items-center justify-center border-2 ${
                  selectedVisit.status === 'approved' ? 'border-primary/30' : selectedVisit.status === 'rejected' ? 'border-red-400/30' : 'border-primary/30'
                }`}>
                  <span className={`material-symbols-outlined text-2xl ${
                    selectedVisit.status === 'approved' ? 'text-primary' : selectedVisit.status === 'rejected' ? 'text-red-400' : 'text-primary'
                  }`}>
                    {selectedVisit.status === 'approved' ? 'check_circle' : selectedVisit.status === 'rejected' ? 'cancel' : 'pending'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="header-text text-base font-bold text-primary">
                    {selectedVisit.user_name || 'Usuario Desconocido'}
                  </h4>
                  <p className="text-xs text-primary/60 uppercase tracking-tighter mt-1">
                    ID: {selectedVisit.member_number || selectedVisit.user_id.substring(0, 8)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-background-dark/40 p-4 rounded-xl border border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-2">
                    Monto de la Compra
                  </p>
                  <p className="header-text text-2xl font-bold text-primary">
                    {formatCurrency(selectedVisit.amount)}
                  </p>
                </div>

                <div className="bg-background-dark/40 p-4 rounded-xl border border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-2">
                    Estado Actual
                  </p>
                  <p className={`text-sm font-bold ${
                    selectedVisit.status === 'approved' ? 'text-primary' : selectedVisit.status === 'rejected' ? 'text-red-400' : 'text-primary/70'
                  }`}>
                    {selectedVisit.status === 'approved' ? '✓ Aprobado' : selectedVisit.status === 'rejected' ? '✗ Rechazado' : '⏳ Pendiente'}
                  </p>
                </div>

                <div className="bg-background-dark/40 p-4 rounded-xl border border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-2">
                    Local
                  </p>
                  <p className="text-sm text-primary font-sans">
                    {selectedVisit.location_code?.toUpperCase() || 'N/A'}
                  </p>
                </div>

                <div className="bg-background-dark/40 p-4 rounded-xl border border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-2">
                    Fecha y Hora
                  </p>
                  <p className="text-sm text-primary font-sans">
                    {formatDate(selectedVisit.created_at)}
                  </p>
                  <p className="text-xs text-primary/60 mt-1">
                    {formatTimeAgo(selectedVisit.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-primary/20">
                {selectedVisit.status === 'approved' && (
                  <button
                    onClick={() => handleRejectVisit(selectedVisit.id, false)}
                    disabled={processingVisit === selectedVisit.id}
                    className="flex-1 border-2 border-red-400/40 text-red-400 py-3 rounded-lg header-text font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {processingVisit === selectedVisit.id ? 'Cambiando...' : 'Cambiar a Rechazado'}
                  </button>
                )}
                {selectedVisit.status === 'rejected' && (
                  <button
                    onClick={() => handleApproveVisit(selectedVisit.id)}
                    disabled={processingVisit === selectedVisit.id}
                    className="flex-1 bg-primary text-forest py-3 rounded-lg header-text font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {processingVisit === selectedVisit.id ? 'Cambiando...' : 'Cambiar a Aprobado'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
