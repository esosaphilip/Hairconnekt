import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationSettingsScreen from '../NotificationSettingsScreen';
import { notificationsApi } from '@/api/notifications';
import { Alert } from 'react-native';

// Mock API
jest.mock('@/api/notifications', () => ({
    notificationsApi: {
        getPreferences: jest.fn(),
        updatePreferences: jest.fn(),
    },
}));

// Mock Navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

// Mock Lucide Icons (since they are used in the component)
jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
    Bell: 'Bell',
    Mail: 'Mail',
    MessageSquare: 'MessageSquare',
    Calendar: 'Calendar',
    Star: 'Star',
    CreditCard: 'CreditCard',
    TrendingUp: 'TrendingUp',
    Users: 'Users',
    Volume2: 'Volume2',
    Vibrate: 'Vibrate',
    Clock: 'Clock',
}));

describe('NotificationSettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (notificationsApi.getPreferences as jest.Mock).mockResolvedValue({
            pushEnabled: true,
            emailEnabled: false,
            smsEnabled: true,
        });
    });

    it('loads settings on mount', async () => {
        const { getByText } = render(<NotificationSettingsScreen />);

        await waitFor(() => {
            expect(notificationsApi.getPreferences).toHaveBeenCalled();
        });

        // We can't easily check switch values directly in RN testing library without testIDs, 
        // but we can assume if the API was called, data was loaded.
        // Let's verify element presence to ensure no crash.
        expect(getByText('Push-Benachrichtigungen')).toBeTruthy();
    });

    it('saves settings when save button is pressed', async () => {
        (notificationsApi.updatePreferences as jest.Mock).mockResolvedValue({});
        const { getByText } = render(<NotificationSettingsScreen />);

        // Wait for load
        await waitFor(() => expect(notificationsApi.getPreferences).toHaveBeenCalled());

        const saveButton = getByText('Einstellungen speichern');
        fireEvent.press(saveButton);

        await waitFor(() => {
            expect(notificationsApi.updatePreferences).toHaveBeenCalledWith({
                pushEnabled: true,
                emailEnabled: false,
                smsEnabled: true, // Based on mock return values
            });
            expect(Alert.alert).toHaveBeenCalledWith('Erfolg', 'Einstellungen gespeichert');
        });
    });

    it('handles save error', async () => {
        (notificationsApi.updatePreferences as jest.Mock).mockRejectedValue(new Error('Failed'));
        const { getByText } = render(<NotificationSettingsScreen />);

        // Wait for load
        await waitFor(() => expect(notificationsApi.getPreferences).toHaveBeenCalled());

        const saveButton = getByText('Einstellungen speichern');
        fireEvent.press(saveButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Fehler', 'Fehler beim Speichern');
        });
    });
});
