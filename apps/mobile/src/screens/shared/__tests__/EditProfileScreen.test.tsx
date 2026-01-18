
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';
import { useAuth } from '@/auth/AuthContext';
import { usersApi } from '@/services/users';

// Mock dependencies
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/services/users', () => ({
    usersApi: {
        getMe: jest.fn(),
        updateMe: jest.fn(),
        uploadAvatar: jest.fn(),
    },
}));

jest.mock('@/api/http', () => ({
    http: {
        get: jest.fn(),
        patch: jest.fn(),
    },
}));


// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: {
        Images: 'Images',
    },
}));

import * as ImagePicker from 'expo-image-picker';

describe('EditProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders Client Profile UI with Image Placeholder and Camera Icon (Issue 9)', async () => {
        // Mock Client User
        (useAuth as jest.Mock).mockReturnValue({
            user: { type: 'CLIENT', id: 'c1' },
        });

        (usersApi.getMe as jest.Mock).mockResolvedValue({
            firstName: 'Max',
            lastName: 'Mustermann',
            phone: '123456',
            profileImage: null, // No image initially
        });

        const { getByText, getByTestId, findByText } = render(<EditProfileScreen />);

        await findByText('Profil bearbeiten');

        expect(getByText('MM')).toBeTruthy();
        expect(getByTestId('camera-upload-btn')).toBeTruthy();
    });

    it('triggers image picker and upload when camera button is pressed (Issue 16)', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { type: 'CLIENT', id: 'c1' },
        });

        (usersApi.getMe as jest.Mock).mockResolvedValue({
            firstName: 'Max',
            lastName: 'Mustermann',
            phone: '123456',
            profilePictureUrl: null,
        });

        // Mock ImagePicker result
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://new-image.jpg' }],
        });

        // Mock Upload Success
        (usersApi.uploadAvatar as jest.Mock).mockResolvedValue({
            url: 'https://storage.example.com/new-image.jpg',
        });

        const { getByTestId, findByText } = render(<EditProfileScreen />);

        await findByText('Profil bearbeiten');

        const cameraBtn = getByTestId('camera-upload-btn');
        fireEvent.press(cameraBtn);

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });

        // Verify uploadAvatar called with correct uri
        // Note: The implementation might pass the whole asset or just URI depending on users.ts
        // users.ts: uploadAvatar(image: UploadImage) where UploadImage = { uri: string ... } | string
        await waitFor(() => {
            expect(usersApi.uploadAvatar).toHaveBeenCalledWith('file://new-image.jpg');
        });
    });
});

