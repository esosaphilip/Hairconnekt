import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';
import { useAuth } from '@/auth/AuthContext';
import { usersApi } from '@/services/users';
import { http } from '@/api/http';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));
jest.mock('@/services/users');
jest.mock('@/api/http');
jest.mock('expo-image-picker');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: jest.fn(),
    };
});

const mockNavigation = {
    goBack: jest.fn(),
};

const mockClientUser = {
    id: 'u1',
    userType: 'CUSTOMER',
    firstName: 'Max',
    lastName: 'Power',
    phone: '123456',
    profilePictureUrl: 'http://example.com/pic.jpg',
};

const mockSetUser = jest.fn();

describe('EditProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockClientUser,
            setUser: mockSetUser,
        });
        (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
        (usersApi.getMe as jest.Mock).mockResolvedValue(mockClientUser);
        (usersApi.updateMe as jest.Mock).mockResolvedValue(mockClientUser);
        // @ts-ignore
        Alert.alert = jest.fn();
    });

    it('renders client profile fields and loads data', async () => {
        render(<EditProfileScreen />);

        // Check for loading state or wait for fields
        await waitFor(() => {
            expect(screen.getByDisplayValue('Max')).toBeTruthy();
            expect(screen.getByDisplayValue('Power')).toBeTruthy();
        });

        expect(screen.getByText('Persönliche Daten')).toBeTruthy();
    });

    it('calls updateMe on save', async () => {
        render(<EditProfileScreen />);
        await waitFor(() => expect(screen.getByDisplayValue('Max')).toBeTruthy());

        const saveBtn = screen.getByText('Speichern');
        fireEvent.press(saveBtn);

        await waitFor(() => {
            expect(usersApi.updateMe).toHaveBeenCalledWith({
                firstName: 'Max',
                lastName: 'Power',
                phone: '123456',
            });
            expect(Alert.alert).toHaveBeenCalledWith('Gespeichert', expect.any(String), expect.any(Array));
        });
    });

    it('uploads image on pick', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://new.jpg' }],
        });
        (usersApi.uploadAvatar as jest.Mock).mockResolvedValue({ url: 'http://example.com/new.jpg' });

        render(<EditProfileScreen />);
        await waitFor(() => expect(screen.getByTestId('camera-upload-btn')).toBeTruthy());

        fireEvent.press(screen.getByTestId('camera-upload-btn'));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
            expect(usersApi.uploadAvatar).toHaveBeenCalledWith('file://new.jpg');
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                profilePictureUrl: 'http://example.com/new.jpg'
            }));
        });
    });
});
