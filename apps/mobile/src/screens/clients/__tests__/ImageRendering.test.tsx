import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ProviderProfile from '../ProviderProfile';
import { SearchScreen } from '../SearchScreen';
import { clientBraiderApi } from '@/api/clientBraider';

// 1. Mock the API module completely
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getProfile: jest.fn(),
        search: jest.fn(),
        getNearby: jest.fn(), // Added getNearby
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

describe('Image Rendering Pipeline', () => {

    it('Task A: Profile screen renders image with R2 prefix', async () => {
        // Setup Mock
        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue({
            id: 'provider-123',
            name: 'Test Provider',
            profileImage: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/123/profile.jpg',
            coverImage: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/123/profile.jpg', // Added coverImage
            imageUrl: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/123/profile.jpg',
            portfolioImages: [],
            rating: 5,
            reviewCount: 1,
            services: []
        });

        const { getByText, getAllByTestId } = render(
            <NavigationContainer>
                <ProviderProfile />
            </NavigationContainer>
        );

        // Wait for content
        await waitFor(() => getByText('Test Provider'));

        // Check images
        const hero = getAllByTestId('hero-image')[0];
        const avatar = getAllByTestId('avatar-image')[0];

        expect(hero.props.source).toEqual({ uri: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/123/profile.jpg' });
        expect(avatar.props.source).toEqual({ uri: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/123/profile.jpg' });
    });

    it('Task B: Search Results render properly prefix images', async () => {
        (clientBraiderApi.search as jest.Mock).mockResolvedValue([
            {
                id: 'p1',
                name: 'Search Result Provider',
                profileImage: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/p1/avatar.jpg',
                rating: 4.5,
                distanceKm: 2.0,
                specialties: [],
                isVerified: true
            },
            {
                id: 'p2',
                name: 'No Image Provider',
                profileImage: null,
                rating: 4.0,
                distanceKm: 5.0,
                specialties: [],
                isVerified: false
            }
        ]);

        const { findByText, getByPlaceholderText, findAllByTestId } = render(
            <NavigationContainer>
                <SearchScreen />
            </NavigationContainer>
        );

        // Required because SearchScreen only searches if term is present
        const input = getByPlaceholderText('screens.search.searchPlaceholder');
        fireEvent.changeText(input, 'Braids');

        await findByText('Search Result Provider');

        const cardImages = await findAllByTestId('provider-card-image');
        // Only 1 image should be rendered (p1). p2 fallback avatar is View+Text, not Image with testID (unless I added it?)
        // In ProviderCard: fallback is <View ...><Text...</View>, not Image.
        expect(cardImages).toHaveLength(1);
        expect(cardImages[0].props.source).toEqual({ uri: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/providers/p1/avatar.jpg' });
    });

    it('Task C: Provider Gallery renders images with R2 prefix', async () => {
        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue({
            id: 'provider-gallery',
            name: 'Gallery Provider',
            portfolioImages: [
                'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/img1.jpg',
                'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/img2.jpg'
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

        await waitFor(() => getByText('Gallery Provider'));

        // 1. Find and press Tab
        const galleryTabBtn = getByText('Galerie'); // The tab button text
        fireEvent.press(galleryTabBtn);

        // 2. Wait for Section Header
        await waitFor(() => getByText('Galerie (2)'));

        // 3. Check Images
        const images = getAllByTestId('gallery-image');
        expect(images).toHaveLength(2);
        expect(images[0].props.source).toEqual({ uri: 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev/img1.jpg' });
    });
});
