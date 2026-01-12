import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SearchScreen } from '../clients/SearchScreen';
import { clientBraiderApi } from '../../api/clientBraider';
import { useAuth } from '../../auth/AuthContext';

// Mock Dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../../api/clientBraider', () => ({
    clientBraiderApi: {
        search: jest.fn(),
    }
}));
jest.mock('../../auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));
jest.mock('../../services/recentSearches', () => ({
    getRecentSearches: jest.fn().mockResolvedValue([]),
    addRecentSearch: jest.fn()
}));
jest.mock('../../i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
    }),
}));

// Mock Navigation params
const mockParams = {
    styleName: 'Braids'
};

const mockUseRoute = {
    params: mockParams
};

// Mock Navigation hooks
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            setOptions: jest.fn(),
        }),
        useRoute: () => mockUseRoute,
    };
});

describe('SearchScreen Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock Auth Context
        (useAuth as jest.Mock).mockReturnValue({
            tokens: { accessToken: 'valid-token' },
            user: { id: 'user1', email: 'test@test.com' }
        });

        // Mock Search API response
        (clientBraiderApi.search as jest.Mock).mockResolvedValue([
            {
                id: 'provider1',
                name: 'Braids by Sarah',
                businessName: 'Sarah Saloon',
                rating: 4.8,
                reviews: [],
                distance: 2.5,
                profileImage: 'https://example.com/image.jpg',
                isVerified: true
            }
        ]);

        // Mock Recent Searches
        jest.mock('../../services/recentSearches', () => ({
            getRecentSearches: jest.fn().mockResolvedValue([]),
            addRecentSearch: jest.fn()
        }));
    });

    it('should trigger search with styleName from navigation params on mount', async () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <SearchScreen />
            </NavigationContainer>
        );

        // Verify Search Input is pre-filled
        const searchInput = getByPlaceholderText('screens.search.searchPlaceholder');
        expect(searchInput.props.value).toBe('Braids');

        // Verify API was called with the correct term
        await waitFor(() => {
            expect(clientBraiderApi.search).toHaveBeenCalledWith('Braids', expect.objectContaining({}));
        });

        // Verify results are rendered
        await waitFor(() => {
            expect(getByText('Braids by Sarah')).toBeTruthy();
        });
    });

    it('should show simplified empty state when no results found', async () => {
        (clientBraiderApi.search as jest.Mock).mockResolvedValue([]);

        const { getByText } = render(
            <NavigationContainer>
                <SearchScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText(/screens.search.empty.noResultsTitle/)).toBeTruthy();
        });
    });
});
