import { Platform } from 'react-native';

// Choose a sensible default API URL for local development
// iOS Simulator can often use localhost, Android Emulator must use 10.0.2.2
const defaultHost = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const fromEnv = process.env.EXPO_PUBLIC_API_URL;
export const API_BASE_URL = `${(fromEnv || defaultHost).replace(/\/$/, '')}/api/v1`;