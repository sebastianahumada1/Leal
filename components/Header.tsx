'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <div className="flex items-center p-6 pb-2 justify-between sticky top-0 z-10 bg-forest/95 backdrop-blur-sm">
      <div className="text-primary flex size-12 shrink-0 items-center justify-start">
        <span className="material-symbols-outlined text-2xl opacity-0">arrow_back_ios</span>
      </div>
      <h2 className="header-text text-primary text-lg font-bold flex-1 text-center">
        Familia Leal
      </h2>
      <div className="flex w-12 items-center justify-end">
        <Link
          href="/profile/edit"
          className="flex items-center justify-center h-12 text-primary hover:text-primary/80 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
        </Link>
      </div>
    </div>
  );
}
