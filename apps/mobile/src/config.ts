import { Platform, NativeModules } from 'react-native';

// Resolve a development host automatically when running in Expo/RN dev mode.
// This helps physical devices connect to your local backend by using the LAN IP.
function resolveDevHostFromRN(): string | null {
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    // Examples:
    //  - http://192.168.2.61:8083/index.bundle?platform=android...
    //  - http://localhost:8083/index.bundle?platform=ios...
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^:]+):\d+/);
      const host = match?.[1];
      if (host && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        return `http://${host}:3000`;
      }
    }
  } catch { }
  return null;
}

// Defaults for emulators/simulators when we cannot resolve a LAN IP
const emulatorDefault = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// Allow overriding via environment variable (recommended in CI/production)
const envUrl = process.env.EXPO_PUBLIC_API_URL;
const envTimeout = process.env.EXPO_PUBLIC_API_TIMEOUT;

// Production backend URL (from Admin Deployment Guide)
const PROD_API_URL = 'https://api.hairconnekt.de';

const base = (envUrl && envUrl.trim())
  ? envUrl.trim()
  : PROD_API_URL; // Always default to Production URL to avoid localhost issues on devices

// Export the raw base URL (without /api/v1) for static assets
export const BASE_URL = base.replace(/\/$/, '');
export const API_BASE_URL = `${BASE_URL}/api/v1`;
export const API_TIMEOUT = envTimeout ? Number(envTimeout) : 30000;
export const GOOGLE_MAPS_API_KEY = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim();

// Dev aid: log the resolved API base so we can quickly diagnose connectivity issues on devices
// (e.g., LAN vs tunnel vs emulator fallback). This is harmless in production builds.
// eslint-disable-next-line no-console
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    const host = scriptURL?.match(/https?:\/\/([^:]+):\d+/)?.[1] || 'unknown';
    console.log(`[Hairconnekt] API_BASE_URL -> ${API_BASE_URL}`);
    console.log(`[Hairconnekt] Environment: ${__DEV__ ? 'DEV' : 'PROD'} (script host: ${host}; env: ${envUrl || 'n/a'})`);
    console.log(`[Hairconnekt] API_TIMEOUT -> ${API_TIMEOUT}`);
    if (GOOGLE_MAPS_API_KEY) {
      console.log('[Hairconnekt] Google Maps key is set');
    } else {
      console.log('[Hairconnekt] Google Maps key is NOT set');
    }
  } catch { }
}
