import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenflow.app',
  appName: 'ZenFlow',
  webDir: 'public',
  server: {
    url: 'http://124.222.233.34',
    cleartext: true,
    allowNavigation: ['124.222.233.34']
  }
};

export default config;
