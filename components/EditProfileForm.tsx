'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import { Input } from './ui/Input';
import { PasswordInput } from './ui/PasswordInput';
import { Button } from './ui/Button';

export default function EditProfileForm() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Datos del perfil
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Cambio de contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUserId(user.id);
      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setPhotoUrl(profile.photo_url || '');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!userId) {
        throw new Error('No user ID');
      }

      // Actualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Cambiar contraseña si se proporcionó
      if (showPasswordSection && newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        if (newPassword.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) throw passwordError;

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      }

      setMessage({ type: 'success', text: '¡Perfil actualizado exitosamente!' });
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al guardar. Por favor intenta de nuevo.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-primary font-display text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      {/* Foto de perfil */}
      {userId && (
        <ProfilePhotoUpload
          userId={userId}
          currentPhotoUrl={photoUrl}
          onPhotoUpdate={setPhotoUrl}
        />
      )}

      {/* Formulario */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Nombre Completo */}
        <div className="space-y-2">
          <label className="header-text text-xs font-bold text-primary block">
            Nombre Completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-transparent border-primary border-2 text-primary focus:ring-1 focus:ring-primary focus:border-primary placeholder-primary/40 p-4 w-full font-sans"
            required
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label className="header-text text-xs font-bold text-primary block">
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-transparent border-primary border-2 text-primary focus:ring-1 focus:ring-primary focus:border-primary placeholder-primary/40 p-4 w-full font-sans"
            required
          />
        </div>

        {/* Email (solo lectura) */}
        <div className="space-y-2">
          <label className="header-text text-xs font-bold text-primary block">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="bg-transparent border-primary/50 border-2 text-primary/50 p-4 w-full font-sans cursor-not-allowed"
          />
          <p className="text-xs text-primary/60 font-sans">
            El correo no se puede cambiar. Contacta soporte si necesitas actualizarlo.
          </p>
        </div>

        {/* Sección de cambiar contraseña */}
        <div className="pt-4">
          {!showPasswordSection ? (
            <button
              type="button"
              onClick={() => setShowPasswordSection(true)}
              className="text-primary/80 hover:text-primary text-sm font-sans underline decoration-primary/30 underline-offset-4 transition-colors"
            >
              Cambiar contraseña
            </button>
          ) : (
            <div className="space-y-4 border-t border-primary/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="header-text text-xs font-bold text-primary">
                  Cambiar Contraseña
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-primary/60 hover:text-primary text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="space-y-2">
                <label className="header-text text-xs font-bold text-primary block">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-transparent border-primary border-2 text-primary focus:ring-1 focus:ring-primary focus:border-primary placeholder-primary/40 p-4 w-full font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="header-text text-xs font-bold text-primary block">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contraseña"
                  className="bg-transparent border-primary border-2 text-primary focus:ring-1 focus:ring-primary focus:border-primary placeholder-primary/40 p-4 w-full font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mensaje */}
        {message && (
          <div
            className={`text-sm font-sans p-3 border ${
              message.type === 'success'
                ? 'text-green-400 border-green-400/50 bg-green-400/10'
                : 'text-red-400 border-red-400/50 bg-red-400/10'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Botón Guardar */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="relative w-full header-text h-14 bg-primary text-forest font-bold tracking-widest text-base shadow-xl active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <span className="relative z-10">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </span>
            <div className="absolute inset-0 m-[3px] border border-dotted border-forest pointer-events-none"></div>
          </button>
        </div>
      </form>

      {/* Cerrar Sesión */}
      <div className="mt-12 text-center flex flex-col items-center gap-4 pb-8">
        <div className="flex items-center gap-2 opacity-30">
          <span className="material-symbols-outlined text-sm">potted_plant</span>
          <div className="w-12 h-px bg-primary"></div>
          <span className="material-symbols-outlined text-sm">potted_plant</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="header-text text-xs font-bold tracking-[0.2em] text-red-400/80 hover:text-red-400 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </>
  );
}
