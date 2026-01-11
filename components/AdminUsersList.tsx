'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

interface AdminUsersListProps {
  userId: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  member_number: string;
  created_at: string;
  photo_url: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  stamps_count: number;
  rewards_count: number;
}

export default function AdminUsersList({ userId }: AdminUsersListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar foto de perfil del admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('photo_url, avatar_url')
          .eq('id', userId)
          .single();

        if (profile?.photo_url || profile?.avatar_url) {
          setProfilePhoto(profile.photo_url || profile.avatar_url);
        }

        // Cargar todos los usuarios con rol 'user'
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, member_number, created_at, photo_url, avatar_url, birth_date')
          .eq('role', 'user')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('AdminUsersList: Error cargando perfiles:', profilesError);
          setLoading(false);
          return;
        }

        if (!profiles || profiles.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Obtener conteo de sellos y recompensas para cada usuario
        const usersWithStats: User[] = await Promise.all(
          (profiles || []).map(async (profile: any) => {
            // Contar sellos aprobados
            const { count: stampsCount } = await supabase
              .from('stamps')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id)
              .eq('status', 'approved');

            // Contar recompensas canjeadas
            const { count: rewardsCount } = await supabase
              .from('user_rewards')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id)
              .not('redeemed_at', 'is', null);

            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              member_number: profile.member_number,
              created_at: profile.created_at,
              photo_url: profile.photo_url,
              avatar_url: profile.avatar_url,
              birth_date: profile.birth_date,
              stamps_count: stampsCount || 0,
              rewards_count: rewardsCount || 0,
            };
          })
        );

        setUsers(usersWithStats);
        setLoading(false);
      } catch (error) {
        console.error('AdminUsersList: Error cargando datos:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [userId, supabase]);

  const defaultPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbl1WDM1WqTkJbz9-4o6m5QoLp7awcHBQiSfoXRWFGeqnBVMj-AQZx7Za-6_q5enGIPtpuuemMh-nguGWfjckrE0PB26WI8Am8tU7CxqY099hNXLM1YB30oT7HzpF5_yf2y7MnafTG898mqa9ZMGpLEQ43x1DPOdrhQs_m2bbfCMlNMKD7bEQV0i97eEm21eJ1aBUsMBCHqGcGSWWoWgKDpFSbJD2IsKBFebLwZdzLhiyZ77L2SwUkcbFXpbxDW2wBxI_C4YmemHFf';

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.member_number.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    setUserDetails(null);

      try {
        // Cargar detalles completos del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Cargar todos los sellos del usuario
        const { data: stamps } = await supabase
          .from('stamps')
          .select('id, created_at, status, amount, location_code, collected_by')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Cargar todas las recompensas del usuario
        const { data: userRewards } = await supabase
          .from('user_rewards')
          .select('id, redeemed_at, created_at, rewards(id, name, description, required_stamps)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Cargar información de quien aprobó los sellos (si aplica)
        const collectorIds = [...new Set((stamps || []).map((s: any) => s.collected_by).filter(Boolean))];
        let collectorsMap = new Map();
        if (collectorIds.length > 0) {
          const { data: collectors } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', collectorIds);
          
          if (collectors) {
            collectors.forEach((collector: any) => {
              collectorsMap.set(collector.id, collector.full_name || 'Admin');
            });
          }
        }

        setUserDetails({
          profile,
          stamps: stamps || [],
          rewards: userRewards || [],
          collectorsMap,
        });
    } catch (error) {
      console.error('AdminUsersList: Error cargando detalles:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-forest">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff05 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header */}
      <header className="flex items-center p-6 pb-4 justify-between sticky top-0 z-20 bg-forest/95 backdrop-blur-sm border-b border-primary/20">
        <div className="text-primary flex size-10 items-center justify-start">
          <span className="material-symbols-outlined text-2xl cursor-pointer" onClick={() => router.push('/admin')}>
            menu
          </span>
        </div>
        <h1 className="header-text text-primary text-lg font-bold flex-1 text-center">USUARIOS</h1>
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
      <main className="relative z-10">
        {/* Barra de búsqueda */}
        <section className="p-6">
          <div className="vintage-card p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary/60">search</span>
              <input
                type="text"
                placeholder="Buscar por nombre, email o número de socio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-primary placeholder-primary/40 font-sans text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-primary/60 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-primary/50 text-[10px] font-sans mt-2 text-center">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}
          </p>
        </section>

        {/* Lista de usuarios */}
        <section className="px-6 pb-32">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="vintage-card p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/20"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-primary/20 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-primary/10 rounded w-48"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="vintage-card p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">person_off</span>
              <p className="text-primary/60 text-sm font-sans">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const userPhoto = user.photo_url || user.avatar_url || defaultPhoto;
                const memberNumber = parseInt(user.member_number, 10).toString();

                return (
                  <div
                    key={user.id}
                    className="vintage-card p-4 cursor-pointer hover:bg-forest/60 transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Foto de perfil */}
                      <div className="size-12 rounded-full border-2 border-primary overflow-hidden flex-shrink-0">
                        {userPhoto ? (
                          <Image
                            src={userPhoto}
                            alt={user.full_name || 'Usuario'}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img alt={user.full_name || 'Usuario'} className="w-full h-full object-cover" src={defaultPhoto} />
                        )}
                      </div>

                      {/* Información del usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="header-text text-sm font-bold text-primary truncate">
                              {user.full_name || 'Usuario sin nombre'}
                            </h3>
                            <p className="text-[10px] text-primary/60 font-sans truncate">{user.email}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-primary/50 font-sans">Socio #{memberNumber}</span>
                              <span className="text-primary/30">•</span>
                              <span className="text-[10px] text-primary/50 font-sans">{formatDate(user.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary/10">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary/60 text-base">potted_plant</span>
                            <span className="text-[10px] text-primary/70 font-sans">{user.stamps_count} sellos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary/60 text-base">redeem</span>
                            <span className="text-[10px] text-primary/70 font-sans">{user.rewards_count} recompensas</span>
                          </div>
                        </div>
                      </div>

                      {/* Flecha */}
                      <span className="material-symbols-outlined text-primary/40 text-xl flex-shrink-0">chevron_right</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-forest/95 border-t border-primary/30 px-8 py-4 flex justify-between items-center backdrop-blur-md z-30">
        <button
          onClick={() => router.push('/admin')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">dashboard</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Panel</span>
        </button>
        <div className="flex flex-col items-center text-primary relative">
          <span className="material-symbols-outlined text-2xl">groups</span>
          <span className="text-[8px] uppercase mt-1 font-bold tracking-tighter">Usuarios</span>
        </div>
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

      {/* Modal de detalles del usuario */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-forest border-2 border-primary vintage-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 z-10 bg-forest/95 backdrop-blur-sm border-b border-primary/20 p-6 flex items-center justify-between">
              <h2 className="header-text text-primary text-lg font-bold">DETALLES DEL USUARIO</h2>
              <button
                onClick={closeModal}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-primary font-sans">Cargando detalles...</div>
                </div>
              ) : userDetails ? (
                <>
                  {/* Foto y nombre */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-24 rounded-full border-4 border-primary overflow-hidden">
                      {selectedUser.photo_url || selectedUser.avatar_url ? (
                        <Image
                          src={selectedUser.photo_url || selectedUser.avatar_url || defaultPhoto}
                          alt={selectedUser.full_name || 'Usuario'}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          alt={selectedUser.full_name || 'Usuario'}
                          className="w-full h-full object-cover"
                          src={defaultPhoto}
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="header-text text-xl font-bold text-primary">
                        {selectedUser.full_name || 'Usuario sin nombre'}
                      </h3>
                      <p className="text-primary/60 text-sm font-sans mt-1">{selectedUser.email}</p>
                      <p className="text-primary/50 text-xs font-sans mt-2">
                        Socio #{parseInt(selectedUser.member_number, 10).toString()}
                      </p>
                    </div>
                  </div>

                  {/* Información general */}
                  <div className="vintage-card p-4 space-y-3">
                    <h4 className="header-text text-xs font-bold text-primary opacity-70 tracking-widest">
                      INFORMACIÓN GENERAL
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-primary/70 text-xs font-sans">Email:</span>
                        <span className="text-primary text-xs font-sans font-bold truncate ml-2">
                          {userDetails.profile.email}
                        </span>
                      </div>
                      {userDetails.profile.phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-primary/70 text-xs font-sans">Teléfono:</span>
                          <span className="text-primary text-xs font-sans font-bold">
                            {userDetails.profile.phone}
                          </span>
                        </div>
                      )}
                      {userDetails.profile.birth_date && (
                        <div className="flex justify-between items-center">
                          <span className="text-primary/70 text-xs font-sans">Fecha de Nacimiento:</span>
                          <span className="text-primary text-xs font-sans font-bold">
                            {new Date(userDetails.profile.birth_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-primary/70 text-xs font-sans">Fecha de registro:</span>
                        <span className="text-primary text-xs font-sans font-bold">
                          {formatDate(selectedUser.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/70 text-xs font-sans">ID de usuario:</span>
                        <span className="text-primary text-[10px] font-sans font-mono truncate ml-2">
                          {selectedUser.id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="vintage-card p-4">
                      <p className="text-primary/70 text-[10px] font-sans uppercase tracking-wider mb-2">Total Sellos</p>
                      <div className="flex items-end justify-between">
                        <span className="header-text text-2xl font-bold text-primary leading-none">
                          {userDetails.stamps.length}
                        </span>
                        <span className="material-symbols-outlined text-primary/40 text-xl">potted_plant</span>
                      </div>
                      <p className="text-primary/50 text-[9px] font-sans mt-2">
                        {userDetails.stamps.filter((s: any) => s.status === 'approved').length} aprobados
                      </p>
                    </div>
                    <div className="vintage-card p-4">
                      <p className="text-primary/70 text-[10px] font-sans uppercase tracking-wider mb-2">Recompensas</p>
                      <div className="flex items-end justify-between">
                        <span className="header-text text-2xl font-bold text-primary leading-none">
                          {userDetails.rewards.filter((r: any) => r.redeemed_at).length}
                        </span>
                        <span className="material-symbols-outlined text-primary/40 text-xl">redeem</span>
                      </div>
                      <p className="text-primary/50 text-[9px] font-sans mt-2">
                        {userDetails.rewards.length} totales
                      </p>
                    </div>
                  </div>

                  {/* Historial de sellos */}
                  {userDetails.stamps.length > 0 ? (
                    <div className="vintage-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="header-text text-xs font-bold text-primary opacity-70 tracking-widest">
                          HISTORIAL DE SELLOS ({userDetails.stamps.length})
                        </h4>
                        <span className="text-primary/50 text-[9px] font-sans">
                          {userDetails.stamps.filter((s: any) => s.status === 'pending').length} pendientes
                        </span>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userDetails.stamps.map((stamp: any) => {
                          const collectorName = stamp.collected_by
                            ? userDetails.collectorsMap.get(stamp.collected_by) || 'Admin'
                            : null;
                          return (
                            <div
                              key={stamp.id}
                              className={`flex items-start justify-between p-3 bg-forest/40 rounded border ${
                                stamp.status === 'approved'
                                  ? 'border-primary/20'
                                  : stamp.status === 'pending'
                                  ? 'border-primary/10 opacity-70'
                                  : 'border-red-400/20 opacity-60'
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <span
                                  className={`material-symbols-outlined text-xl ${
                                    stamp.status === 'approved'
                                      ? 'text-primary'
                                      : stamp.status === 'pending'
                                      ? 'text-primary/50'
                                      : 'text-red-400'
                                  }`}
                                >
                                  potted_plant
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-primary text-xs font-sans font-bold">
                                      {stamp.status === 'approved'
                                        ? 'Aprobado'
                                        : stamp.status === 'pending'
                                        ? 'Pendiente'
                                        : 'Rechazado'}
                                    </p>
                                    {stamp.location_code && (
                                      <span className="text-primary/40 text-[9px] font-sans px-2 py-0.5 bg-primary/10 rounded">
                                        {stamp.location_code.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-primary/50 text-[10px] font-sans mt-1">
                                    {formatDate(stamp.created_at)}
                                  </p>
                                  {collectorName && (
                                    <p className="text-primary/40 text-[9px] font-sans mt-1">
                                      Por: {collectorName}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {stamp.amount && (
                                <span className="text-primary/80 text-xs font-sans font-bold flex-shrink-0 ml-2">
                                  ${parseFloat(stamp.amount).toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="vintage-card p-4 text-center">
                      <span className="material-symbols-outlined text-4xl text-primary/30 mb-2 block">potted_plant</span>
                      <p className="text-primary/50 text-xs font-sans">No hay sellos registrados</p>
                    </div>
                  )}

                  {/* Historial de recompensas */}
                  {userDetails.rewards.length > 0 ? (
                    <div className="vintage-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="header-text text-xs font-bold text-primary opacity-70 tracking-widest">
                          RECOMPENSAS ({userDetails.rewards.length})
                        </h4>
                        <span className="text-primary/50 text-[9px] font-sans">
                          {userDetails.rewards.filter((r: any) => r.redeemed_at).length} canjeadas
                        </span>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userDetails.rewards.map((reward: any) => {
                          const rewardData = Array.isArray(reward.rewards) ? reward.rewards[0] : reward.rewards;
                          return (
                            <div
                              key={reward.id}
                              className={`flex items-start justify-between p-3 bg-forest/40 rounded border ${
                                reward.redeemed_at ? 'border-primary/20' : 'border-primary/10 opacity-70'
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <span className="material-symbols-outlined text-xl text-primary">redeem</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-primary text-xs font-sans font-bold">
                                    {rewardData?.name || 'Recompensa'}
                                  </p>
                                  {rewardData?.description && (
                                    <p className="text-primary/60 text-[10px] font-sans mt-1">
                                      {rewardData.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1">
                                    {reward.redeemed_at ? (
                                      <p className="text-primary/50 text-[10px] font-sans">
                                        Canjeada: {formatDate(reward.redeemed_at)}
                                      </p>
                                    ) : (
                                      <p className="text-primary/40 text-[10px] font-sans italic">No canjeada</p>
                                    )}
                                    {rewardData?.required_stamps && (
                                      <span className="text-primary/40 text-[9px] font-sans">
                                        • {rewardData.required_stamps} sellos requeridos
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {reward.redeemed_at ? (
                                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 ml-2">
                                  check_circle
                                </span>
                              ) : (
                                <span className="material-symbols-outlined text-primary/30 text-lg flex-shrink-0 ml-2">
                                  pending
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="vintage-card p-4 text-center">
                      <span className="material-symbols-outlined text-4xl text-primary/30 mb-2 block">redeem</span>
                      <p className="text-primary/50 text-xs font-sans">No hay recompensas registradas</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-primary/60 font-sans">No se pudieron cargar los detalles</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
