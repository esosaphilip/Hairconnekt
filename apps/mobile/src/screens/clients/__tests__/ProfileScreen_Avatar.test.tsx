import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';
import { usersApi } from '@/services/users';
import { normalizeUrl } from '@/utils/url';

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
  normalizeUrl: jest.fn((url) => {
    if (!url) return undefined;
    if (url.startsWith('/')) return `http://localhost:3000${url}`;
    return `R2_URL/${url}`;
  }),
}));

// Mock Components
jest.mock('@/components/Icon', () => 'Icon');
jest.mock('@/components/Text', () => 'Text');
jest.mock('@/components/Button', () => 'Button');
jest.mock('@/components/Card', () => 'Card');
jest.mock('@/components/separator', () => 'Separator');
jest.mock('@/components/AlertModal', () => 'AlertModal');

// Mock Native Modules
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

// Don't mock react-native
// jest.mock('react-native', ...);

describe('ProfileScreen Avatar', () => {
  it('calls normalizeUrl with the avatar URL', async () => {
    const avatarPath = '/uploads/avatar.jpg';
    (usersApi.getMe as jest.Mock).mockResolvedValue({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      avatarUrl: avatarPath,
      stats: {},
    });

    const { getByText } = render(<ProfileScreen />);
    
    // Wait for data load
    await waitFor(() => getByText('John Doe'));

    // Verify normalizeUrl was called
    expect(normalizeUrl).toHaveBeenCalledWith(avatarPath);
  });
});
