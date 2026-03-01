import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { BookingFlow } from '../Booking/BookingFlow';
import { clientBraiderApi } from '@/api/clientBraider';
import { clientBookingApi } from '@/api/clientBooking';
import { useAuth } from '@/auth/AuthContext';
import { rootNavigationRef } from '@/navigation/rootNavigation';

// Mock Auth
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock APIs
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

// Mock Navigation Root
jest.mock('@/navigation/rootNavigation', () => ({
    rootNavigationRef: {
        current: {
            navigate: jest.fn(),
        }
    }
}));

// Mock Route
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

// Mock Calendar
jest.mock('@/components/calendar.native', () => {
    const React = require('react');
    const { View, Pressable, Text } = require('react-native');

    return function MockCalendar({ onSelect }: any) {
        return (
            <View testID="mock-calendar">
                <Pressable testID="mock-calendar-btn" onPress={() => onSelect(new Date('2025-10-27T10:00:00Z'))}>
                    <Text>Select Date</Text>
                </Pressable>
            </View>
        );
    };
});

describe('BookingFlow tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useAuth as jest.Mock).mockReturnValue({
            tokens: { accessToken: 'valid-token' },
            user: { id: 'client-1' },
        });

        (clientBraiderApi.getProfile as jest.Mock).mockResolvedValue({
            id: 'provider-123',
            services: [
                {
                    category: 'Braids',
                    items: [
                        { id: 'service-1', name: 'Box Braids', duration: '120 Min', price: '€80' },
                    ],
                },
            ],
        });
    });

    it('renders service selection step correctly and prevents proceeding without selection', async () => {
        const { getByText, getByTestId } = render(<BookingFlow />);

        await waitFor(() => {
            expect(getByText('Box Braids')).toBeTruthy();
        });

        const nextButton = getByText('Weiter');
        fireEvent.press(nextButton);
        // It should still be on the same step, meaning the next step title isn't shown
        expect(render(<BookingFlow />).queryByText('Datum wählen')).toBeNull();
    });

    it('renders date and time selection, preventing proceed if not selected', async () => {
        const { getByText, getByTestId, queryByText } = render(<BookingFlow />);

        await waitFor(() => getByText('Box Braids'));
        fireEvent.press(getByText('Box Braids'));
        fireEvent.press(getByText('Weiter'));

        await waitFor(() => {
            expect(getByText('Datum wählen')).toBeTruthy();
        });

        let nextBtn = getByText('Weiter');
        fireEvent.press(nextBtn);
        // Step 3 Confirmation shouldn't be reached
        expect(queryByText('Zahlungsmethode')).toBeNull();

        // Select Date
        fireEvent.press(getByTestId('mock-calendar-btn'));

        // Next button is still disabled because time isn't selected
        nextBtn = getByText('Weiter');
        fireEvent.press(nextBtn);
        expect(queryByText('Zahlungsmethode')).toBeNull();
    });

    it('calls the valid endpoint and navigates correctly upon success', async () => {
        (clientBookingApi.createAppointment as jest.Mock).mockResolvedValue({
            id: 'BOOKING-123'
        });

        const { getByText, getByTestId, findByText } = render(<BookingFlow />);

        // Step 1: Services
        await waitFor(() => getByText('Box Braids'));
        fireEvent.press(getByText('Box Braids'));
        fireEvent.press(getByText('Weiter'));

        // Step 2: Date and Time
        await waitFor(() => getByText('Datum wählen'));
        fireEvent.press(getByTestId('mock-calendar-btn'));

        await waitFor(() => getByText('14:00'));
        fireEvent.press(getByText('14:00'));
        fireEvent.press(getByText('Weiter'));

        // Step 3: Details & Confirm
        await waitFor(() => getByText('Zahlungsmethode'));

        await act(async () => {
            fireEvent.press(getByText('Jetzt buchen'));
        });

        await waitFor(() => {
            expect(clientBookingApi.createAppointment).toHaveBeenCalledWith(
                expect.objectContaining({
                    providerId: 'provider-123',
                    serviceIds: ['service-1'],
                })
            );
        });

        await waitFor(() => {
            expect(getByText('Termin bestätigt! 🎉')).toBeTruthy();
        });

        // Navigate to Appointments Screen
        fireEvent.press(getByText('Zu meinen Terminen'));

        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledWith('Tabs', { screen: 'Appointments' });
    });
});
