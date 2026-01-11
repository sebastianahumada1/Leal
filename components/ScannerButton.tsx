'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ScannerButtonProps {
  userId: string;
}

export default function ScannerButton({ userId }: ScannerButtonProps) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [isExpectedError, setIsExpectedError] = useState(false); // Para saber si el error es esperado (sin cámara)
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const html5QrcodeModuleRef = useRef<any>(null);

  const handleScanClick = () => {
    if (scanning) {
      // Si ya está escaneando, detener
      stopScanner();
    } else {
      // Iniciar escaneo
      startScanner();
    }
  };

  const startScanner = async () => {
    try {
      setError(null);
      
      // Asegurar que estamos en el cliente
      if (typeof window === 'undefined') {
        throw new Error('Scanner solo disponible en el cliente');
      }
      
      // Cargar el módulo html5-qrcode dinámicamente
      if (!html5QrcodeModuleRef.current) {
        const html5QrcodeModule = await import('html5-qrcode');
        html5QrcodeModuleRef.current = html5QrcodeModule;
      }
      
      const Html5QrcodeClass = html5QrcodeModuleRef.current.Html5Qrcode;
      
      if (!Html5QrcodeClass) {
        throw new Error('Html5Qrcode no está disponible');
      }
      
      setScanning(true); // Cambiar estado primero para que el DOM se actualice
      
      // Esperar a que el DOM se actualice y el contenedor esté disponible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const containerId = `qr-reader-${userId}`;
      const container = document.getElementById(containerId);
      
      if (!container) {
        throw new Error('Contenedor del escáner no encontrado');
      }
      
      const html5QrCode = new Html5QrcodeClass(containerId);
      
      // Intentar primero con cámara trasera, si falla usar cualquier cámara disponible
      let cameraConfig: any = {
        facingMode: 'environment', // Sin 'exact' para más flexibilidad
      };
      
      try {
        await html5QrCode.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            // QR escaneado exitosamente
            let locationCode = decodedText;
            
            if (decodedText.includes('/checkout/')) {
              const parts = decodedText.split('/checkout/');
              locationCode = parts[parts.length - 1];
            } else if (decodedText.includes('checkout')) {
              const parts = decodedText.split('checkout');
              locationCode = parts[parts.length - 1].replace(/[\/]/g, '');
            }

            // Detener escaneo y redirigir
            html5QrCode.stop().then(() => {
              setScanning(false);
              router.push(`/checkout/${locationCode}`);
            }).catch(() => {
              setScanning(false);
              router.push(`/checkout/${locationCode}`);
            });
          },
          (errorMessage: string) => {
            // Errores de escaneo (ignorar, es normal mientras busca)
          }
        );
      } catch (cameraError: any) {
        // Si falla con cámara trasera, intentar con cualquier cámara disponible
        if (cameraError.name === 'OverconstrainedError' || cameraError.message?.includes('Overconstrained')) {
          console.log('Scanner: Cámara trasera no disponible, intentando con cámara frontal');
          try {
            cameraConfig = {
              facingMode: 'user', // Cámara frontal
            };
            
            await html5QrCode.start(
              cameraConfig,
              {
                fps: 10,
                qrbox: { width: 200, height: 200 },
                aspectRatio: 1.0,
              },
              (decodedText: string) => {
                // QR escaneado exitosamente
                let locationCode = decodedText;
                
                if (decodedText.includes('/checkout/')) {
                  const parts = decodedText.split('/checkout/');
                  locationCode = parts[parts.length - 1];
                } else if (decodedText.includes('checkout')) {
                  const parts = decodedText.split('checkout');
                  locationCode = parts[parts.length - 1].replace(/[\/]/g, '');
                }

                // Detener escaneo y redirigir
                html5QrCode.stop().then(() => {
                  setScanning(false);
                  router.push(`/checkout/${locationCode}`);
                }).catch(() => {
                  setScanning(false);
                  router.push(`/checkout/${locationCode}`);
                });
              },
              (errorMessage: string) => {
                // Errores de escaneo (ignorar, es normal mientras busca)
              }
            );
          } catch (frontCameraError: any) {
            // Si también falla la frontal, intentar sin restricciones
            console.log('Scanner: Cámara frontal también falló, usando cualquier cámara disponible');
            await html5QrCode.start(
              {},
              {
                fps: 10,
                qrbox: { width: 200, height: 200 },
                aspectRatio: 1.0,
              },
              (decodedText: string) => {
                let locationCode = decodedText;
                
                if (decodedText.includes('/checkout/')) {
                  const parts = decodedText.split('/checkout/');
                  locationCode = parts[parts.length - 1];
                } else if (decodedText.includes('checkout')) {
                  const parts = decodedText.split('checkout');
                  locationCode = parts[parts.length - 1].replace(/[\/]/g, '');
                }

                html5QrCode.stop().then(() => {
                  setScanning(false);
                  router.push(`/checkout/${locationCode}`);
                }).catch(() => {
                  setScanning(false);
                  router.push(`/checkout/${locationCode}`);
                });
              },
              (errorMessage: string) => {
                // Errores de escaneo (ignorar)
              }
            );
          }
        } else {
          // Si el error no es OverconstrainedError, relanzarlo
          throw cameraError;
        }
      }

      scannerRef.current = html5QrCode;
    } catch (err: any) {
      // Detectar errores específicos de cámara no disponible
      // html5-qrcode encapsula el error, así que necesitamos buscar en el mensaje completo
      const errorName = err?.name || '';
      const errorMessage = String(err?.message || err?.toString() || '').toLowerCase();
      const errorString = JSON.stringify(err || {}).toLowerCase();
      
      let friendlyMessage = 'Error al iniciar la cámara';
      let isExpected = false; // Para errores esperados como falta de cámara
      
      // Detectar errores de cámara no disponible (búsqueda más exhaustiva)
      if (
        errorName === 'NotReadableError' || 
        errorName === 'NotFoundError' ||
        errorMessage.includes('notreadableerror') ||
        errorMessage.includes('notfounderror') ||
        errorMessage.includes('could not start video source') ||
        errorMessage.includes('no video input devices found') ||
        errorMessage.includes('no camera found') ||
        errorMessage.includes('camera not available') ||
        errorString.includes('notreadableerror') ||
        errorString.includes('notfounderror') ||
        errorString.includes('could not start video source')
      ) {
        friendlyMessage = 'No se detectó una cámara disponible. Por favor, usa el botón de galería para seleccionar una imagen con código QR.';
        isExpected = true;
      } else if (
        errorName === 'NotAllowedError' || 
        errorMessage.includes('notallowederror') ||
        errorMessage.includes('permission') ||
        errorMessage.includes('denied') ||
        errorString.includes('notallowederror')
      ) {
        friendlyMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración del navegador o usa el botón de galería para seleccionar una imagen con código QR.';
        isExpected = true;
      } else if (
        errorName === 'OverconstrainedError' ||
        errorMessage.includes('overconstrainederror') ||
        errorString.includes('overconstrainederror')
      ) {
        friendlyMessage = 'La cámara disponible no cumple con los requisitos. Intenta usar otra cámara o usa el botón de galería para seleccionar una imagen con código QR.';
        isExpected = true;
      }
      
      // Actualizar estado de error esperado
      setIsExpectedError(isExpected);
      
      // Solo loggear errores inesperados (no los esperados como falta de cámara)
      if (!isExpected) {
        console.error('Scanner: Error inesperado al iniciar escáner:', err);
        // Solo cerrar el escáner si es un error inesperado
        setScanning(false);
      } else {
        // Para errores esperados, usar console.log en lugar de console.error
        console.log('Scanner: Cámara no disponible o error esperado - usando galería como alternativa');
        // Mantener el estado de escaneo activo para mostrar la opción de galería
        // NO poner setScanning(false) aquí - mantener scanning = true
      }
      
      setError(friendlyMessage);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {
        // Ignorar errores al detener
      });
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleGallery = async () => {
    // Asegurar que el módulo esté cargado
    if (!html5QrcodeModuleRef.current) {
      try {
        const html5QrcodeModule = await import('html5-qrcode');
        html5QrcodeModuleRef.current = html5QrcodeModule;
      } catch (err) {
        setError('No se pudo cargar el módulo de escaneo');
        return;
      }
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file && html5QrcodeModuleRef.current) {
        try {
          const Html5QrcodeClass = html5QrcodeModuleRef.current.Html5Qrcode;
          const scanner = new Html5QrcodeClass('temp-scanner');
          const result = await scanner.scanFile(file, true);
          let locationCode = result;
          if (result.includes('/checkout/')) {
            const parts = result.split('/checkout/');
            locationCode = parts[parts.length - 1];
          }
          await scanner.clear();
          router.push(`/checkout/${locationCode}`);
        } catch (err: any) {
          setError(err.message || 'No se pudo leer el código QR de la imagen');
        }
      }
    };
    input.click();
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col items-center rustic-border bg-forest p-6">
      {!scanning ? (
        // Vista inicial: Botón para iniciar escáner
        <>
          <div className="vintage-seal mb-6">
            <div className="w-48 h-48 bg-center bg-no-repeat bg-contain flex items-center justify-center">
              <button
                onClick={handleScanClick}
                className="size-48 rounded-full border-4 border-primary p-4 bg-primary/10 hover:bg-primary/20 transition-all flex flex-col items-center justify-center gap-4"
              >
                <span className="material-symbols-outlined text-6xl text-primary">
                  qr_code_scanner
                </span>
                <span className="header-text text-primary text-xs font-bold tracking-widest mt-2">
                  ESCANEAR QR
                </span>
                <span className="header-text text-primary text-[10px] font-bold tracking-widest opacity-60">
                  DE CAJERO
                </span>
              </button>
            </div>
          </div>
        </>
      ) : (
        // Vista de escáner activo (o estado de error)
        <>
          {/* Banner superior */}
          {!error && (
            <div className="w-full mb-4">
              <div className="bg-primary px-4 py-2 rounded-lg mx-auto max-w-md border border-primary/20">
                <p className="text-forest text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-center">
                  POSITION CODE WITHIN VIEWFINDER
                </p>
              </div>
            </div>
          )}

          {/* Área de escáner */}
          <div className="relative w-full max-w-sm mx-auto mb-4" style={{ height: '300px' }}>
            {/* Video del escáner - solo mostrar si no hay error */}
            {!error && (
              <div 
                id={`qr-reader-${userId}`}
                ref={scannerContainerRef}
                className="w-full h-full rounded-lg overflow-hidden"
              ></div>
            )}
            
            {/* Mensaje cuando hay error y no hay video */}
            {error && (
              <div className="w-full h-full rounded-lg bg-forest/50 border-2 border-primary/30 flex flex-col items-center justify-center p-6">
                <span className="material-symbols-outlined text-6xl text-primary/50 mb-4">
                  {isExpectedError ? 'image' : 'videocam_off'}
                </span>
                <p className="text-primary text-sm font-sans font-bold text-center mb-4 px-4">
                  {error}
                </p>
                {isExpectedError && (
                  <div className="bg-primary/20 border border-primary/50 px-4 py-2 rounded-lg mt-2">
                    <p className="text-primary text-xs font-sans text-center">
                      Usa el botón de galería en los controles de abajo ↓
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Overlay oscuro alrededor del viewfinder - solo si no hay error */}
            {!error && (
              <>
                <div className="absolute inset-0 z-10 pointer-events-none bg-black/50 rounded-lg">
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-transparent rounded-lg"
                    style={{
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    }}
                  ></div>
                </div>

                {/* Viewfinder overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="relative w-48 h-48">
                    {/* Esquinas del viewfinder */}
                    <div className="absolute top-0 left-0 w-12 h-12">
                      <div className="absolute top-0 left-0 w-8 h-1 bg-primary"></div>
                      <div className="absolute top-0 left-0 w-1 h-8 bg-primary"></div>
                    </div>
                    <div className="absolute top-0 right-0 w-12 h-12">
                      <div className="absolute top-0 right-0 w-8 h-1 bg-primary"></div>
                      <div className="absolute top-0 right-0 w-1 h-8 bg-primary"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-12 h-12">
                      <div className="absolute bottom-0 left-0 w-8 h-1 bg-primary"></div>
                      <div className="absolute bottom-0 left-0 w-1 h-8 bg-primary"></div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-12 h-12">
                      <div className="absolute bottom-0 right-0 w-8 h-1 bg-primary"></div>
                      <div className="absolute bottom-0 right-0 w-1 h-8 bg-primary"></div>
                    </div>
                    
                    {/* Cruz/plus en el centro */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-5 h-[1px] bg-primary/70"></div>
                      <div className="h-5 w-[1px] bg-primary/70 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Botones de control - siempre visibles cuando está escaneando */}
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Botón Galería - destacado cuando hay error de cámara */}
            <button
              onClick={handleGallery}
              className={`size-12 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
                error && isExpectedError ? 'ring-2 ring-primary ring-offset-2 ring-offset-forest scale-110' : ''
              }`}
              aria-label="Abrir galería"
            >
              <svg className="w-6 h-6 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 18l5-4 5 4 5-4 5 4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="6" r="2.5" fill="currentColor"/>
              </svg>
            </button>

            {/* Botón Detener/Cancelar */}
            <button
              onClick={handleScanClick}
              className="size-14 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label={error ? 'Cerrar' : 'Detener escaneo'}
            >
              {error ? (
                <span className="material-symbols-outlined text-forest text-2xl">close</span>
              ) : (
                <svg className="w-8 h-8 text-forest" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="8" height="8" />
                  <rect x="13" y="3" width="8" height="8" />
                  <rect x="3" y="13" width="8" height="8" />
                  <rect x="13" y="13" width="2" height="2" />
                  <rect x="16" y="13" width="2" height="2" />
                  <rect x="19" y="13" width="2" height="2" />
                  <rect x="13" y="16" width="2" height="2" />
                  <rect x="19" y="16" width="2" height="2" />
                  <rect x="13" y="19" width="2" height="2" />
                  <rect x="16" y="19" width="2" height="2" />
                  <rect x="19" y="19" width="2" height="2" />
                </svg>
              )}
            </button>

            {/* Botón Flash - oculto cuando hay error */}
            {!error && (
              <button
                onClick={toggleFlash}
                className={`size-12 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
                  flashOn ? 'ring-2 ring-primary ring-offset-2 ring-offset-forest' : ''
                }`}
                aria-label={flashOn ? 'Apagar flash' : 'Encender flash'}
              >
                <span className={`material-symbols-outlined text-forest text-xl ${flashOn ? 'fill' : ''}`}>
                  {flashOn ? 'flash_on' : 'flash_off'}
                </span>
              </button>
            )}
          </div>
          
          {/* Mensaje destacado cuando hay error de cámara */}
          {error && isExpectedError && (
            <div className="bg-primary/20 border-2 border-primary/50 px-4 py-3 rounded-lg mb-4">
              <p className="text-primary text-xs font-sans font-bold text-center mb-2">
                💡 Usa el botón de galería (izquierda) para seleccionar una imagen con código QR
              </p>
            </div>
          )}
        </>
      )}

      {/* Sección inferior - solo visible cuando no está escaneando */}
      {!scanning && (
        <div className="flex w-full flex-col items-center text-center">
          <p className="header-text text-primary text-xl font-bold mb-2">
            Scan for Sabor
          </p>
          <p className="text-primary/80 text-sm font-normal mb-6 max-w-[240px]">
            Escanea el código QR del cajero para registrar tu visita
          </p>
          <div className="flex flex-col w-full gap-3">
            <Link
              href="/rewards"
              className="w-full header-text h-12 border border-primary text-primary font-bold tracking-widest text-sm flex items-center justify-center"
            >
              Recompensas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
