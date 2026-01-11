'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  onPhotoUpdate: (newUrl: string) => void;
}

export default function ProfilePhotoUpload({
  userId,
  currentPhotoUrl,
  onPhotoUpdate,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const supabase = createClient();

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const newPhotoUrl = data.publicUrl;

      // Actualizar perfil en la base de datos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: newPhotoUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      setPhotoUrl(newPhotoUrl);
      onPhotoUpdate(newPhotoUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Iniciales del usuario como fallback
  const getInitials = () => {
    return 'U';
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative group">
        {/* Foto de perfil */}
        <div className="size-32 rounded-full border-4 border-primary p-1 overflow-hidden">
          {photoUrl ? (
            <div className="w-full h-full rounded-full relative">
              <Image
                src={photoUrl}
                alt="Foto de perfil"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-4xl font-display font-bold">
                {getInitials()}
              </span>
            </div>
          )}
        </div>

        {/* Botón de cámara */}
        <button
          onClick={handleButtonClick}
          disabled={uploading}
          className="absolute bottom-0 right-0 bg-primary text-forest size-10 rounded-full flex items-center justify-center border-2 border-forest shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
        >
          {uploading ? (
            <span className="material-symbols-outlined text-xl animate-spin">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-xl">photo_camera</span>
          )}
        </button>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Botón de cambiar foto */}
        <button
          onClick={handleButtonClick}
          disabled={uploading}
          className="mt-4 text-[10px] header-text text-primary tracking-widest font-bold block mx-auto opacity-80 hover:opacity-100 transition-opacity disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : 'Cambiar foto'}
        </button>
      </div>
    </div>
  );
}
