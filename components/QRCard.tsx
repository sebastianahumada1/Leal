'use client';

import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

interface QRCardProps {
  userId: string;
}

export default function QRCard({ userId }: QRCardProps) {
  // En el cliente, usar window.location.origin (detecta automáticamente la URL en producción)
  // En el servidor/build, usar NEXT_PUBLIC_APP_URL como fallback
  const appUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || '';
  const qrValue = `${appUrl}/scan/${userId}`;

  return (
    <div className="flex flex-col items-center rustic-border bg-forest p-6">
      <div className="vintage-seal mb-6">
        <div className="w-48 h-48 bg-center bg-no-repeat bg-contain flex items-center justify-center">
          <QRCodeSVG
            value={qrValue}
            size={192}
            level="H"
            includeMargin={false}
            fgColor="#C5B48F"
            bgColor="#fdfaf3"
          />
        </div>
      </div>
      <div className="flex w-full flex-col items-center text-center">
        <p className="header-text text-primary text-xl font-bold mb-2">
          Scan for Sabor
        </p>
        <p className="text-primary/80 text-sm font-normal mb-6 max-w-[240px]">
          Show this code at the counter to collect your agave stamps
        </p>
        <div className="flex flex-col w-full gap-3">
          <Link
            href="/rewards"
            className="w-full header-text h-12 bg-primary text-forest font-bold tracking-widest text-sm flex items-center justify-center"
          >
            Recompensas
          </Link>
          <Link
            href="/history"
            className="w-full header-text h-12 border border-primary text-primary font-bold tracking-widest text-sm flex items-center justify-center"
          >
            Historial
          </Link>
        </div>
      </div>
    </div>
  );
}
