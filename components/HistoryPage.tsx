import { createServerClient } from '@/lib/supabase-server';
import { format } from 'date-fns';
import Link from 'next/link';
import Header from './Header';

interface HistoryPageProps {
  userId: string;
}

interface Stamp {
  id: string;
  created_at: string;
  user_id: string;
  collected_by?: string;
}

interface Reward {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  required_stamps: number;
}

interface UserReward {
  id: string;
  created_at: string;
  user_id: string;
  reward_id: string;
  redeemed_at?: string;
  rewards?: Reward;
}

export default async function HistoryPage({ userId }: HistoryPageProps) {
  const supabase = await createServerClient();

  const { data: stamps } = await supabase
    .from('stamps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: userRewards } = await supabase
    .from('user_rewards')
    .select('*, rewards(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const allHistory = [
    ...((stamps as Stamp[] | null)?.map((stamp: Stamp) => ({
      type: 'stamp' as const,
      date: stamp.created_at,
      data: stamp,
    })) || []),
    ...((userRewards as UserReward[] | null)?.map((ur: UserReward) => ({
      type: 'reward' as const,
      date: ur.created_at,
      data: ur,
    })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen">
      <Header />
      <div className="px-6 pb-2 pt-4">
        <h2 className="header-text text-primary text-lg font-bold pb-4 border-b border-primary/20">
          Historial
        </h2>
      </div>
      <div className="p-6 space-y-3">
        {allHistory.length === 0 ? (
          <div className="text-center text-primary/60 py-8">
            <p className="font-sans">No hay historial aún</p>
          </div>
        ) : (
          allHistory.map((item, index) => {
            const date = new Date(item.date);
            const formattedDate = format(date, "d 'de' MMMM, yyyy");
            const formattedTime = format(date, 'HH:mm');

            if (item.type === 'stamp') {
              return (
                <div
                  key={`stamp-${item.data.id}`}
                  className="flex items-center gap-4 p-4 rustic-border bg-forest/50"
                >
                  <div className="size-10 flex items-center justify-center bg-primary/20 rounded-full border border-primary">
                    <span className="material-symbols-outlined text-primary text-xl">
                      potted_plant
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="header-text text-primary font-bold text-sm">
                      Sello Agregado
                    </p>
                    <p className="text-primary/60 text-xs font-sans">
                      {formattedDate} a las {formattedTime}
                    </p>
                  </div>
                </div>
              );
            } else {
              const reward = item.data.rewards;
              return (
                <div
                  key={`reward-${item.data.id}`}
                  className="flex items-center gap-4 p-4 rustic-border bg-primary/10"
                >
                  <div className="size-10 flex items-center justify-center bg-primary/30 rounded-full border border-primary">
                    <span className="material-symbols-outlined text-primary text-xl">
                      {reward?.icon || 'local_bar'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="header-text text-primary font-bold text-sm">
                      {reward?.name || 'Recompensa'}
                    </p>
                    <p className="text-primary/60 text-xs font-sans">
                      Canjeado el {formattedDate} a las {formattedTime}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                </div>
              );
            }
          })
        )}
      </div>
      <div className="px-6 pb-12 pt-4">
        <Link
          href="/"
          className="w-full header-text h-12 border border-primary text-primary font-bold tracking-widest text-sm flex items-center justify-center"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
