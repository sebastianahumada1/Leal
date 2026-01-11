import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import HistoryPage from '@/components/HistoryPage';

export default async function History() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <HistoryPage userId={session.user.id} />;
}
