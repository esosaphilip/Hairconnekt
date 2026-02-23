import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ProviderProfile from '../ProviderProfile';
import { clientBraiderApi } from '@/api/clientBraider';

// 1. Mock the API module completely
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getProfile: jest.fn(),
    },
}));

// 2. Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 3. Mock Navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() }),
        useRoute: () => ({ params: { id: 'provider-123' } }),
    };
});

// 4. Mock Icons (Safe)
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// 5. Mock Auth Context
jest.mock('@/auth/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'test-user',
            profilePictureUrl: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/test/image.jpg',
            userType: 'client'
        },
        tokens: { accessToken: 'valid' },
        isAuthenticated: true,
    }),
    AuthProvider: ({ children }: any) => children,
}));

describe('ProviderProfile Relative Image Rendering', () => {

    it('Correctly normalizes relative image paths for gallery, cover, and profile', async () => {
        // Setup Mock with RELATIVE PATHS
        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue({
            id: 'provider-relative',
            name: 'Relative Path Provider',
            profileImage: '/providers/123/profile.jpg', // Relative path
            coverImage: 'providers/123/cover.jpg', // Relative path without leading slash
            imageUrl: '/providers/123/fallback.jpg',
            portfolioImages: [
                '/portfolio/img1.jpg',
                'portfolio/img2.jpg'
            ],
            rating: 5,
            reviewCount: 0,
            services: []
        });

        const { getByText, getAllByTestId } = render(
            <NavigationContainer>
                <ProviderProfile />
            </NavigationContainer>
        );

        // Wait for content
        await waitFor(() => getByText('Relative Path Provider'));

        // 1. Check Header Images (Cover & Avatar)
        const hero = getAllByTestId('hero-image')[0];
        const avatar = getAllByTestId('avatar-image')[0];

        // Expected Base URL from normalizeUrl (default B2 URL)
        const EXPECTED_B2 = 'https://f003.backblazeb2.com/file/hairconnekt-images';
        const EXPECTED_API = 'https://api.hairconnekt.de';

        // Verify Cover Image normalization (No leading slash -> B2)
        expect(hero.props.source).toEqual({ uri: `${EXPECTED_B2}/providers/123/cover.jpg` });

        // Verify Avatar normalization (Leading slash -> API)
        expect(avatar.props.source).toEqual({ uri: `${EXPECTED_API}/providers/123/profile.jpg` });

        // 2. Check Gallery Images
        // Find and press Tab
        const galleryTabBtn = getByText('Galerie');
        fireEvent.press(galleryTabBtn);

        // Wait for Section Header
        await waitFor(() => getByText('Galerie (2)'));

        // Check Images
        const images = getAllByTestId(/gallery-image-content-/);
        expect(images).toHaveLength(2);

        // Verify Gallery Image 1 (with leading slash -> API)
        expect(images[0].props.source).toEqual({ uri: `${EXPECTED_API}/portfolio/img1.jpg` });

        // Verify Gallery Image 2 (without leading slash -> B2)
        expect(images[1].props.source).toEqual({ uri: `${EXPECTED_B2}/portfolio/img2.jpg` });
    });
});
