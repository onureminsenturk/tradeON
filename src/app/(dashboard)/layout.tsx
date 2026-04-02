'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TradeProvider } from '@/context/TradeContext';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/giris');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <TradeProvider>
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </TradeProvider>
  );
}
