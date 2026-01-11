'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

interface AdminAnalyticsProps {
  userId: string;
}

interface RewardBreakdown {
  id: string;
  name: string;
  count: number;
  percentage: number;
  icon: string;
}

type DateRange = '7days' | '30days' | '6months';

export default function AdminAnalytics({ userId }: AdminAnalyticsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Métricas principales
  const [totalClients, setTotalClients] = useState(0);
  const [registrationsThisMonth, setRegistrationsThisMonth] = useState(0);
  const [registrationsLastMonth, setRegistrationsLastMonth] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  const [rewardBreakdown, setRewardBreakdown] = useState<RewardBreakdown[]>([]);
  const [conversionRate, setConversionRate] = useState(0);

  // Calcular fecha de inicio según el rango seleccionado
  const getStartDate = (range: DateRange): Date => {
    const now = new Date();
    const start = new Date();

    switch (range) {
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case '6months':
        start.setMonth(now.getMonth() - 6);
        break;
    }

    return start;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar foto de perfil del admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('photo_url, avatar_url')
          .eq('id', userId)
          .single();

        if (profile?.photo_url || profile?.avatar_url) {
          setProfilePhoto(profile.photo_url || profile.avatar_url);
        }

        const startDate = getStartDate(dateRange);
        const startDateISO = startDate.toISOString();

        // Calcular fechas para el mes actual y anterior (solo para comparación de registros)
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfLastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total de clientes únicos (siempre total, no filtrado por fecha)
        const { count: clientsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user');

        setTotalClients(clientsCount || 0);

        // Registros en el período seleccionado
        const { count: regThisPeriod } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user')
          .gte('created_at', startDateISO);

        setRegistrationsThisMonth(regThisPeriod || 0);

        // Para comparación de crecimiento, usar el período anterior equivalente
        let comparisonStartDate: Date;
        let comparisonEndDate: Date;

        if (dateRange === '7days') {
          comparisonEndDate = new Date(startDate);
          comparisonStartDate = new Date(comparisonEndDate);
          comparisonStartDate.setDate(comparisonEndDate.getDate() - 7);
        } else if (dateRange === '30days') {
          comparisonEndDate = new Date(startDate);
          comparisonStartDate = new Date(comparisonEndDate);
          comparisonStartDate.setDate(comparisonEndDate.getDate() - 30);
        } else {
          // 6 meses
          comparisonEndDate = new Date(startDate);
          comparisonStartDate = new Date(comparisonEndDate);
          comparisonStartDate.setMonth(comparisonEndDate.getMonth() - 6);
        }

        const { count: regPreviousPeriod } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user')
          .gte('created_at', comparisonStartDate.toISOString())
          .lt('created_at', comparisonEndDate.toISOString());

        setRegistrationsLastMonth(regPreviousPeriod || 0);

        // Visitas totales (stamps aprobados en el período seleccionado)
        const { count: visitsCount } = await supabase
          .from('stamps')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .gte('created_at', startDateISO);

        setTotalVisits(visitsCount || 0);

        // Redenciones totales (recompensas canjeadas en el período seleccionado)
        const { count: redemptionsCount } = await supabase
          .from('user_rewards')
          .select('*', { count: 'exact', head: true })
          .not('redeemed_at', 'is', null)
          .gte('redeemed_at', startDateISO);

        setTotalRedemptions(redemptionsCount || 0);

        // Desglose de recompensas
        const { data: redeemedRewards } = await supabase
          .from('user_rewards')
          .select('reward_id, rewards(id, name, icon)')
          .not('redeemed_at', 'is', null)
          .gte('redeemed_at', startDateISO);

        // Contar recompensas por tipo
        const rewardCounts = new Map<string, { name: string; count: number; icon: string }>();
        
        if (redeemedRewards) {
          redeemedRewards.forEach((item: any) => {
            const reward = Array.isArray(item.rewards) ? item.rewards[0] : item.rewards;
            if (reward) {
              const key = reward.id;
              const existing = rewardCounts.get(key) || { name: reward.name, count: 0, icon: reward.icon || 'redeem' };
              existing.count++;
              rewardCounts.set(key, existing);
            }
          });
        }

        // Calcular porcentajes
        const breakdown: RewardBreakdown[] = Array.from(rewardCounts.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          count: data.count,
          percentage: (redemptionsCount || 0) > 0 ? (data.count / (redemptionsCount || 0)) * 100 : 0,
          icon: data.icon || 'redeem',
        }));

        // Ordenar por cantidad descendente
        breakdown.sort((a, b) => b.count - a.count);
        setRewardBreakdown(breakdown);

        // Calcular tasa de conversión (visitas que resultaron en redenciones)
        const conversion = visitsCount && visitsCount > 0 ? ((redemptionsCount || 0) / visitsCount) * 100 : 0;
        setConversionRate(conversion);

        setLoading(false);
      } catch (error) {
        console.error('AdminAnalytics: Error cargando datos:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [userId, supabase, dateRange]);

  const defaultPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbl1WDM1WqTkJbz9-4o6m5QoLp7awcHBQiSfoXRWFGeqnBVMj-AQZx7Za-6_q5enGIPtpuuemMh-nguGWfjckrE0PB26WI8Am8tU7CxqY099hNXLM1YB30oT7HzpF5_yf2y7MnafTG898mqa9ZMGpLEQ43x1DPOdrhQs_m2bbfCMlNMKD7bEQV0i97eEm21eJ1aBUsMBCHqGcGSWWoWgKDpFSbJD2IsKBFebLwZdzLhiyZ77L2SwUkcbFXpbxDW2wBxI_C4YmemHFf';

  const calculateGrowth = () => {
    if (registrationsLastMonth === 0) {
      return registrationsThisMonth > 0 ? 100 : 0;
    }
    return ((registrationsThisMonth - registrationsLastMonth) / registrationsLastMonth) * 100;
  };

  const growth = calculateGrowth();
  const growthIcon = growth >= 0 ? 'trending_up' : 'trending_down';

  const getDateRangeLabel = (range: DateRange): string => {
    switch (range) {
      case '7days':
        return 'Últimos 7 días';
      case '30days':
        return 'Último mes';
      case '6months':
        return 'Últimos 6 meses';
    }
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    setShowDatePicker(false);
  };

  // Iconos por defecto para tipos de recompensas
  const getRewardIcon = (name: string, defaultIcon: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('café') || lowerName.includes('coffee')) return 'coffee';
    if (lowerName.includes('pan') || lowerName.includes('bread')) return 'bakery_dining';
    if (lowerName.includes('postre') || lowerName.includes('dessert') || lowerName.includes('cake')) return 'cake';
    return defaultIcon || 'redeem';
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-forest">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff05 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header */}
      <header className="flex items-center p-6 pb-2 justify-between sticky top-0 z-20 bg-forest/95 backdrop-blur-sm border-b border-primary/20">
        <div className="text-primary flex size-10 items-center justify-start">
          <span className="material-symbols-outlined text-2xl cursor-pointer" onClick={() => router.push('/admin')}>
            analytics
          </span>
        </div>
        <h1 className="header-text text-primary text-lg font-bold flex-1 text-center">Métricas de Negocio</h1>
        <div className="flex size-10 items-center justify-end">
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
      <main className="p-6 space-y-6 relative z-10 pb-32">
        {/* Rango de Fechas */}
        <section>
          <label className="header-text text-primary text-[10px] font-bold mb-2 block opacity-70 tracking-widest">
            Rango de Fechas
          </label>
          <div className="relative">
            <div
              className="vintage-card p-3 flex items-center justify-between cursor-pointer hover:bg-forest/60 transition-colors"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
                <span className="font-sans text-sm font-medium">{getDateRangeLabel(dateRange)}</span>
              </div>
              <span className={`material-symbols-outlined text-primary transition-transform ${showDatePicker ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </div>

            {/* Dropdown de opciones */}
            {showDatePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDatePicker(false)}
                ></div>
                <div className="absolute top-full left-0 right-0 mt-2 z-50 vintage-card border-2 border-primary">
                  <button
                    onClick={() => handleDateRangeChange('7days')}
                    className={`w-full p-3 text-left hover:bg-forest/60 transition-colors flex items-center justify-between ${
                      dateRange === '7days' ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="font-sans text-sm font-medium text-primary">Últimos 7 días</span>
                    {dateRange === '7days' && (
                      <span className="material-symbols-outlined text-primary text-lg">check</span>
                    )}
                  </button>
                  <div className="h-px bg-primary/20"></div>
                  <button
                    onClick={() => handleDateRangeChange('30days')}
                    className={`w-full p-3 text-left hover:bg-forest/60 transition-colors flex items-center justify-between ${
                      dateRange === '30days' ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="font-sans text-sm font-medium text-primary">Último mes</span>
                    {dateRange === '30days' && (
                      <span className="material-symbols-outlined text-primary text-lg">check</span>
                    )}
                  </button>
                  <div className="h-px bg-primary/20"></div>
                  <button
                    onClick={() => handleDateRangeChange('6months')}
                    className={`w-full p-3 text-left hover:bg-forest/60 transition-colors flex items-center justify-between ${
                      dateRange === '6months' ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="font-sans text-sm font-medium text-primary">Últimos 6 meses</span>
                    {dateRange === '6months' && (
                      <span className="material-symbols-outlined text-primary text-lg">check</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* KPIs de Negocio */}
        <section>
          <h2 className="header-text text-primary text-[10px] font-bold mb-4 opacity-70 tracking-widest">
            KPIs de Negocio
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="vintage-card p-4 animate-pulse">
                  <div className="h-3 bg-primary/20 rounded w-16 mb-2"></div>
                  <div className="h-8 bg-primary/20 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="vintage-card p-4">
                <p className="text-[9px] uppercase font-sans tracking-wider opacity-60 mb-1">Total Clientes</p>
                <p className="font-sans text-2xl font-bold text-primary">{totalClients.toLocaleString()}</p>
                <p className="text-[8px] text-primary/50 mt-1 font-sans">Únicos totales</p>
              </div>
              <div className="vintage-card p-4">
                <p className="text-[9px] uppercase font-sans tracking-wider opacity-60 mb-1">Registros Mes</p>
                <p className="font-sans text-2xl font-bold text-primary">{registrationsThisMonth}</p>
                <div className="flex items-center text-[8px] text-primary/80 mt-1 font-sans">
                  <span className={`material-symbols-outlined text-[10px] mr-0.5 ${growth >= 0 ? 'text-primary' : 'text-red-400'}`}>
                    {growthIcon}
                  </span>
                  {growth >= 0 ? '+' : ''}
                  {growth.toFixed(1)}% vs ant.
                </div>
              </div>
              <div className="vintage-card p-4">
                <p className="text-[9px] uppercase font-sans tracking-wider opacity-60 mb-1">Visitas Totales</p>
                <p className="font-sans text-2xl font-bold text-primary">{totalVisits.toLocaleString()}</p>
                <p className="text-[8px] text-primary/50 mt-1 font-sans">En el periodo</p>
              </div>
              <div className="vintage-card p-4">
                <p className="text-[9px] uppercase font-sans tracking-wider opacity-60 mb-1">Redenciones</p>
                <p className="font-sans text-2xl font-bold text-primary">{totalRedemptions}</p>
                <p className="text-[8px] text-primary/50 mt-1 font-sans">Premios canjeados</p>
              </div>
            </div>
          )}
        </section>

        {/* Desglose Detallado */}
        <section>
          <h2 className="header-text text-primary text-[10px] font-bold mb-4 opacity-70 tracking-widest">
            Desglose Detallado
          </h2>
          {loading ? (
            <div className="space-y-0 border border-primary/20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-forest flex items-center justify-between border-b border-primary/10 animate-pulse">
                  <div className="h-4 bg-primary/20 rounded w-32"></div>
                  <div className="h-4 bg-primary/20 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : rewardBreakdown.length > 0 ? (
            <>
              <div className="space-y-0 border border-primary/20">
                {rewardBreakdown.map((reward, index) => (
                  <div
                    key={reward.id}
                    className={`p-4 bg-forest flex items-center justify-between ${
                      index < rewardBreakdown.length - 1 ? 'border-b border-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary/60">
                        {getRewardIcon(reward.name, reward.icon)}
                      </span>
                      <span className="header-text text-[11px] font-bold">{reward.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-sans text-sm font-bold text-primary">{reward.count}</span>
                      <span className="text-[9px] text-primary/40 block">{reward.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rustic-border bg-primary/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-sans font-semibold tracking-wider">Tasa de Conversión</span>
                  <span className="font-sans font-bold">{conversionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${Math.min(conversionRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <div className="vintage-card p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">bar_chart</span>
              <p className="text-primary/60 text-sm font-sans">No hay datos de redenciones disponibles</p>
            </div>
          )}
        </section>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-forest border-t border-primary/20 px-8 py-3 flex justify-between items-center backdrop-blur-md z-30">
        <button
          onClick={() => router.push('/admin')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">dashboard</span>
          <span className="text-[8px] uppercase mt-1 font-bold">Panel</span>
        </button>
        <button
          onClick={() => router.push('/admin/users')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">groups</span>
          <span className="text-[8px] uppercase mt-1 font-bold">Usuarios</span>
        </button>
        <div className="flex flex-col items-center text-primary">
          <span className="material-symbols-outlined text-2xl">analytics</span>
          <span className="text-[8px] uppercase mt-1 font-bold">Datos</span>
        </div>
        <button
          onClick={() => router.push('/admin/rewards')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">loyalty</span>
          <span className="text-[8px] uppercase mt-1 font-bold">Catálogo</span>
        </button>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24"></div>
    </div>
  );
}
