import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c7c3648c124c4f04980e1fa9876fcf34',
  appName: 'TuraPay',
  webDir: 'dist',
  server: {
    url: 'https://c7c3648c-124c-4f04-980e-1fa9876fcf34.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1EAEDB",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    }
  }
};

export default config;
