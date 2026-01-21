import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
// Mock everything BEFORE imports
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));
jest.mock('expo-font', () => ({
    isLoaded: jest.fn().mockReturnValue(true),
    loadAsync: jest.fn(),
}));

// Mock child components to prevent render errors
jest.mock('@/components/Icon', () => 'Icon');
jest.mock('../components/PopularStyleCard', () => ({ PopularStyleCard: 'PopularStyleCard' }));
jest.mock('../components/NearbyBraiderCard', () => ({ NearbyBraiderCard: 'NearbyBraiderCard' }));
jest.mock('@/components/textarea', () => 'Textarea');

// Mock UI components but keep structure for Avatar checks if needed, 
// OR just mock them and check props.
jest.mock('@/ui', () => {
    const React = require('react');
    const { View, Image, Text } = require('react-native');
    return {
        Avatar: ({ source, children, style }: any) => (
            <View testID="avatar-container" style={style}>
                {source && <Image testID="avatar-image" source={source} />}
                {children}
            </View>
        ),
        AvatarImage: ({ source, uri }: any) => <Image testID="avatar-image-inner" source={source || { uri }} />,
        AvatarFallback: ({ label }: any) => <Text>{label}</Text>,
        Button: ({ onPress, title, testID, children }: any) => (
            <View onTouchEnd={onPress} testID={testID}>
                <Text>{title || children}</Text>
            </View>
        ),
        Card: ({ children }: any) => <View>{children}</View>,
        Input: ({ onChangeText, value, placeholder }: any) => <View />,
        Switch: () => <View />,
        Badge: () => <View />,
    };
});

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

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
        }),
    };
});

import { HomeScreen } from '../HomeScreen';
import { EditProfileScreen } from '../../shared/EditProfileScreen';
import { useAuth } from '@/auth/AuthContext';
import { usersApi } from '@/services/users';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer } from '@react-navigation/native';

describe('Phase A: Image Persistence & Rendering', () => {
    const mockUser = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        profilePictureUrl: 'https://test.com/avatar.jpg',
        userType: 'CLIENT',
    };

    const mockSetUser = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            setUser: mockSetUser,
            isAuthenticated: true,
            tokens: { accessToken: 'valid-token' },
            initials: 'TU',
            displayName: 'Test User',
            popularCategories: [],
            nearby: [],
            favorites: [],
            nearbyLoading: false,
            favoritesLoading: false,
            refresh: jest.fn(),
            t: (key: string) => key,
            formatCurrency: (val: number) => `€${val}`,
            handleLocationPress: jest.fn(),
            handleToggleFavorite: jest.fn(),
        });
    });

    it('HomeScreen renders profile image from Auth Context', () => {
        const { getByTestId, getAllByTestId } = render(
            <NavigationContainer>
                <HomeScreen />
            </NavigationContainer>
        );

        // Our mocked Avatar renders an Image with testID="avatar-image" if source is present
        const avatarImages = getAllByTestId('avatar-image');
        expect(avatarImages.length).toBeGreaterThan(0);

        // Check the source prop of the first one
        const avatar = avatarImages[0];
        expect(avatar.props.source).toEqual({ uri: mockUser.profilePictureUrl });
    });

    it('EditProfileScreen handles image upload and updates Auth Context', async () => {
        // Mock user without image initially
        (useAuth as jest.Mock).mockReturnValue({
            user: { ...mockUser, profilePictureUrl: null },
            setUser: mockSetUser,
        });

        (usersApi.uploadAvatar as jest.Mock).mockResolvedValue({ url: 'https://new-image.com/pic.jpg' });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://local/image.jpg' }],
        });

        const { getByTestId } = render(
            <NavigationContainer>
                <EditProfileScreen />
            </NavigationContainer>
        );

        const cameraBtn = getByTestId('camera-upload-btn');
        fireEvent.press(cameraBtn);

        await waitFor(() => {
            // Verify ImagePicker was called
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();

            // Verify API upload
            expect(usersApi.uploadAvatar).toHaveBeenCalledWith('file://local/image.jpg');

            // CRITICAL: Verify setUser was called with the new URL
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                profilePictureUrl: 'https://new-image.com/pic.jpg'
            }));
        });
    });
});
