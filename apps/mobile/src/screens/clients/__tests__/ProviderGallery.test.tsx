import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProviderProfile from '../ProviderProfile';
import { clientBraiderApi } from '@/api/clientBraider';
import { NavigationContainer } from '@react-navigation/native';

// Mocks
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getProfile: jest.fn(),
    },
}));
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
        }),
        useRoute: () => ({
            params: { id: 'provider-123' },
        }),
    };
});

const mockProvider = {
    id: 'provider-123',
    name: 'Test Provider',
    rating: 4.8,
    reviewCount: 10,
    portfolioImages: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
    ],
    services: [],
    reviews: [],
    badges: [],
    stats: [],
};

describe('ProviderProfile Gallery', () => {
    it('renders gallery images correctly', async () => {
        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue(mockProvider);

        const { getByText, getAllByTestId, findByText } = render(
            <NavigationContainer>
                <ProviderProfile />
            </NavigationContainer>
        );

        // Initial load
        await waitFor(() => expect(clientBraiderApi.getProfile).toHaveBeenCalled());

        // Switch to Gallery tab
        const galleryTab = await findByText('Galerie');
        fireEvent.press(galleryTab);

        // verify header "Galerie (2)"
        expect(getByText('Galerie (2)')).toBeTruthy();

        // Verify images
        const images = getAllByTestId(/gallery-image-content-/);
        expect(images.length).toBe(2);
        expect(images[0].props.source).toEqual({ uri: 'https://example.com/image1.jpg' });
    });
});
