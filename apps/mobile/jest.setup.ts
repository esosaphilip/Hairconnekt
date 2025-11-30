import '@testing-library/jest-native/extend-expect';
import { NativeModules } from 'react-native';

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
    jest.mock(p, () => ({}));
  } catch {}
}
