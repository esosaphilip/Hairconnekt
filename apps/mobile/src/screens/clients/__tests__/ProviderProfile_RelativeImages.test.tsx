import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ProviderProfile from '../ProviderProfile';
import { clientBraiderApi } from '@/api/clientBraider';
import { normalizeUrl } from '@/utils/url';

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
        const profileImagePath = '/providers/123/profile.jpg'; // Leading slash
        const coverImagePath = 'providers/123/cover.jpg';      // No leading slash
        const gallery1 = '/portfolio/img1.jpg';                // Leading slash
        const gallery2 = 'portfolio/img2.jpg';                 // No leading slash

        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue({
            id: 'provider-relative',
            name: 'Relative Path Provider',
            profileImage: profileImagePath,
            coverImage: coverImagePath,
            imageUrl: '/providers/123/fallback.jpg',
            portfolioImages: [gallery1, gallery2],
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

        // normalizeUrl strips the leading slash and always uses DEFAULT_B2_URL for relative paths
        const expectedCoverUrl = normalizeUrl(coverImagePath);    // 'providers/123/cover.jpg' -> B2
        const expectedProfileUrl = normalizeUrl(profileImagePath); // '/providers/123/profile.jpg' -> B2

        // Verify Cover Image normalization
        expect(hero.props.source).toEqual({ uri: expectedCoverUrl });

        // Verify Avatar normalization
        expect(avatar.props.source).toEqual({ uri: expectedProfileUrl });

        // 2. Check Gallery Images
        const galleryTabBtn = getByText('Galerie');
        fireEvent.press(galleryTabBtn);

        // Wait for Section Header
        await waitFor(() => getByText('Galerie (2)'));

        // Check Images
        const images = getAllByTestId(/gallery-image-content-/);
        expect(images).toHaveLength(2);

        // Verify Gallery Images with normalized URLs
        expect(images[0].props.source).toEqual({ uri: normalizeUrl(gallery1) });
        expect(images[1].props.source).toEqual({ uri: normalizeUrl(gallery2) });
    });
});
