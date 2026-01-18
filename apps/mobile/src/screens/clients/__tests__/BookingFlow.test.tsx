
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { BookingFlow } from '../BookingFlow';
import { clientBraiderApi } from '@/api/clientBraider';
import { clientBookingApi } from '@/api/clientBooking';

// Mocks
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getProfile: jest.fn(),
    },
}));
jest.mock('@/api/clientBooking', () => ({
    clientBookingApi: {
        createAppointment: jest.fn(),
    },
}));
jest.mock('@/auth/AuthContext', () => ({
    useAuth: () => ({ tokens: { accessToken: 'mock-token' } }),
}));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
        }),
        useRoute: () => ({
            params: { id: 'provider-123' },
        }),
    };
});

// Mock Calendar/Icons/Components if complex
jest.mock('@/components/Icon', () => 'Icon');
jest.mock('@/components/calendar.native', () => {
    const React = require('react');
    const { View, Button, Text } = require('react-native');
    return ({ onSelect, selected }: { onSelect: (date: Date) => void; selected?: Date }) => (
        <View testID="mock-calendar">
            <Text>Selected: {selected ? selected.toISOString() : 'None'}</Text>
            <Button title="Select Date" onPress={() => onSelect(new Date('2025-10-27T10:00:00Z'))} />
        </View>
    );
});

describe('BookingFlow', () => {
    const mockProvider = {
        id: 'provider-123',
        name: 'Test Provider',
        services: [
            {
                id: 'cat-1',
                items: [
                    { id: 'svc-1', name: 'Box Braids', price: '€50', duration: '2 Std.' },
                    { id: 'svc-2', name: 'Cornrows', price: '€30', duration: '1 Std.' }
                ]
            }
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue(mockProvider);
    });

    it('renders correctly and loads provider', async () => {
        const { getByText } = render(<BookingFlow />);

        await waitFor(() => expect(getByText('Services auswählen')).toBeTruthy());
    });

    it('completes the full booking flow', async () => {
        (clientBookingApi.createAppointment as jest.Mock).mockResolvedValue({ id: 'booking-123' });

        const { getByText, getByTestId, getAllByText } = render(<BookingFlow />);

        // Step 1: Select Service
        await waitFor(() => expect(getByText('Box Braids')).toBeTruthy());
        fireEvent.press(getByText('Box Braids')); // Select service
        fireEvent.press(getByText('Weiter'));

        // Step 2: Select Date & Time
        await waitFor(() => expect(getByText('Termin wählen')).toBeTruthy());
        // Use mock calendar button to select date
        fireEvent.press(getByText('Select Date'));

        // Select time slot (e.g., 14:00)
        // Wait for time slots to appear after date selection logic?
        // In component: `{selectedDate && (... time slots ...)}`
        await waitFor(() => expect(getByText('14:00')).toBeTruthy());
        fireEvent.press(getByText('14:00'));

        fireEvent.press(getByText('Weiter'));

        // Step 3: Details & Confirmation
        await waitFor(() => expect(getByText('Buchungsdetails')).toBeTruthy());
        // Optional: Enter notes
        // fireEvent.press(getByText('Jetzt buchen'));

        await act(async () => {
            fireEvent.press(getByText('Jetzt buchen'));
        });

        // Expect API call
        await waitFor(() => {
            expect(clientBookingApi.createAppointment).toHaveBeenCalledWith(expect.objectContaining({
                providerId: 'provider-123',
                serviceIds: expect.arrayContaining(['svc-1']),
                startTime: expect.any(String), // '2025-10-27T14:00:00.000Z' roughly
                endTime: expect.any(String),
            }));
        });

        // Step 4: Success Screen
        await waitFor(() => expect(getByText('Termin bestätigt! 🎉')).toBeTruthy());
    });
});
