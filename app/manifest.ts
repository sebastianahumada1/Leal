import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LEAL - Tarjeta de Fidelización',
    short_name: 'LEAL',
    description: 'Sistema de tarjeta de fidelización con recompensas',
    start_url: '/',
    display: 'standalone',
    background_color: '#14533D',
    theme_color: '#14533D',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
