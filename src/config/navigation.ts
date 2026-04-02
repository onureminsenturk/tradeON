export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const navigationItems: NavItem[] = [
  { label: 'Genel Bakis', href: '/panel', icon: 'dashboard' },
  { label: 'Islemler', href: '/islemler', icon: 'trades' },
  { label: 'Performans', href: '/performans', icon: 'performance' },
  { label: 'Gunluk', href: '/gunluk', icon: 'journal' },
  { label: 'Risk Profili', href: '/risk-profili', icon: 'risk' },
  { label: 'Ayarlar', href: '/ayarlar', icon: 'settings' },
];
