import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import NotificationSettingsScreen from '../NotificationSettingsScreen';
import { notificationsApi } from '@/api/notifications';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@/api/notifications');
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
};

describe('NotificationSettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
        (notificationsApi.getPreferences as jest.Mock).mockResolvedValue({
            pushEnabled: true,
            emailEnabled: true,
            smsEnabled: false,
        });
        (notificationsApi.updatePreferences as jest.Mock).mockResolvedValue({ success: true });
        // @ts-ignore
        Alert.alert = jest.fn();
    });

    it('renders with loaded settings', async () => {
        render(<NotificationSettingsScreen />);

        // Header
        expect(screen.getByText('Benachrichtigungen')).toBeTruthy();

        // Wait for settings to load
        await waitFor(() => {
            // Check switch states by checking toggles accessibility state or assumption
            // RNTL handles Switch values.
            // We can check if getPreferences was called.
            expect(notificationsApi.getPreferences).toHaveBeenCalled();
        });

        // Check for sections
        expect(screen.getByText('Benachrichtigungskanäle')).toBeTruthy();
        expect(screen.getByText('Push-Benachrichtigungen')).toBeTruthy();
    });

    it('updates preferences on save', async () => {
        render(<NotificationSettingsScreen />);
        await waitFor(() => expect(notificationsApi.getPreferences).toHaveBeenCalled());

        const saveBtn = screen.getByText('Einstellungen speichern');
        fireEvent.press(saveBtn);

        await waitFor(() => {
            expect(notificationsApi.updatePreferences).toHaveBeenCalledWith(expect.objectContaining({
                pushEnabled: true, // defaults
                emailEnabled: true,
                smsEnabled: false
            }));
            expect(Alert.alert).toHaveBeenCalledWith('Erfolg', 'Einstellungen gespeichert');
        });
    });
});
