'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanCheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente al escáner
    router.replace('/scanner');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <div className="text-primary font-display text-xl">Redirigiendo al escáner...</div>
    </div>
  );
}
