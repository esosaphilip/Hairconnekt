import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import AppointmentDetailScreen from '../AppointmentDetailScreen';
import { clientBookingApi } from '@/api/clientBooking';
import { Linking, ActionSheetIOS, Platform, Alert } from 'react-native';

// Mock dependencies
jest.mock('@/api/clientBooking');
jest.mock('@/api/http');
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    getInitialURL: jest.fn(),
    canOpenURL: jest.fn(),
    removeEventListener: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
        }),
    };
});

// Explicit Mock for ActionSheetIOS
ActionSheetIOS.showActionSheetWithOptions = jest.fn();
Alert.alert = jest.fn() as any;

const mockAppointment = {
    id: '123456789',
    status: 'upcoming',
    startTime: new Date().toISOString(),
    serviceName: 'Box Braids',
    duration: '180 Min.',
    price: '€150',
    providerId: 'p1',
    providerBusiness: 'Top Braids',
    providerName: 'Top Braids',
    location: 'Mapped Location St. 2',
    rating: '4.9',
};

describe('AppointmentDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (clientBookingApi.getAppointment as jest.Mock).mockResolvedValue(mockAppointment);
    });

    it('renders correctly and shows address', async () => {
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
        );

        await waitFor(() => expect(screen.getByText('Top Braids')).toBeTruthy());
        expect(screen.getByText('Mapped Location St. 2')).toBeTruthy();
    });

    it('opens action sheet with correct options on "more" press (iOS)', async () => {
        Platform.OS = 'ios';
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
        );

        await waitFor(() => expect(screen.getByTestId('more-options-btn')).toBeTruthy());

        fireEvent.press(screen.getByTestId('more-options-btn'));

        // NOTE: the MVP component removed "Termin verschieben" — only ['Abbrechen', 'Termin stornieren'] remain
        expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalledWith(
            expect.objectContaining({
                options: ['Abbrechen', 'Termin stornieren'],
                destructiveButtonIndex: 1,
                cancelButtonIndex: 0,
            }),
            expect.any(Function)
        );
    });

    // NOTE: "Nachricht senden" was removed from AppointmentDetailScreen (MVP-CUT). 
    // Manual test: open a booking in the app and verify the chat navigation works.
    it.skip('navigates to Chat when "Nachricht senden" is pressed', async () => {
        // SKIP: 'Nachricht senden' button is MVP-CUT (commented out in component).
        // Restore test when feature is re-enabled in v2.
    });

    it('navigates to Provider Profile when "Profil" is pressed', async () => {
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
        );

        await waitFor(() => expect(screen.getByText('Profil')).toBeTruthy());
        fireEvent.press(screen.getByText('Profil'));

        expect(mockNavigate).toHaveBeenCalledWith('ProviderDetail', { id: 'p1' });
    });

    // NOTE: Review button ("Bewerten") was removed from AppointmentDetailScreen (MVP-CUT).
    // Manual test: mark a booking as completed and verify the review screen opens.
    it.skip('shows Review button only when status is completed and navigates correctly', async () => {
        // SKIP: 'Bewerten' button is MVP-CUT (commented out in component).
        // Restore test when feature is re-enabled in v2.
    });

    it('does not show Review button when status is pending', async () => {
        const pendingAppointment = { ...mockAppointment, status: 'pending' };
        (clientBookingApi.getAppointment as jest.Mock).mockResolvedValue(pendingAppointment);

        const navigationMock = { navigate: jest.fn(), goBack: jest.fn() };
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={navigationMock} />
        );

        await waitFor(() => expect(screen.getByText('Ausstehend')).toBeTruthy());
        expect(screen.queryByText('Bewerten')).toBeNull();
    });
});
