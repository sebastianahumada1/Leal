interface Stamp {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface ProgressSectionProps {
  currentStamps: number;
  requiredStamps: number;
  progressPercentage: number;
  stamps?: Stamp[]; // Array de stamps con estados
}

export default function ProgressSection({
  currentStamps,
  requiredStamps,
  progressPercentage,
  stamps = [],
}: ProgressSectionProps) {
  const stampsDisplay = Array.from({ length: requiredStamps }, (_, i) => i + 1);
  
  // Obtener stamps pendientes para mostrar visualmente
  const pendingStamps = stamps.filter(s => s.status === 'pending');
  const pendingCount = pendingStamps.length;
  
  // Función para obtener el estado del sello en una posición
  // Usa currentStamps (del campo current_stamps del perfil) como fuente de verdad
  const getStampStatus = (index: number): 'empty' | 'pending' | 'approved' | 'rejected' | 'reward' => {
    // El último círculo siempre es la recompensa
    if (index + 1 === requiredStamps) {
      return 'reward';
    }

    // Si el índice es menor que currentStamps, está aprobado (lleno)
    if (index < currentStamps) {
      return 'approved';
    }

    // Si hay stamps pendientes y estamos en el rango, mostrar como pendiente
    // Solo mostrar pendientes después de los aprobados
    const pendingIndex = index - currentStamps;
    if (pendingIndex >= 0 && pendingIndex < pendingCount) {
      return 'pending';
    }

    // Vacío
    return 'empty';
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {stampsDisplay.map((stampNum, index) => {
          const status = getStampStatus(index);

          if (status === 'reward') {
            return (
              <div
                key={stampNum}
                className="aspect-square rounded-full border-2 border-primary/40 flex items-center justify-center bg-primary/10"
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  restaurant
                </span>
              </div>
            );
          }

          if (status === 'approved') {
            return (
              <div
                key={stampNum}
                className="aspect-square flex items-center justify-center bg-primary rounded-full border-2 border-primary"
              >
                <span className="material-symbols-outlined text-forest text-2xl">
                  potted_plant
                </span>
              </div>
            );
          }

          if (status === 'pending') {
            return (
              <div
                key={stampNum}
                className="aspect-square flex items-center justify-center bg-primary/50 rounded-full border-2 border-primary/50"
              >
                <span className="material-symbols-outlined text-primary/70 text-2xl">
                  potted_plant
                </span>
              </div>
            );
          }

          if (status === 'rejected') {
            return (
              <div
                key={stampNum}
                className="aspect-square flex items-center justify-center bg-red-400/20 rounded-full border-2 border-red-400/50"
              >
                <span className="material-symbols-outlined text-red-400 text-2xl">
                  close
                </span>
              </div>
            );
          }

          // Empty
          return (
            <div
              key={stampNum}
              className="aspect-square rounded-full border-2 border-dotted border-primary/30 flex items-center justify-center"
            >
              <span className="text-primary/30 text-xs font-bold font-sans">
                {stampNum}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
