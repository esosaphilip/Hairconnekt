
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchScreen } from '../SearchScreen';
import { clientBraiderApi } from '@/api/clientBraider';
import { favoriteStatus } from '@/services/favorites';
import { getRecentSearches } from '@/services/recentSearches';

// Mocks
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        search: jest.fn(),
    },
}));
jest.mock('@/services/favorites', () => ({
    favoriteStatus: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
}));
jest.mock('@/services/recentSearches', () => ({
    getRecentSearches: jest.fn().mockResolvedValue(['Braids', 'Twists']),
    addRecentSearch: jest.fn().mockResolvedValue(['Braids', 'Twists', 'New']),
    clearRecentSearches: jest.fn(),
}));
jest.mock('@/services/logger', () => ({ logger: { error: jest.fn() } }));
jest.mock('@/i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
jest.mock('@/auth/AuthContext', () => ({
    useAuth: () => ({ tokens: { accessToken: 'mock-token' } }),
}));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({ navigate: jest.fn() }),
        useRoute: () => ({ params: {} }),
    };
});
jest.mock('@/api/http', () => ({
    http: { get: jest.fn().mockResolvedValue({ data: [] }) },
}));

describe('SearchScreen', () => {
    const mockResults = [
        { id: 'p1', name: 'Provider One', businessName: 'Salon One', isVerified: true },
    ];

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        (clientBraiderApi.search as jest.Mock).mockResolvedValue(mockResults);
        (favoriteStatus as jest.Mock).mockResolvedValue({ favorites: [] });
        (getRecentSearches as jest.Mock).mockResolvedValue([]);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders search input and defaults', async () => {
        const { getByPlaceholderText } = render(<SearchScreen />);
        expect(getByPlaceholderText('screens.search.searchPlaceholder')).toBeTruthy();
    });

    it('performs search on text input', async () => {
        const { getByPlaceholderText, getByText } = render(<SearchScreen />);

        // Type 'Braids'
        fireEvent.changeText(getByPlaceholderText('screens.search.searchPlaceholder'), 'Braids');

        // Run debounce timer
        jest.advanceTimersByTime(500);

        // Wait for debounce (400ms in code)
        await waitFor(() => {
            expect(clientBraiderApi.search).toHaveBeenCalledWith('Braids', { category: undefined });
        });

        // Verify result rendering
        await waitFor(() => expect(getByText('Provider One')).toBeTruthy());
    });
});
