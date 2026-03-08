import 'dotenv/config';

export default ({ config }: any) => {
  return {
    ...config,
    expo: {
      ...config.expo,
      name: 'HairConnekt',
      slug: 'hairconnekt',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      newArchEnabled: true,
      runtimeVersion: { policy: 'appVersion' },
      updates: { enabled: true, checkAutomatically: 'ON_LOAD', url: 'https://u.expo.dev/14bc003c-cd0f-4834-90e2-b4f6c64bdf7e' },
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      ios: {
        ...config.expo?.ios,
        supportsTablet: true,
        bundleIdentifier: 'de.hairconnekt.app',
        googleServicesFile: './src/GoogleService-Info.plist',
      },
      android: {
        ...config.expo?.android,
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#ffffff',
        },
        permissions: [
          "android.permission.CAMERA",
          "android.permission.READ_EXTERNAL_STORAGE",
          "android.permission.WRITE_EXTERNAL_STORAGE",
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.ACCESS_COARSE_LOCATION"
        ],
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: 'de.hairconnekt.app',
        googleServicesFile: './src/google-services.json',
      },
      web: { favicon: './assets/favicon.png' },
      extra: {
        ...config.expo?.extra,
        // Expose public envs for debugging if needed
        EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        eas: { projectId: '14bc003c-cd0f-4834-90e2-b4f6c64bdf7e' },
      },
    },
  };
};
