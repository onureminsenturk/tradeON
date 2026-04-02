import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradingjournal.app',
  appName: 'Trading Journal',
  webDir: 'out',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0a0e17',
    preferredContentMode: 'mobile',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
