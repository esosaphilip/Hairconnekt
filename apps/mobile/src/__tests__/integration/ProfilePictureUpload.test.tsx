import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../../screens/clients/ProfileScreen';
import { ProviderPhotoUploadScreen } from '../../screens/provider/ProviderPhotoUploadScreen';
import { providerFilesApi } from '../../api/providerFiles';
import { usersApi } from '../../services/users';
import * as ImagePicker from 'expo-image-picker';

// --- Mocks ---

// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock API modules
jest.mock('../../api/providerFiles', () => ({
  providerFilesApi: {
    uploadAvatar: jest.fn(),
    uploadProviderProfilePicture: jest.fn(),
  },
}));

jest.mock('../../services/users', () => ({
  usersApi: {
    getMe: jest.fn(),
  },
}));

// Mock Navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

// Mock i18n
jest.mock('../../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en',
  }),
}));

// Mock logger
jest.mock('../../services/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('../../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// --- Helper ---

const renderWithAuth = (component: React.ReactNode, user: any) => {
  mockUseAuth.mockReturnValue({
    user,
    setUser: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    isAuthenticated: !!user,
    token: 'mock-token',
  });
  return render(component);
};

describe('Profile Picture Upload Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Client Avatar Upload (POST /users/me/avatar)', () => {
    it('should allow a client to upload an avatar and refresh profile', async () => {
      const clientUser = {
        id: 'client-123',
        firstName: 'Jane',
        lastName: 'Doe',
        userType: 'CLIENT',
        email: 'jane@example.com',
        phone: '1234567890',
        verified: { email: true, phone: true },
        stats: { appointments: 0, favorites: 0, reviews: 0 },
      };

      // 1. Initial Profile Load
      (usersApi.getMe as jest.Mock).mockResolvedValueOnce({
        ...clientUser,
        avatarUrl: null, // No avatar initially
      });

      // 2. Mock Image Selection
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://new-avatar.jpg', fileName: 'new-avatar.jpg', mimeType: 'image/jpeg' }],
      });

      // 3. Mock Upload Success
      (providerFilesApi.uploadAvatar as jest.Mock).mockResolvedValue({ success: true, url: 'http://api.com/new-avatar.jpg' });

      // 4. Mock Profile Refresh after upload
      (usersApi.getMe as jest.Mock).mockResolvedValueOnce({
        ...clientUser,
        avatarUrl: 'http://api.com/new-avatar.jpg', // Avatar updated
      });

      const { getByTestId } = renderWithAuth(<ProfileScreen />, clientUser);

      // Wait for initial profile data to load
      await waitFor(() => expect(usersApi.getMe).toHaveBeenCalledTimes(1));

      // Find and press the camera button
      const cameraBtn = getByTestId('upload-avatar-btn');
      fireEvent.press(cameraBtn);

      // Wait for image picker and upload process
      await waitFor(() => expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled());
      
      // Verify upload API call
      await waitFor(() => expect(providerFilesApi.uploadAvatar).toHaveBeenCalledWith({
        uri: 'file://new-avatar.jpg',
        name: 'new-avatar.jpg',
        type: 'image/jpeg',
      }));

      // Verify profile refresh
      await waitFor(() => expect(usersApi.getMe).toHaveBeenCalledTimes(2));
    });
  });

  describe('Provider Profile Picture Upload (POST /providers/me/profile-picture)', () => {
    it('should allow a provider to select and upload a profile picture', async () => {
      const providerUser = {
        id: 'provider-123',
        firstName: 'John',
        lastName: 'Smith',
        userType: 'PROVIDER',
        email: 'john@example.com',
      };

      // 1. Mock Image Selection
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://provider-pic.jpg', fileName: 'provider-pic.jpg', mimeType: 'image/jpeg' }],
      });

      // 2. Mock Upload Success
      (providerFilesApi.uploadProviderProfilePicture as jest.Mock).mockResolvedValue({ success: true });

      const { getByText } = renderWithAuth(<ProviderPhotoUploadScreen />, providerUser);

      // Find "Foto auswählen" button and press it
      const pickButton = getByText('Foto auswählen');
      fireEvent.press(pickButton);

      // Wait for image selection
      await waitFor(() => expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled());

      // Now "Speichern" button should appear
      const saveButton = await waitFor(() => getByText('Speichern'));
      expect(saveButton).toBeTruthy();

      // Press Save
      fireEvent.press(saveButton);

      // Verify upload API call
      await waitFor(() => expect(providerFilesApi.uploadProviderProfilePicture).toHaveBeenCalledWith({
        uri: 'file://provider-pic.jpg',
        name: 'provider-pic.jpg',
        type: 'image/jpeg',
      }));

      // Verify navigation back on success
      await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
    });
  });
});
