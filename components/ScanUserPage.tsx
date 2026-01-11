'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface ScanUserPageProps {
  targetUserId: string;
}

export default function ScanUserPage({ targetUserId }: ScanUserPageProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [stamps, setStamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    const { data: userStamps, count } = await supabase
      .from('stamps')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    setProfile(userProfile);
    setStamps(userStamps || []);
    setLoading(false);
  }, [supabase, targetUserId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleAddStamp = async () => {
    setAdding(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('stamps').insert({
      user_id: targetUserId,
      collected_by: user?.id,
    });

    if (error) {
      setMessage({ type: 'error', text: 'Error al agregar sello' });
    } else {
      setMessage({ type: 'success', text: 'Sello agregado exitosamente!' });
      await loadUserData();
    }

    setAdding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary font-sans">Cargando...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-primary font-sans mb-4">Usuario no encontrado</p>
          <button
            onClick={() => router.push('/staff')}
            className="header-text h-12 px-6 border border-primary text-primary font-bold tracking-widest text-sm"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center p-6 pb-2 justify-between sticky top-0 z-10 bg-forest/95 backdrop-blur-sm">
        <button
          onClick={() => router.push('/staff')}
          className="text-primary flex size-12 shrink-0 items-center justify-start"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </button>
        <h2 className="header-text text-primary text-lg font-bold flex-1 text-center">
          Usuario
        </h2>
        <div className="w-12"></div>
      </div>

      <div className="p-6 space-y-6">
        <div className="rustic-border bg-forest p-6">
          <div className="flex flex-col items-center gap-4">
            {profile.avatar_url && (
              <div className="size-20 rounded-full bg-cover border-2 border-primary" style={{ backgroundImage: `url("${profile.avatar_url}")` }}></div>
            )}
            <div className="text-center">
              <p className="header-text text-primary text-xl font-bold">
                {profile.full_name || 'Usuario'}
              </p>
              <p className="text-primary/80 text-sm font-sans mt-1">
                Socio No. {profile.member_number}
              </p>
              <p className="text-primary/70 text-xs font-sans mt-1 italic">
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        <div className="rustic-border bg-forest p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="header-text text-primary font-bold text-sm">Sellos Totales</p>
            <p className="header-text text-2xl font-bold text-primary">
              {stamps.length}
            </p>
          </div>
          <button
            onClick={handleAddStamp}
            disabled={adding}
            className="w-full header-text h-12 bg-primary text-forest font-bold tracking-widest text-sm disabled:opacity-50"
          >
            {adding ? 'Agregando...' : 'Agregar Sello'}
          </button>
          {message && (
            <div
              className={`text-sm font-sans p-3 border mt-4 ${
                message.type === 'success'
                  ? 'text-green-400 border-green-400/50 bg-green-400/10'
                  : 'text-red-400 border-red-400/50 bg-red-400/10'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {stamps.length > 0 && (
          <div className="rustic-border bg-forest p-6">
            <h3 className="header-text text-primary font-bold text-sm mb-4">
              Sellos Recientes
            </h3>
            <div className="space-y-2">
              {stamps.slice(0, 5).map((stamp) => (
                <div
                  key={stamp.id}
                  className="flex items-center gap-3 p-3 bg-forest/50 border border-primary/20"
                >
                  <span className="material-symbols-outlined text-primary">
                    potted_plant
                  </span>
                  <div className="flex-1">
                    <p className="text-primary text-xs font-sans">
                      {new Date(stamp.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
