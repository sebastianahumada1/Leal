'use client';

import Image from 'next/image';

interface ImmersiveHeaderProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  logoImage?: string;
  logoAlt?: string;
  useLogo?: boolean;
}

export default function ImmersiveHeader({
  icon,
  title,
  subtitle,
  backgroundImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsGDQfPz67dppEfw8BZ1WD0e3yIjpBgOYDG8269RHA9JwsrBludfjI0Tgf7PBxRVbmCl3awfVavKyTwPBneozwuWDYj8Mc4pll0En8yY_PGokGdCkba2lwDrmKNAcJXpER6lcbd4y3c2PRM4tTUyqGXMaJOWcFqs9k1AoERfLp7IQ65mk0mYu1vMoHM_X6IZ9_WnOKqjJu3ry3iJtlaGruGIEesh5-PNCXXI69U7z0IdcNhlHVoSN9fPLym3SwRPKDVLd2FGGI3SHN',
  logoImage = '/logo-principal.png',
  logoAlt = 'LEAL Mexican Food',
  useLogo = false,
}: ImmersiveHeaderProps) {
  return (
    <div
      className={`relative w-full immersive-header flex flex-col items-center justify-center text-center ${
        useLogo 
          ? 'pt-2 pb-3 sm:pt-3 sm:pb-4 md:pt-4 md:pb-5 h-[38vh] sm:h-[42vh] md:h-[45vh]' 
          : 'pt-16 pb-20 sm:pb-24'
      }`}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("${backgroundImage}")`,
      }}
    >
      {useLogo && logoImage ? (
        <div className="flex flex-col items-center justify-center logo-image-container w-full h-full px-3 sm:px-4 md:px-6">
          <div className="relative w-full h-full max-w-[min(90vw,400px)] max-h-[min(90vw,400px)] aspect-square mx-auto">
            <Image
              src={logoImage}
              alt={logoAlt}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 428px) 90vw, (max-width: 768px) 400px, 450px"
            />
          </div>
        </div>
      ) : (
        <>
          {icon && (
            <div className="mb-4">
              <span
                className="material-symbols-outlined text-7xl text-primary"
                style={{ fontVariationSettings: "'wght' 200" }}
              >
                {icon}
              </span>
            </div>
          )}
          {title && (
            <h1 className="text-primary text-6xl font-extrabold tracking-tighter uppercase leading-none leal-distressed-text">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-primary/70 text-base tracking-[0.3em] font-sans mt-3 uppercase">
              {subtitle}
            </p>
          )}
        </>
      )}
    </div>
  );
}
