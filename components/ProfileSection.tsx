import Image from 'next/image';

interface ProfileSectionProps {
  profile: {
    full_name: string | null;
    member_number: string;
    email: string;
    avatar_url: string | null;
    photo_url: string | null;
  } | null;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  const displayName = profile?.full_name || 'Usuario';
  // Convertir member_number a número para mostrar sin ceros a la izquierda
  const memberNumber = profile?.member_number 
    ? parseInt(profile.member_number, 10).toString()
    : '0';
  const email = profile?.email || '';
  
  // Priorizar photo_url (foto subida) sobre avatar_url
  const photoUrl = profile?.photo_url || profile?.avatar_url;

  // Función para obtener iniciales del nombre
  const getInitials = () => {
    if (!displayName || displayName === 'Usuario') return 'U';
    const names = displayName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return displayName[0].toUpperCase();
  };

  return (
    <div className="flex gap-4 flex-col items-center">
      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full border-2 border-primary p-1">
        {photoUrl ? (
          <div className="size-24 rounded-full relative overflow-hidden">
            <Image
              src={photoUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        ) : (
          <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-3xl font-display font-bold">
              {getInitials()}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center">
        <p className="header-text text-primary text-2xl font-bold text-center">
          {displayName}
        </p>
        <p className="text-primary/80 text-sm font-normal text-center opacity-80 mt-1">
          Socio No. {memberNumber}
        </p>
        <div className="w-12 h-[1px] bg-primary/40 my-2"></div>
        <p className="text-primary/70 text-xs font-normal text-center italic">
          {email}
        </p>
      </div>
    </div>
  );
}
