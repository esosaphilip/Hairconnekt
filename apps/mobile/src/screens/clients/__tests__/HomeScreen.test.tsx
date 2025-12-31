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

describe('HomeScreen - Notification Debounce Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset global debounce timer
        // @ts-ignore
        global.lastNotificationNav = 0;
        // Mock the date to control throttle
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('prevents multiple navigation calls on rapid tapping', () => {
        const { getByTestId } = render(<HomeScreen />);
        const bellBtn = getByTestId('notification-bell');

        // Simulate 20 rapid taps
        for (let i = 0; i < 20; i++) {
            fireEvent.press(bellBtn);
            // Advance time slightly but less than debounce threshold (1000ms)
            jest.advanceTimersByTime(50);
        }

        // Should have only navigated once
        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledTimes(1);
        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Profile',
            params: { screen: 'Notifications' }
        });
    });

    it('allows navigation again after debounce time passes', () => {
        const { getByTestId } = render(<HomeScreen />);
        const bellBtn = getByTestId('notification-bell');

        // First tap
        fireEvent.press(bellBtn);
        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledTimes(1);

        // Advance time past 1000ms
        jest.setSystemTime(Date.now() + 1500); // Update system time for Date.now() check

        // Note: Our implementation effectively uses Date.now(), so jest.useFakeTimers() mocks that too.
        // However, explicit setSystemTime is safer.

        // Second tap
        fireEvent.press(bellBtn);
        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledTimes(2);
    });
});
