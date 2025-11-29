import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hairconnekt.app',
  appName: 'HairConnekt',
  webDir: 'build',
  // During development you can point the native app at your dev server by uncommenting and setting your LAN IP:
  // server: {
  //   url: 'http://192.168.1.100:5175',
  //   cleartext: true,
  // },
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;