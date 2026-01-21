import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import AppointmentDetailScreen from '../AppointmentDetailScreen';
import { http } from '@/api/http';
import { Linking, ActionSheetIOS, Platform } from 'react-native';

// Mock dependencies
jest.mock('@/api/http');
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    getInitialURL: jest.fn(),
    canOpenURL: jest.fn(),
    removeEventListener: jest.fn(),
}));

// Mock ActionSheetIOS
// ActionSheetIOS is mocked above

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

const mockAppointment = {
    id: '123456789',
    status: 'upcoming',
    startTime: new Date().toISOString(),
    service: { name: 'Box Braids', duration: 180 },
    price: '150',
    providerId: 'p1',
    provider: {
        id: 'p1',
        businessName: 'Top Braids',
        address: 'Provider Address St. 1',
        phone: '1234567890',
    },
    location: 'Mapped Location St. 2',
};

// Explicit Mock for ActionSheetIOS
ActionSheetIOS.showActionSheetWithOptions = jest.fn();

describe('AppointmentDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (http.get as jest.Mock).mockResolvedValue({ data: { data: mockAppointment } });
    });

    it('renders correctly and shows address from location/provider', async () => {
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
        );

        // Wait for data
        await waitFor(() => expect(screen.getByText('Termindetails')).toBeTruthy());

        // Expecting to see address.
        // If the component logic prioritizes provider address (Provider Address St. 1), we check for that.
        expect(screen.getByText('Provider Address St. 1')).toBeTruthy();
    });

    it('opens action sheet with correct options on "more" press (iOS)', async () => {
        Platform.OS = 'ios';
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
        );

        await waitFor(() => expect(screen.getByTestId('more-options-btn')).toBeTruthy());

        fireEvent.press(screen.getByTestId('more-options-btn'));

        expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalledWith(
            expect.objectContaining({
                options: ['Abbrechen', 'Termin verschieben', 'Termin stornieren'],
                destructiveButtonIndex: 2,
            }),
            expect.any(Function)
        );
    });

    it('navigates to Chat when "Nachricht senden" is pressed', async () => {
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
        );

        await waitFor(() => expect(screen.getByText('Nachricht senden')).toBeTruthy());
        fireEvent.press(screen.getByText('Nachricht senden'));

        expect(mockNavigate).toHaveBeenCalledWith('Chat', { recipientId: 'p1' });
    });

    it('navigates to Provider Profile when "Profil" is pressed', async () => {
        render(
            <AppointmentDetailScreen route={{ params: { id: '123' } }} navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
        );

        await waitFor(() => expect(screen.getByText('Profil')).toBeTruthy());
        fireEvent.press(screen.getByText('Profil'));

        expect(mockNavigate).toHaveBeenCalledWith('ProviderDetail', { id: 'p1' });
    });
});
