'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const locationCode = (params?.locationCode as string) || '';
  const supabase = createClient();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUserId(user.id);
    };
    loadUser();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setError('No se pudo identificar al usuario');
      setLoading(false);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Por favor ingresa un monto válido');
      setLoading(false);
      return;
    }

    if (amountNum > 1000000) {
      setError('El monto máximo es $1,000,000');
      setLoading(false);
      return;
    }

    try {
      // Crear stamp con status 'pending'
      const { error: stampError } = await supabase
        .from('stamps')
        .insert({
          user_id: userId,
          amount: amountNum,
          location_code: locationCode,
          status: 'pending',
        });

      if (stampError) {
        throw stampError;
      }

      // Redirigir al dashboard con mensaje de éxito
      router.push('/?visit=registered');
      return; // Prevenir ejecución adicional
    } catch (err: any) {
      console.error('Error registering visit:', err);
      setError(err.message || 'Error al registrar la visita. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleaned = value.replace(/[^\d.]/g, '');
    // Permitir solo un punto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    return cleaned;
  };

  return (
    <div className="flex flex-col items-center px-8 py-12 min-h-screen">
      <div className="w-full max-w-sm flex flex-col items-center mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-2xl">potted_plant</span>
          <div className="h-[1px] w-12 bg-primary/40"></div>
          <span className="material-symbols-outlined text-primary text-2xl">potted_plant</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="header-text text-primary text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
            Tu Recompensa
          </h2>
          <h1 className="header-text text-primary text-2xl font-bold leading-tight px-4">
            Estás a un paso de tu premio
          </h1>
        </div>
        <div className="mt-8 w-full border-t border-b border-primary/30 border-dashed py-4 flex flex-col items-center">
          <p className="font-mono text-[11px] tracking-widest opacity-60">
            BITÁCORA DE CONSUMO № {locationCode?.toUpperCase() || '---'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-12">
        <div className="flex flex-col gap-5">
          <label
            className="header-text text-primary text-sm font-bold text-center block uppercase tracking-wider"
            htmlFor="amount"
          >
            Monto de la Compra
          </label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-2xl opacity-70 text-primary">
              $
            </span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              placeholder="00.00"
              step="0.01"
              className="bg-transparent border-2 border-primary text-primary focus:ring-1 focus:ring-primary focus:border-primary placeholder-primary/40 p-4 pl-16 w-full font-mono text-2xl text-center tracking-wider"
              required
              autoFocus
            />
            <span className="absolute -top-3 -left-3 material-symbols-outlined text-primary/40 text-lg">
              potted_plant
            </span>
            <span className="absolute -top-3 -right-3 material-symbols-outlined text-primary/40 text-lg">
              potted_plant
            </span>
          </div>
          <p className="font-mono text-[10px] text-center uppercase tracking-widest opacity-50 mt-2">
            Valide el monto con el personal
          </p>
          {error && (
            <div className="text-red-400 text-sm font-sans p-3 border border-red-400/50 bg-red-400/10">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-10">
          <button
            type="submit"
            disabled={loading}
            className="relative w-full bg-transparent group overflow-hidden h-14 border-2 border-primary disabled:opacity-50 transition-transform active:scale-[0.98]"
          >
            <span className="header-text text-primary text-xl font-bold tracking-[0.2em] py-1 block relative z-10">
              {loading ? 'REGISTRANDO...' : 'REGISTRAR VISITA'}
            </span>
            <div className="absolute inset-0 m-[3px] border border-dotted border-primary pointer-events-none"></div>
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="header-text text-primary/50 text-[11px] font-bold tracking-[0.2em] border-b border-primary/20 pb-1 hover:text-primary transition-colors uppercase"
          >
            Cancelar Operación
          </button>
        </div>
      </form>

      <div className="mt-auto pt-16 w-full max-w-xs">
        <div className="flex flex-col items-center opacity-30">
          <div className="flex items-center gap-4 mb-6 w-full">
            <div className="flex-grow h-[1px] bg-primary"></div>
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-sm">potted_plant</span>
              <span className="material-symbols-outlined text-sm">potted_plant</span>
              <span className="material-symbols-outlined text-sm">potted_plant</span>
            </div>
            <div className="flex-grow h-[1px] bg-primary"></div>
          </div>
          <p className="font-mono text-[9px] tracking-[0.4em] uppercase">Leal Auténtico Mexicano</p>
          <p className="font-mono text-[8px] tracking-[0.2em] mt-1">MÉXICO D.F. — 2024</p>
        </div>
      </div>
    </div>
  );
}
