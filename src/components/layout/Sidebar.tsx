'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  {
    label: 'Genel Bakis',
    href: '/panel',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Islemler',
    href: '/islemler',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    label: 'Performans',
    href: '/performans',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    label: 'Gunluk',
    href: '/gunluk',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    label: 'Risk Profili',
    href: '/risk-profili',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: 'Ayarlar',
    href: '/ayarlar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col ${collapsed ? 'w-[72px]' : 'w-64'} bg-bg-secondary border-r border-bg-quaternary/60 h-screen sticky top-0 transition-all duration-300 relative`}>

        {/* Green left accent stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-accent-primary via-profit/60 to-loss/40 rounded-r" />

        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-bg-quaternary/50`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              {/* Mini chart icon */}
              <div className="flex items-end gap-0.5 h-6">
                <div className="w-1 bg-loss/80 rounded-sm" style={{ height: '40%' }} />
                <div className="w-1 bg-loss/80 rounded-sm" style={{ height: '65%' }} />
                <div className="w-1 bg-profit rounded-sm" style={{ height: '80%' }} />
                <div className="w-1 bg-profit rounded-sm" style={{ height: '100%' }} />
                <div className="w-1 bg-accent-primary rounded-sm" style={{ height: '85%' }} />
              </div>
              <span className="text-xl font-bold gradient-text tracking-wide">TradeON</span>
            </div>
          )}
          {collapsed && (
            <div className="flex items-end gap-0.5 h-6">
              <div className="w-1 bg-loss/80 rounded-sm" style={{ height: '40%' }} />
              <div className="w-1 bg-profit rounded-sm" style={{ height: '80%' }} />
              <div className="w-1 bg-accent-primary rounded-sm" style={{ height: '100%' }} />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-accent-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-bg-tertiary border border-bg-quaternary/80 flex items-center justify-center text-text-muted hover:text-accent-primary hover:border-accent-primary/50 transition-colors shadow-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all relative group ${
                  isActive
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-primary rounded-r" />
                )}
                {item.icon}
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-bg-tertiary border border-bg-quaternary text-text-primary text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Market status indicator */}
        {!collapsed && (
          <div className="mx-3 mb-3 px-3 py-2 bg-bg-tertiary/50 rounded-lg border border-bg-quaternary/40 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-xs text-text-muted">Sistem Aktif</span>
          </div>
        )}

        {/* User */}
        <div className={`p-3 border-t border-bg-quaternary/50 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary/30 to-profit/20 border border-accent-primary/30 flex items-center justify-center text-accent-primary font-bold text-sm flex-shrink-0">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{user?.displayName}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors"
                  title="Cikis Yap"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-bg-quaternary/60 z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-accent-primary' : 'text-text-muted'
                }`}
              >
                {item.icon}
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
