import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SearchScreen } from '../SearchScreen';
import { clientBraiderApi } from '@/api/clientBraider';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { getRecentSearches } from '@/services/recentSearches';
import { useAuth } from '@/auth/AuthContext';

// Mock Dependencies
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/i18n', () => ({
    useI18n: jest.fn(() => ({
        t: (key: string, options?: any) => {
            if (key === 'screens.search.empty.noResultsTitle') return 'Keine Ergebnisse';
            if (key === 'screens.search.results.count') return `${options?.count} Ergebnisse`;
            return key; // Returns raw key for other translations
        }
    })),
}));

jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        search: jest.fn(),
    },
}));

jest.mock('@/services/recentSearches', () => ({
    getRecentSearches: jest.fn(),
    addRecentSearch: jest.fn(),
    clearRecentSearches: jest.fn(),
}));

jest.mock('@/services/favorites', () => ({
    favoriteStatus: jest.fn().mockResolvedValue({ favorites: [] }),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
}));

jest.mock('@/api/http', () => ({
    http: {
        get: jest.fn().mockResolvedValue({ data: [] }),
    },
}));

jest.mock('@/navigation/rootNavigation', () => ({
    rootNavigationRef: {
        current: {
            navigate: jest.fn(),
        }
    }
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
        useRoute: () => ({
            params: {},
        }),
    };
});

// Since the component uses `ProviderCard` which might need extra context, we mock it 
// effectively turning the card into a simple pressable text for testing purposes.
jest.mock('@/components/ProviderCard', () => {
    const { Pressable, Text } = require('react-native');
    return function MockProviderCard({ data, onPress }: any) {
        return (
            <Pressable testID={`provider-card-${data.id}`} onPress={() => onPress(data.id)}>
                <Text>{data.name}</Text>
                <Text>{data.businessName}</Text>
            </Pressable>
        );
    };
});

describe('SearchScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ tokens: { accessToken: 'valid' } });
        (getRecentSearches as jest.Mock).mockResolvedValue([]);

        // Default empty search response
        (clientBraiderApi.search as jest.Mock).mockResolvedValue([]);
    });

    const renderComponent = () => render(<SearchScreen />);

    it('renders search input correctly', async () => {
        const { getByPlaceholderText } = renderComponent();
        expect(getByPlaceholderText('screens.search.searchPlaceholder')).toBeTruthy();
    });

    it('typing a city name triggers the correct API call', async () => {
        const { getByPlaceholderText } = renderComponent();

        const searchInput = getByPlaceholderText('screens.search.searchPlaceholder');

        // Type city
        fireEvent.changeText(searchInput, 'Berlin');

        // The component applies a debounce of 400ms. Wait for API to be called.
        await waitFor(() => {
            expect(clientBraiderApi.search).toHaveBeenCalledWith('Berlin', expect.any(Object));
        }, { timeout: 1000 }); // Increase timeout slightly for safety against flaky timers
    });

    it('empty results shows a "Keine Ergebnisse" message in German', async () => {
        (clientBraiderApi.search as jest.Mock).mockResolvedValue([]);

        const { getByPlaceholderText, findByText } = renderComponent();
        const searchInput = getByPlaceholderText('screens.search.searchPlaceholder');

        // Type something that yields empty results
        fireEvent.changeText(searchInput, 'UnknownCity');

        // Should show "Keine Ergebnisse" which is mocked in `t`
        const emptyMsg = await findByText('Keine Ergebnisse', {}, { timeout: 1000 });
        expect(emptyMsg).toBeTruthy();
    });

    it('tapping a result navigates to ProviderPublicProfileScreen with correct params', async () => {
        (clientBraiderApi.search as jest.Mock).mockResolvedValue([
            {
                id: 'provider-123',
                name: 'Jane Doe',
                businessName: 'Jane Braids',
                profileImage: '',
                rating: 4.8,
            }
        ]);

        const { getByPlaceholderText, findByText } = renderComponent();
        const searchInput = getByPlaceholderText('screens.search.searchPlaceholder');

        // Type and search
        fireEvent.changeText(searchInput, 'Jane');

        // Wait for the result to appear
        const providerCardName = await findByText('Jane Doe', {}, { timeout: 1000 });

        // Tap the result
        fireEvent.press(providerCardName);

        // Verify navigation
        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledWith('ProviderDetail', { id: 'provider-123' });
    });
});
