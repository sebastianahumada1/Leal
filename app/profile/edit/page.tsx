'use client';

import { useRouter } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm';

export default function EditProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center p-6 pb-2 justify-between sticky top-0 z-10 bg-forest/95 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          className="text-primary flex size-12 shrink-0 items-center justify-start"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </button>
        <h2 className="header-text text-primary text-lg font-bold flex-1 text-center">
          Editar Perfil
        </h2>
        <div className="flex w-12 items-center justify-end">
          <span className="material-symbols-outlined text-primary/30">potted_plant</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-24">
        <EditProfileForm />
      </div>
    </div>
  );
}
