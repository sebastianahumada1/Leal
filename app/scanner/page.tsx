'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScannerPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const startScanning = async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        
        await html5QrCode.start(
          {
            facingMode: { exact: 'environment' }, // Usar cámara trasera
          },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }, // Tamaño del viewfinder
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // QR escaneado exitosamente
            if (isMounted) {
              // Extraer locationCode del QR
              // El QR puede ser: /checkout/{locationCode} o solo el código
              let locationCode = decodedText;
              
              // Si es una URL, extraer el código
              if (decodedText.includes('/checkout/')) {
                const parts = decodedText.split('/checkout/');
                locationCode = parts[parts.length - 1];
              } else if (decodedText.includes('checkout')) {
                const parts = decodedText.split('checkout');
                locationCode = parts[parts.length - 1].replace(/[\/]/g, '');
              }

              // Detener escaneo y redirigir
              html5QrCode.stop().then(() => {
                router.push(`/checkout/${locationCode}`);
              }).catch(() => {
                router.push(`/checkout/${locationCode}`);
              });
            }
          },
          (errorMessage) => {
            // Errores de escaneo (ignorar, es normal mientras busca)
          }
        );

        if (isMounted) {
          scannerRef.current = html5QrCode;
          setScanning(true);
        }
      } catch (err: any) {
        console.error('Error starting scanner:', err);
        if (isMounted) {
          setError(err.message || 'Error al iniciar la cámara');
        }
      }
    };

    startScanning();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Ignorar errores al detener
        });
      }
    };
  }, [router]);

  const handleGallery = () => {
    // Función para seleccionar imagen de galería
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file && scannerRef.current) {
        try {
          const result = await scannerRef.current.scanFile(file, true);
          // Extraer locationCode del resultado
          let locationCode = result;
          if (result.includes('/checkout/')) {
            const parts = result.split('/checkout/');
            locationCode = parts[parts.length - 1];
          }
          router.push(`/checkout/${locationCode}`);
        } catch (err) {
          setError('No se pudo leer el código QR de la imagen');
        }
      }
    };
    input.click();
  };

  const toggleFlash = async () => {
    // Alternar flash (si está disponible)
    setFlashOn(!flashOn);
    // Nota: Controlar flash requiere permisos adicionales en algunos navegadores
  };

  return (
    <div className="min-h-screen flex flex-col bg-forest relative overflow-hidden">
      {/* Banner superior */}
      <div className="w-full pt-8 pb-4 px-4 z-30 relative">
        <div className="bg-primary px-6 py-3 rounded-lg mx-auto max-w-md border border-primary/20 shadow-lg">
          <p className="text-forest text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-center">
            POSITION CODE WITHIN VIEWFINDER
          </p>
        </div>
      </div>

      {/* Área de escáner */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Video del escáner - fondo */}
        <div id="qr-reader" className="w-full h-full absolute inset-0 object-cover"></div>

        {/* Overlay oscuro alrededor del viewfinder */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-black/50">
          {/* Área central transparente (viewport) - crea agujero */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent rounded-lg"
            style={{
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          ></div>
        </div>

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="relative w-64 h-64">
            {/* Esquinas del viewfinder en forma de L (más gruesas) */}
            {/* Esquina superior izquierda */}
            <div className="absolute top-0 left-0 w-16 h-16">
              <div className="absolute top-0 left-0 w-12 h-1.5 bg-primary"></div>
              <div className="absolute top-0 left-0 w-1.5 h-12 bg-primary"></div>
            </div>
            {/* Esquina superior derecha */}
            <div className="absolute top-0 right-0 w-16 h-16">
              <div className="absolute top-0 right-0 w-12 h-1.5 bg-primary"></div>
              <div className="absolute top-0 right-0 w-1.5 h-12 bg-primary"></div>
            </div>
            {/* Esquina inferior izquierda */}
            <div className="absolute bottom-0 left-0 w-16 h-16">
              <div className="absolute bottom-0 left-0 w-12 h-1.5 bg-primary"></div>
              <div className="absolute bottom-0 left-0 w-1.5 h-12 bg-primary"></div>
            </div>
            {/* Esquina inferior derecha */}
            <div className="absolute bottom-0 right-0 w-16 h-16">
              <div className="absolute bottom-0 right-0 w-12 h-1.5 bg-primary"></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-12 bg-primary"></div>
            </div>
            
            {/* Cruz/plus en el centro (más clara y fina) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-[1px] bg-primary/70"></div>
              <div className="h-6 w-[1px] bg-primary/70 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-30 bg-red-400/90 text-forest px-6 py-3 rounded-lg mx-auto max-w-md border border-red-400/50">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-center">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Botones inferiores */}
      <div className="w-full bg-forest px-8 py-6 z-30 relative border-t border-primary/20">
        <div className="flex items-center justify-center gap-10 max-w-md mx-auto">
          {/* Botón Galería */}
          <button
            onClick={handleGallery}
            className="size-16 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:scale-105"
            aria-label="Abrir galería"
          >
            {/* Ícono de paisaje/montañas con sol */}
            <svg className="w-8 h-8 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Montañas */}
              <path d="M2 18l5-4 5 4 5-4 5 4" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Sol */}
              <circle cx="18" cy="6" r="2.5" fill="currentColor"/>
              <path d="M18 1.5v3M18 9.5v3M21.5 6h-3M14.5 6h-3M20.06 2.94l-2.12 2.12M20.06 9.06l-2.12-2.12M15.94 2.94l2.12 2.12M15.94 9.06l2.12-2.12" strokeWidth="1"/>
            </svg>
          </button>

          {/* Botón Scanner (centro, más grande) - QR Code icon */}
          <button
            className="size-20 rounded-full bg-primary flex items-center justify-center shadow-lg relative"
            disabled
            aria-label="Escaneando"
          >
            {/* Ícono de QR code estilizado - más complejo */}
            <svg className="w-11 h-11 text-forest" viewBox="0 0 24 24" fill="currentColor">
              {/* Patrón de QR similar a la imagen */}
              {/* Esquina superior izquierda */}
              <rect x="3" y="3" width="8" height="8" />
              <rect x="5" y="5" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.8"/>
              {/* Esquina superior derecha */}
              <rect x="13" y="3" width="8" height="8" />
              <rect x="15" y="5" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.8"/>
              {/* Esquina inferior izquierda */}
              <rect x="3" y="13" width="8" height="8" />
              <rect x="5" y="15" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.8"/>
              {/* Centro derecho - patrón de cuadros pequeños */}
              <rect x="13" y="13" width="2" height="2" />
              <rect x="16" y="13" width="2" height="2" />
              <rect x="19" y="13" width="2" height="2" />
              <rect x="13" y="16" width="2" height="2" />
              <rect x="19" y="16" width="2" height="2" />
              <rect x="13" y="19" width="2" height="2" />
              <rect x="16" y="19" width="2" height="2" />
              <rect x="19" y="19" width="2" height="2" />
            </svg>
            {scanning && (
              <div className="absolute inset-0 rounded-full border-2 border-forest/30 animate-ping"></div>
            )}
          </button>

          {/* Botón Flash */}
          <button
            onClick={toggleFlash}
            className={`size-16 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:scale-105 ${
              flashOn ? 'ring-2 ring-primary ring-offset-2 ring-offset-forest' : ''
            }`}
            aria-label={flashOn ? 'Apagar flash' : 'Encender flash'}
          >
            <span className={`material-symbols-outlined text-forest text-2xl ${flashOn ? 'fill' : ''}`}>
              {flashOn ? 'flash_on' : 'flash_off'}
            </span>
          </button>
        </div>
      </div>

      {/* Indicador inferior del dispositivo */}
      <div className="w-full pb-3 flex justify-center">
        <div className="w-32 h-1 bg-primary/30 rounded-full"></div>
      </div>
    </div>
  );
}
