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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#07060e' }}>
      {/* Background ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
        <div className="animate-float absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)', animationDelay: '-4s' }} />
        <div className="animate-float absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)', animationDelay: '-2s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(167,139,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(96,165,250,0.15))', border: '1px solid rgba(167,139,250,0.25)', boxShadow: '0 0 40px rgba(167,139,250,0.15)' }}>
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="url(#logoGrad)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
                <path d="M15.75 7.5l3.75-1.5-1.5 3.75" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold gradient-text tracking-tight">TradeON</h1>
            <p className="text-text-muted text-sm font-medium">Profesyonel Trading Gunlugu</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
