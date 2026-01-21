import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { AppointmentsScreen } from '../AppointmentsScreen';
import { clientBookingApi } from '@/api/clientBooking';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('@/api/clientBooking');
jest.mock('@/services/eventBus', () => ({
    on: jest.fn(() => jest.fn()),
    emit: jest.fn(),
    off: jest.fn(),
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
    };
});

const mockAppointments = [
    {
        id: '1',
        providerName: 'Jane Doe',
        serviceName: 'Box Braids',
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 7200000).toISOString(),
        status: 'upcoming',
        providerImage: 'https://example.com/jane.jpg',
        rating: 4.9,
        price: '50 €',
        location: 'Berlin',
        date: 'Fri, 1. Nov',
        time: '14:00',
        rawDate: new Date().toISOString(),
        isReviewed: false,
    },
    {
        id: '2',
        providerName: 'John Smith',
        serviceName: 'Cornrows',
        startTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        endTime: new Date(Date.now() + 90000000).toISOString(),
        status: 'upcoming',
        providerImage: null,
        rating: 4.5,
        price: '40 €',
        location: 'Hamburg',
        date: 'Sat, 2. Nov',
        time: '10:00',
        rawDate: new Date().toISOString(),
        isReviewed: false,
    },
];

describe('AppointmentsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (clientBookingApi.getAppointments as jest.Mock).mockResolvedValue(mockAppointments);
    });

    it('renders correctly and shows tabs', async () => {
        render(
            <NavigationContainer>
                <AppointmentsScreen />
            </NavigationContainer>
        );

        // Initial loading
        // await waitFor(() => expect(screen.queryByTestId('loading-indicator')).toBeTruthy());

        await waitFor(() => {
            expect(screen.getByText('Meine Termine')).toBeTruthy();
            expect(screen.getByText('Anstehend')).toBeTruthy();
            expect(screen.getByText('Abgeschlossen')).toBeTruthy();
            expect(screen.getByText('Abgesagt')).toBeTruthy();
        });
    });

    it('renders "Dein nächster Termin" hero card for the first appointment', async () => {
        render(
            <NavigationContainer>
                <AppointmentsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Hero card title
            expect(screen.getByText('Dein nächster Termin')).toBeTruthy();
            // Provider name in Hero Card
            expect(screen.getByText('Jane Doe')).toBeTruthy();
            // Service name
            expect(screen.getByText('Box Braids')).toBeTruthy();
        });
    });

    it('renders the list of other appointments correctly', async () => {
        render(
            <NavigationContainer>
                <AppointmentsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // The second appointment should be in the list
            expect(screen.getByText('John Smith')).toBeTruthy();
            expect(screen.getByText('Cornrows')).toBeTruthy();
        });
    });

    it('switches tabs and fetches data', async () => {
        render(
            <NavigationContainer>
                <AppointmentsScreen />
            </NavigationContainer>
        );

        await waitFor(() => expect(screen.getByText('Anstehend')).toBeTruthy());

        fireEvent.press(screen.getByText('Abgeschlossen'));

        await waitFor(() => {
            expect(clientBookingApi.getAppointments).toHaveBeenCalledWith('completed');
        });
    });

    it('navigates to detail on card press', async () => {
        render(
            <NavigationContainer>
                <AppointmentsScreen />
            </NavigationContainer>
        );

        await waitFor(() => expect(screen.getByText('Jane Doe')).toBeTruthy());

        // Press the hero card (Jane Doe)
        fireEvent.press(screen.getByText('Jane Doe'));

        expect(mockNavigate).toHaveBeenCalledWith('AppointmentDetail', { id: '1' });
    });
});
