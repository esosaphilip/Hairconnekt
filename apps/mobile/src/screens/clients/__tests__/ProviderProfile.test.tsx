
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ProviderProfile from '../ProviderProfile';
import { clientBraiderApi } from '@/api/clientBraider';

// Mocks
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getProfile: jest.fn(),
    },
}));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
        useRoute: () => ({ params: { id: 'p1' } }),
    };
});
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('ProviderProfile', () => {
    const mockProvider = {
        id: 'p1',
        name: 'Jane Doe',
        businessName: 'Jane\'s Salon',
        imageUrl: 'https://example.com/img.jpg',
        rating: 4.8,
        reviews: [],
        services: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue(mockProvider);
    });

    it('renders provider details correctly', async () => {
        const { getByText } = render(<ProviderProfile />);

        await waitFor(() => expect(getByText(/Jane Doe/)).toBeTruthy());
        expect(getByText('Jane\'s Salon')).toBeTruthy();
    });
});
