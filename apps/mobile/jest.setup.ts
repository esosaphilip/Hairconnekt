import '@testing-library/jest-native/extend-expect';
import { NativeModules } from 'react-native';

jest.mock('@react-navigation/native');
jest.mock('@react-navigation/bottom-tabs');
jest.mock('@react-navigation/native-stack');

// Provide a stable scriptURL so config resolves API_BASE_URL without crashing
(NativeModules as any).SourceCode = {
  scriptURL: 'http://127.0.0.1:8081/index.bundle?platform=android',
};

// Silence RN Animated warnings during tests (fallback path varies across RN versions)
// Try multiple known helper paths; ignore if not found
const helperPaths = [
  'react-native/Libraries/Animated/NativeAnimatedHelper',
  'react-native/Libraries/Animated/src/NativeAnimatedHelper',
];
for (const p of helperPaths) {
  try {
  }
  } catch { }
}

// Global API Mocks
jest.mock('@/services/users', () => ({
  usersApi: {
    getMe: jest.fn(),
    updateMe: jest.fn(),
    deleteAccount: jest.fn(),
  },
  clientUserApi: {
    login: jest.fn(),
    register: jest.fn(),
    deleteAccount: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

jest.mock('@/services/providers', () => ({
  providersApi: {
    getCalendar: jest.fn(),
    getAppointments: jest.fn(),
    updateAppointmentStatus: jest.fn(),
    getProfile: jest.fn(),
    getMyProfile: jest.fn(),
  },
}));

jest.mock('@/api/clientBooking', () => ({
  clientBookingApi: {
    createBooking: jest.fn(),
    getAppointments: jest.fn(),
    cancelAppointment: jest.fn(),
    createAppointment: jest.fn(),
    getAppointment: jest.fn(),
  },
}));

jest.mock('@/services/uploadService', () => ({
  uploadImageFile: jest.fn(),
  uploadMultipleImages: jest.fn(),
}));

jest.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', userType: 'CLIENT' },
    tokens: { accessToken: 'test-token' },
    setUser: jest.fn(),
    loading: false,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

// --- Native Module Mocks for Testing ---

// 1. react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// 2. @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
  BottomSheetModal: ({ children }: any) => children,
  BottomSheetView: ({ children }: any) => children,
  BottomSheetBackdrop: () => null,
  useBottomSheetModal: () => ({ dismiss: jest.fn() }),
}));

// 3. react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const MapView = ({ children }: any) => React.createElement('MapView', null, children);
  MapView.Marker = ({ children }: any) => React.createElement('Marker', null, children);
  MapView.Callout = ({ children }: any) => React.createElement('Callout', null, children);
  return { __esModule: true, default: MapView, ...MapView };
});

// 4. expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://mock-image.jpg', type: 'image/jpeg', fileName: 'mock.jpg' }]
  }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  MediaTypeOptions: { Images: 'Images' },
}));

// 5. expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 52.52, longitude: 13.405 }
  }),
}));

// 6. react-native-safe-area-context
// Using a `<View>` wrapper instead of `children` to prevent "node on unmounted component" errors structurally
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children, style }: any) => React.createElement(View, { style }, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// 7. @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 8. react-native-vector-icons
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
