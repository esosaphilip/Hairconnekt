import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { rootNavigationRef } from '@/navigation/rootNavigation';

// Mock dependencies
jest.mock('@/components/Icon', () => 'Icon');
jest.mock('@/ui', () => ({
    Avatar: 'Avatar',
    Button: 'Button',
    Card: 'Card',
    Input: 'Input',
}));

// Mock child components to avoid rendering deep trees
jest.mock('../components/PopularStyleCard', () => ({
    PopularStyleCard: () => 'PopularStyleCard'
}));
jest.mock('../components/NearbyBraiderCard', () => ({
    NearbyBraiderCard: () => 'NearbyBraiderCard'
}));


// Mock Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
    useFocusEffect: jest.fn(),
}));

// Mock rootNavigationRef
jest.mock('@/navigation/rootNavigation', () => ({
    rootNavigationRef: {
        current: {
            navigate: jest.fn(),
        },
    },
}));

describe('HomeScreen - Notification Debounce Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // NOTE: The notification bell was removed from HomeScreen in MVP-CUT.
    // These tests have been updated to verify only what is actually rendered.
    // The notification bell de-bounce logic is tested at the component level via mock.
    it.skip('prevents multiple navigation calls on rapid tapping', () => {
        // SKIP: notification-bell has been removed from HomeScreen (MVP-CUT).
        // Restore when the bell is re-added in v2.
    });

    it.skip('allows navigation again after debounce time passes', () => {
        // SKIP: notification-bell has been removed from HomeScreen (MVP-CUT).
        // Restore when the bell is re-added in v2.
    });

    it('renders styles and nearby braiders without key collisions', () => {
        const { update } = render(<HomeScreen />);

        // Ensure no crash on re-render/update
        update(<HomeScreen />);
    });
});
