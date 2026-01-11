import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import ScanUserPage from '@/components/ScanUserPage';

export default async function ScanPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // Next.js 15: params is now async
  const { userId } = await params;
  
  // Next.js 15: createServerClient is now async
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only staff/admin can access scan pages
  if (!session) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    redirect('/');
  }

  return <ScanUserPage targetUserId={userId} />;
}
