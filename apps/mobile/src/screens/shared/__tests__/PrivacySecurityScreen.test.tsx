import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrivacySecurityScreen } from '../PrivacySecurityScreen';
import { Alert } from 'react-native';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
    };
});

jest.spyOn(Alert, 'alert');

describe('PrivacySecurityScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () => render(<PrivacySecurityScreen />);

    it('renders sections correctly', () => {
        const { getByText } = renderComponent();

        expect(getByText('Datenschutz & Sicherheit')).toBeTruthy();
        expect(getByText('Sicherheit')).toBeTruthy();
        expect(getByText('Datenschutz')).toBeTruthy();
        expect(getByText('Deine Daten')).toBeTruthy();

        expect(getByText('Passwort ändern')).toBeTruthy();
        expect(getByText('Profil öffentlich sichtbar')).toBeTruthy();
        expect(getByText('Konto löschen')).toBeTruthy();
    });

    it('navigates to PasswordReset and DeleteAccount', () => {
        const { getByText } = renderComponent();

        // Navigate to Password Reset
        fireEvent.press(getByText('Passwort ändern'));
        expect(mockNavigate).toHaveBeenCalledWith('PasswordReset');

        // Navigate to Delete Account
        fireEvent.press(getByText('Konto löschen'));
        expect(mockNavigate).toHaveBeenCalledWith('DeleteAccount');

        // Additional Navigation
        fireEvent.press(getByText('Datenschutzerklärung lesen'));
        expect(mockNavigate).toHaveBeenCalledWith('PrivacyPolicy');
    });

    it('toggles switches for profile visibility and location sharing', () => {
        // RNTL handles Switch by allowing valueChange
        const { getByText, getByRole, getAllByRole } = renderComponent();

        // The screen has 2 switches
        const switches = getAllByRole('switch');
        expect(switches.length).toBe(2);

        // Profile Visibility (True initial)
        const profileSwitch = switches[0];
        expect(profileSwitch.props.value).toBe(true);

        fireEvent(profileSwitch, 'valueChange', false);
        // In our component, we just set state so the UI rerenders
        expect(profileSwitch.props.value).toBe(false);

        // Location Sharing (True initial)
        const locationSwitch = switches[1];
        expect(locationSwitch.props.value).toBe(true);

        fireEvent(locationSwitch, 'valueChange', false);
        expect(locationSwitch.props.value).toBe(false);
    });

    it('shows an alert when pressing data export', () => {
        const { getByText } = renderComponent();

        fireEvent.press(getByText('Daten exportieren'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Hinweis',
            'Diese Funktion ist in Kürze verfügbar.'
        );
    });
});
