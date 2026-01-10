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
        price: 50,
        provider: {
            address: 'Test Address',
            avatar: 'https://example.com/avatar.jpg'
        }
    },
    {
        id: '2',
        startTime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        endTime: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
        status: 'pending',
        providerName: 'Provider 2',
        serviceName: 'Twists',
        price: 80,
        provider: {
            address: 'Test Address 2'
        }
    }
];

describe('AppointmentsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (clientBookingApi.getAppointments as jest.Mock).mockResolvedValue(mockAppointments);
    });

    it('renders upcoming appointments and next appointment card', async () => {
        const { getByText, findByText } = render(<AppointmentsScreen />);

        // Wait for data load
        await findByText('Meine Termine');

        // Check Tabs
        expect(getByText('Anstehend')).toBeTruthy();
        expect(getByText('Abgeschlossen')).toBeTruthy();

        // Check Next Appointment Card (should be visible for first item)
        expect(await findByText('Dein nächster Termin')).toBeTruthy();
        expect(getByText('In 1 Stunden')).toBeTruthy(); // Hours diff check

        // Check List Item (Second item only, as first is in header card - correction: logic in component hides it from list)
        // Actually, "In 1 Stunden" confirms header card is rendered.
        // Let's check if "Provider 2" is in list
        expect(getByText('Provider 2')).toBeTruthy();
    });

    it('switches tabs and fetches data', async () => {
        const { getByText, findByText } = render(<AppointmentsScreen />);
        await findByText('Meine Termine');

        // Switch to Completed
        fireEvent.press(getByText('Abgeschlossen'));

        // Verify API called with 'completed'
        await waitFor(() => {
            expect(clientBookingApi.getAppointments).toHaveBeenCalledWith('completed');
        });

        // Check Logic updates active tab style (visual check logic implicitly via functionality)
    });
});
