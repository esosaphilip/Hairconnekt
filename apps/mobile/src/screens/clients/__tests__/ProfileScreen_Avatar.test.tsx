import React from 'react';
import { View } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';
import { usersApi } from '@/services/users';

// Mock dependencies
jest.mock('@/services/users', () => ({
  usersApi: {
    getMe: jest.fn(),
  },
}));

jest.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', firstName: 'Test', lastName: 'User' },
    logout: jest.fn(),
    setUser: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('@/i18n', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: 'en' }),
}));

// Mock Utils
jest.mock('@/utils/url', () => ({
  normalizeUrl: jest.fn((url) => url),
}));

// Mock Components
jest.mock('@/components/Icon', () => 'Icon');
jest.mock('@/components/Text', () => 'Text');
jest.mock('@/components/Button', () => 'Button');
jest.mock('@/components/Card', () => 'Card');
jest.mock('@/components/separator', () => 'Separator');
jest.mock('@/components/AlertModal', () => 'AlertModal');
jest.mock('@/components/AppImage', () => {
  const React = require('react');
  // Use string 'View' to avoid ReferenceError with react-native components in jest factory
  return {
    AppImage: ({ uri }: any) => React.createElement('View', { testID: 'profile-avatar', accessibilityLabel: uri }),
  };
});

// Mock Native Modules
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children }: any) => React.createElement(View, {}, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

describe('ProfileScreen Avatar', () => {
  it('renders AppImage with the avatar URL', async () => {
    const avatarPath = '/uploads/avatar.jpg';
    (usersApi.getMe as jest.Mock).mockResolvedValue({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      avatarUrl: avatarPath,
      stats: {},
    });

    const { getByTestId, getByText } = render(<ProfileScreen />);
    
    // Wait for data load
    await waitFor(() => getByText('John Doe'));

    // Verify AppImage was rendered with correct URI
    const avatar = getByTestId('profile-avatar');
    expect(avatar.props.accessibilityLabel).toBe(avatarPath);
  });
});
