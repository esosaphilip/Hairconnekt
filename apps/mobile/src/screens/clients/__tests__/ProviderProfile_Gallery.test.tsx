import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProviderProfile from '../ProviderProfile';
import { clientBraiderApi } from '@/api/clientBraider';

// Mock the API
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getProfile: jest.fn(),
    },
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: jest.fn(),
        navigate: jest.fn(),
    }),
    useRoute: () => ({
        params: { id: 'test-provider-1' },
    }),
}));

const mockProvider = {
    id: 'test-provider-1',
    name: 'Jane Doe',
    businessName: 'Jane\'s Braids',
    rating: 4.8,
    reviewCount: 10,
    coverImage: 'http://example.com/cover.jpg',
    profileImage: 'http://example.com/profile.jpg',
    // Key field for this test
    portfolioImages: [
        'http://example.com/img1.jpg',
        'http://example.com/img2.jpg',
        'http://example.com/img3.jpg'
    ],
    services: [],
    badges: ['Verified'],
    stats: [],
    hours: [],
    reviews: []
};

describe('ProviderProfile - Gallery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue(mockProvider);
    });

    it('renders portfolio images when "Galerie" tab is selected', async () => {
        const { getByText, findByText, getAllByTestId } = render(<ProviderProfile />);

        // 1. Wait for profile to load
        await findByText('Jane\'s Braids');

        // 2. Find and press the "Galerie" tab
        const galleryTab = getByText('Galerie');
        fireEvent.press(galleryTab);

        // 3. Check for the Gallery header which should include count
        // "Galerie (3)" because we mocked 3 images
        await findByText('Galerie (3)');

        // 4. Verify images are rendered
        const images = getAllByTestId('gallery-image');
        expect(images).toHaveLength(3);
    });
});
