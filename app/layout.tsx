import type { Metadata, Viewport } from 'next';
import { Inter, Anton, Roboto, Roboto_Slab } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const anton = Anton({ 
  weight: ['400'], 
  subsets: ['latin'], 
  variable: '--font-anton',
  display: 'swap',
});
const roboto = Roboto({ 
  weight: ['400', '500', '700'], 
  subsets: ['latin'], 
  variable: '--font-roboto',
  display: 'swap',
});
const robotoSlab = Roboto_Slab({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LEAL - Tarjeta de Fidelización',
  description: 'Sistema de tarjeta de fidelización con recompensas',
  // Next.js 14 genera automáticamente /manifest.webmanifest desde app/manifest.ts
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LEAL',
  },
  // Usar mobile-web-app-capable en lugar de apple-mobile-web-app-capable (deprecado)
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// Separar viewport y themeColor según Next.js 14
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#14533D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${anton.variable} ${roboto.variable} ${robotoSlab.variable} min-h-screen pb-12`}>
        {children}
      </body>
    </html>
  );
}
