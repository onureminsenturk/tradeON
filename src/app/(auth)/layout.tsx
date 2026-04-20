'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/panel');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent-primary/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-loss/6 rounded-full blur-[100px]" />
      </div>
      {/* Mini bar chart decoration */}
      <div className="absolute bottom-8 left-8 flex items-end gap-1 opacity-10">
        {[30,55,40,70,50,85,60,95,75,88,65,100].map((h, i) => (
          <div key={i} className="w-2 rounded-sm" style={{ height: `${h * 0.6}px`, backgroundColor: h > 60 ? '#16c660' : '#f23535' }} />
        ))}
      </div>
      <div className="absolute top-8 right-8 flex items-end gap-1 opacity-10">
        {[80,60,90,45,70,55,85,40,75,95,65,100].map((h, i) => (
          <div key={i} className="w-2 rounded-sm" style={{ height: `${h * 0.5}px`, backgroundColor: h > 60 ? '#16c660' : '#f23535' }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo with mini chart */}
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="flex items-end gap-0.5 h-8">
              <div className="w-1.5 rounded-sm bg-loss/80" style={{ height: '45%' }} />
              <div className="w-1.5 rounded-sm bg-loss/80" style={{ height: '60%' }} />
              <div className="w-1.5 rounded-sm bg-profit" style={{ height: '75%' }} />
              <div className="w-1.5 rounded-sm bg-profit" style={{ height: '90%' }} />
              <div className="w-1.5 rounded-sm bg-accent-primary" style={{ height: '100%' }} />
            </div>
            <h1 className="text-4xl font-bold gradient-text tracking-wide">TradeON</h1>
          </div>
          <p className="text-text-muted text-sm">Profesyonel Trading Gunlugu</p>
        </div>
        {children}
      </div>
    </div>
  );
}
