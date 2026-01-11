'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

interface AdminRewardsCatalogProps {
  userId: string;
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  required_stamps: number;
  icon: string | null;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export default function AdminRewardsCatalog({ userId }: AdminRewardsCatalogProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    required_stamps: 10,
    icon: 'redeem',
    active: true,
  });

  useEffect(() => {
    loadData();
  }, [userId, supabase]);

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

      // Cargar todas las recompensas
      const { data: rewardsData, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('AdminRewardsCatalog: Error cargando recompensas:', error);
      } else {
        setRewards(rewardsData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('AdminRewardsCatalog: Error cargando datos:', error);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingReward(null);
    setFormData({
      name: '',
      description: '',
      required_stamps: 10,
      icon: 'redeem',
      active: true,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || '',
      required_stamps: reward.required_stamps,
      icon: reward.icon || 'redeem',
      active: reward.active,
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingReward) {
        // Actualizar recompensa existente
        const { error } = await supabase
          .from('rewards')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            required_stamps: formData.required_stamps,
            icon: formData.icon || 'redeem',
            active: formData.active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingReward.id);

        if (error) throw error;
      } else {
        // Crear nueva recompensa
        const { error } = await supabase.from('rewards').insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          required_stamps: formData.required_stamps,
          icon: formData.icon || 'redeem',
          active: formData.active,
        });

        if (error) throw error;
      }

      setShowCreateModal(false);
      await loadData();
    } catch (error: any) {
      console.error('AdminRewardsCatalog: Error guardando recompensa:', error);
      alert('Error al guardar la recompensa: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleToggleActive = async (reward: Reward) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({
          active: !reward.active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reward.id);

      if (error) throw error;

      await loadData();
    } catch (error: any) {
      console.error('AdminRewardsCatalog: Error actualizando estado:', error);
      alert('Error al actualizar el estado: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (reward: Reward) => {
    if (!confirm(`¿Estás seguro de eliminar la recompensa "${reward.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('rewards').delete().eq('id', reward.id);

      if (error) throw error;

      await loadData();
    } catch (error: any) {
      console.error('AdminRewardsCatalog: Error eliminando recompensa:', error);
      alert('Error al eliminar la recompensa: ' + (error.message || 'Error desconocido'));
    }
  };

  const defaultPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbl1WDM1WqTkJbz9-4o6m5QoLp7awcHBQiSfoXRWFGeqnBVMj-AQZx7Za-6_q5enGIPtpuuemMh-nguGWfjckrE0PB26WI8Am8tU7CxqY099hNXLM1YB30oT7HzpF5_yf2y7MnafTG898mqa9ZMGpLEQ43x1DPOdrhQs_m2bbfCMlNMKD7bEQV0i97eEm21eJ1aBUsMBCHqGcGSWWoWgKDpFSbJD2IsKBFebLwZdzLhiyZ77L2SwUkcbFXpbxDW2wBxI_C4YmemHFf';

  const commonIcons = [
    'redeem',
    'coffee',
    'bakery_dining',
    'cake',
    'local_cafe',
    'restaurant',
    'lunch_dining',
    'free_breakfast',
    'local_pizza',
    'icecream',
    'emoji_food_beverage',
    'fastfood',
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-forest">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff05 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header */}
      <header className="flex items-center p-6 pb-2 justify-between sticky top-0 z-20 bg-forest/95 backdrop-blur-sm border-b border-primary/20">
        <div className="text-primary flex size-10 items-center justify-start">
          <span className="material-symbols-outlined text-2xl cursor-pointer" onClick={() => router.push('/admin')}>
            arrow_back_ios
          </span>
        </div>
        <h1 className="header-text text-primary text-lg font-bold flex-1 text-center">Catálogo de Recompensas</h1>
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
        {/* Botón crear */}
        <button
          onClick={handleCreate}
          className="w-full vintage-card p-4 flex items-center justify-between hover:bg-forest/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">add_circle</span>
            <span className="header-text text-sm font-bold text-primary">Nueva Recompensa</span>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">arrow_forward</span>
        </button>

        {/* Lista de recompensas */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="vintage-card p-4 animate-pulse">
                <div className="h-4 bg-primary/20 rounded w-32 mb-2"></div>
                <div className="h-3 bg-primary/10 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <div className="vintage-card p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">redeem</span>
            <p className="text-primary/60 text-sm font-sans">No hay recompensas creadas</p>
            <p className="text-primary/40 text-xs font-sans mt-2">Crea tu primera recompensa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`vintage-card p-4 ${!reward.active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`size-14 rounded-full border-2 border-primary flex items-center justify-center ${
                      reward.active ? 'bg-primary/10' : 'bg-primary/5'
                    }`}>
                      <span className="material-symbols-outlined text-primary text-2xl">
                        {reward.icon || 'redeem'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="header-text text-sm font-bold text-primary">{reward.name}</h3>
                        {reward.description && (
                          <p className="text-primary/60 text-xs font-sans mt-1">{reward.description}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                          reward.active
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-primary/5 text-primary/50 border border-primary/10'
                        }`}
                      >
                        {reward.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary/10">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary/60 text-base">potted_plant</span>
                        <span className="text-[10px] text-primary/70 font-sans">
                          {reward.required_stamps} sellos
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-primary/10">
                      <button
                        onClick={() => handleToggleActive(reward)}
                        className={`flex-1 py-2 rounded border transition-colors ${
                          reward.active
                            ? 'border-primary/40 text-primary/70 hover:bg-primary/10'
                            : 'border-primary text-primary hover:bg-primary/20'
                        }`}
                      >
                        <span className="header-text text-[10px] font-bold uppercase tracking-wider">
                          {reward.active ? 'Desactivar' : 'Activar'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleEdit(reward)}
                        className="flex-1 py-2 rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                      >
                        <span className="header-text text-[10px] font-bold uppercase tracking-wider">Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(reward)}
                        className="py-2 px-4 rounded border border-red-400/40 text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de crear/editar */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-forest border-2 border-primary vintage-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-forest/95 backdrop-blur-sm border-b border-primary/20 p-6 flex items-center justify-between">
              <h2 className="header-text text-primary text-lg font-bold">
                {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="header-text text-xs font-bold text-primary block mb-2">
                  Nombre de la Recompensa
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="vintage-card p-3 w-full bg-transparent border-primary text-primary placeholder-primary/40 font-sans"
                  placeholder="Ej: Café de cortesía"
                  required
                />
              </div>

              <div>
                <label className="header-text text-xs font-bold text-primary block mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="vintage-card p-3 w-full bg-transparent border-primary text-primary placeholder-primary/40 font-sans min-h-[80px] resize-none"
                  placeholder="Describe la recompensa..."
                />
              </div>

              <div>
                <label className="header-text text-xs font-bold text-primary block mb-2">
                  Sellos Requeridos
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.required_stamps}
                  onChange={(e) => setFormData({ ...formData, required_stamps: parseInt(e.target.value) || 1 })}
                  className="vintage-card p-3 w-full bg-transparent border-primary text-primary font-sans"
                  required
                />
              </div>

              <div>
                <label className="header-text text-xs font-bold text-primary block mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`vintage-card p-3 flex items-center justify-center border-2 transition-colors ${
                        formData.icon === icon
                          ? 'border-primary bg-primary/20'
                          : 'border-primary/30 hover:border-primary/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="vintage-card p-3 w-full bg-transparent border-primary text-primary placeholder-primary/40 font-sans text-xs"
                  placeholder="O ingresa un nombre de icono personalizado"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="size-5 accent-primary cursor-pointer"
                />
                <label htmlFor="active" className="header-text text-xs font-bold text-primary cursor-pointer">
                  Recompensa activa (visible para usuarios)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 vintage-card p-4 border-primary/40 text-primary hover:bg-forest/60 transition-colors"
                >
                  <span className="header-text text-xs font-bold uppercase tracking-wider">Cancelar</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 vintage-card p-4 border-primary text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="header-text text-xs font-bold uppercase tracking-wider">
                    {editingReward ? 'Guardar Cambios' : 'Crear Recompensa'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        <button
          onClick={() => router.push('/admin/analytics')}
          className="flex flex-col items-center text-primary/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">analytics</span>
          <span className="text-[8px] uppercase mt-1 font-bold">Datos</span>
        </button>
        <div className="flex flex-col items-center text-primary">
          <span className="material-symbols-outlined text-2xl">loyalty</span>
          <span className="text-[8px] uppercase mt-1 font-bold">Catálogo</span>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24"></div>
    </div>
  );
}
