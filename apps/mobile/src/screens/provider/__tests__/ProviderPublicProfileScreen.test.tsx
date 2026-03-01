import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { ProviderPublicProfileScreen } from '../ProviderPublicProfileScreen';
import { useAuth } from '@/auth/AuthContext';
import { http } from '@/api/http';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
        }),
        useRoute: () => ({
            params: { id: 'provider-123' },
        }),
        useFocusEffect: (cb: any) => {
            const React = require('react');
            React.useEffect(() => {
                const cleanup = cb();
                return () => {
                    if (typeof cleanup === 'function') cleanup();
                };
            }, [cb]);
        },
    };
});

jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/api/http', () => ({
    http: {
        get: jest.fn(),
    },
}));

jest.mock('@/services/favorites', () => ({
    favoriteStatus: jest.fn().mockResolvedValue({ isFavorite: false }),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
}));

jest.mock('@/components/avatar', () => {
    const { View, Text } = require('react-native');
    const Avatar = ({ children }: any) => <View>{children}</View>;
    const AvatarImage = () => <View />;
    const AvatarFallback = ({ label }: any) => <Text>{label}</Text>;
    return {
        __esModule: true,
        default: Avatar,
        AvatarImage,
        AvatarFallback,
    };
});

describe('ProviderPublicProfileScreen isOwnProfile logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (http.get as jest.Mock).mockImplementation((url) => {
            if (url.includes('/providers/public/')) {
                return Promise.resolve({ data: { success: true, data: { id: 'provider-123', name: 'Test Provider' } } });
            }
            return Promise.resolve({ data: [] });
        });
    });

    const renderComponent = () => render(<ProviderPublicProfileScreen />);

    it('shows edit profile and hides booking/favorites when authenticated user matches provider', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            tokens: { accessToken: 'valid' },
            user: { id: 'provider-123' }, // Matches route param
        });

        const { getByText, queryByText, findByText } = renderComponent();

        // Wait for the profile to load
        await findByText('Profil bearbeiten');

        // Edit Profile should be visible
        expect(getByText('Profil bearbeiten')).toBeTruthy();

        // Booking Button should be hidden
        expect(queryByText('Jetzt buchen')).toBeNull();
    });

    it('shows booking/favorites and hides edit profile when no match', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            tokens: { accessToken: 'valid' },
            user: { id: 'another-user-456' }, // Does not match route param
        });

        const { getByText, queryByText, findByText } = renderComponent();

        // Wait for the profile to load
        await findByText('Jetzt buchen');

        // Booking Button should be visible
        expect(getByText('Jetzt buchen')).toBeTruthy();

        // Edit Profile should be hidden
        expect(queryByText('Profil bearbeiten')).toBeNull();
    });

    it('shows booking/favorites and hides edit profile when not authenticated', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            tokens: null,
            user: null,
        });

        const { getByText, queryByText, findByText } = renderComponent();

        await findByText('Jetzt buchen');

        expect(getByText('Jetzt buchen')).toBeTruthy();
        expect(queryByText('Profil bearbeiten')).toBeNull();
    });
});
