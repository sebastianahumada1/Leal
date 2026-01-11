'use client';

interface VisitCardProps {
  visit: {
    id: string;
    user_id: string;
    amount: number;
    location_code: string;
    created_at: string;
    user_name?: string;
  };
  onApprove: (visitId: string) => void;
  onReject: (visitId: string) => void;
  loading?: boolean;
}

export default function VisitCard({ visit, onApprove, onReject, loading = false }: VisitCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="rustic-border bg-forest p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="header-text text-primary text-base font-bold mb-1">
            {visit.user_name || `Usuario #${visit.user_id.substring(0, 8)}`}
          </h4>
          <p className="text-primary/70 text-xs font-sans">
            {visit.location_code?.toUpperCase() || 'N/A'}
          </p>
          <p className="text-primary/60 text-xs font-sans mt-1">
            {formatDate(visit.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="header-text text-primary text-lg font-bold">
            {formatCurrency(visit.amount)}
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-primary/20">
        <button
          onClick={() => onApprove(visit.id)}
          disabled={loading}
          className="flex-1 header-text h-10 bg-primary text-forest font-bold tracking-widest text-xs disabled:opacity-50 transition-opacity"
        >
          Aprobar
        </button>
        <button
          onClick={() => onReject(visit.id)}
          disabled={loading}
          className="flex-1 header-text h-10 border border-primary text-primary font-bold tracking-widest text-xs disabled:opacity-50 transition-opacity"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
