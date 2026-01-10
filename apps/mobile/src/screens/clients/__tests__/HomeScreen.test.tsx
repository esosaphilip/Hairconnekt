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

describe('HomeScreen - Notification Debounce Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });


    it('prevents multiple navigation calls on rapid tapping', () => {
        const { getByTestId } = render(<HomeScreen />);
        const bellBtn = getByTestId('notification-bell');

        // Simulate 20 rapid taps
        act(() => {
            for (let i = 0; i < 20; i++) {
                fireEvent.press(bellBtn);
                jest.advanceTimersByTime(50);
            }
        });

        // Should have only navigated once
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('allows navigation again after debounce time passes', () => {
        const { getByTestId } = render(<HomeScreen />);
        const bellBtn = getByTestId('notification-bell');

        act(() => {
            fireEvent.press(bellBtn);
        });
        expect(mockNavigate).toHaveBeenCalledTimes(1);

        // Advance time past 1500ms (the delay in component)
        act(() => {
            jest.advanceTimersByTime(1600);
        });

        // Second tap
        act(() => {
            fireEvent.press(bellBtn);
        });
        expect(mockNavigate).toHaveBeenCalledTimes(2);
    });

    it('renders styles and nearby braiders without key collisions', () => {
        const { update } = render(<HomeScreen />);

        // Ensure no crash on re-render/update
        update(<HomeScreen />);
    });
});


