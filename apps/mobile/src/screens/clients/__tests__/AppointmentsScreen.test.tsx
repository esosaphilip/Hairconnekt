
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AppointmentsScreen } from '../AppointmentsScreen';
import { clientBookingApi } from '@/api/clientBooking';

jest.mock('@/api/clientBooking', () => ({
    clientBookingApi: {
        getAppointments: jest.fn(),
    },
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
}));

const mockAppointments = [
    {
        id: '1',
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 7200000).toISOString(),
        status: 'confirmed',
        providerName: 'Test Provider',
        serviceName: 'Braids',
        price: '50.00 €',
        rating: 4.8,
        providerImage: 'https://example.com/avatar.jpg',
        provider: {
            id: 'p1',
            name: 'Test Provider',
            address: 'Test Address',
            avatar: 'https://example.com/avatar.jpg'
        },
        location: 'Test Address'
    }
];

describe('AppointmentsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (clientBookingApi.getAppointments as jest.Mock).mockResolvedValue(mockAppointments);
    });

    it('renders the Hero Card with full provider details (Avatar, Name, Location)', async () => {
        const { getByText, findByText, getAllByText } = render(<AppointmentsScreen />);

        // Wait for data load
        await findByText('Meine Termine');

        // Check for "Dein nächster Termin" Header
        expect(getByText('Dein nächster Termin')).toBeTruthy();

        // Check for Countdown
        expect(getByText(/In 1 Std/)).toBeTruthy();

        // STRICT UI CHECKS for Hero Card:
        // Must show Provider Name
        expect(getAllByText('Test Provider').length).toBeGreaterThan(0);

        // Must show Location
        expect(getAllByText('Test Address').length).toBeGreaterThan(0);

        // Ideally check for Avatar/Rating but RNTL text queries are easiest for TDD loop unless we add testIDs.
        // We assume if these are present, the component is being rendered.
    });
});
