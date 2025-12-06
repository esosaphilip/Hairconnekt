import 'dotenv/config';

export default ({ config }: any) => ({
  expo: {
    name: 'HairConnekt',
    slug: 'hairconnekt',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    runtimeVersion: { policy: 'appVersion' },
    updates: { enabled: true, checkAutomatically: 'ON_LOAD', url: 'https://u.expo.dev/14bc003c-cd0f-4834-90e2-b4f6c64bdf7e' },
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'de.hairconnekt.app',
    },
    web: { favicon: './assets/favicon.png' },
    extra: {
      // Expose public envs for debugging if needed
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      eas: { projectId: '14bc003c-cd0f-4834-90e2-b4f6c64bdf7e' },
    },
  },
});
