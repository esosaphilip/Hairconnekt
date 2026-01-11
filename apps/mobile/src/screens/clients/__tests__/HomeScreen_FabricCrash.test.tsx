import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('@/context/LocationContext', () => ({
    useLocation: () => ({
        location: { coords: { latitude: 0, longitude: 0 } },
        errorMsg: null,
    }),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
        useFocusEffect: jest.fn(),
    };
});

describe('HomeScreen', () => {
    it('renders without crashing', () => {
        render(<HomeScreen />);
    });

    it('navigates to Notifications on bell icon press', async () => {
        const { getByTestId } = render(<HomeScreen />);

        const bellButton = getByTestId('notification-bell');
        expect(bellButton).toBeTruthy();

        await act(async () => {
            fireEvent.press(bellButton);
        });

        expect(mockNavigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Profile',
            params: { screen: 'Notifications' }
        });
    });
});
