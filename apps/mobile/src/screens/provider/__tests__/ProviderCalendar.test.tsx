import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProviderCalendar from '../ProviderCalendar';
import { providersApi } from '@/services/providers';
import { useAuth } from '@/auth/AuthContext';
import { useProviderGate } from '@/hooks/useProviderGate';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { useNavigation } from '@react-navigation/native';

// Mocks
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/hooks/useProviderGate', () => ({
    useProviderGate: jest.fn(),
}));

jest.mock('@/hooks/useProviderCalendar', () => ({
    useProviderCalendar: jest.fn(() => ({ markedDates: {}, loading: false })),
}));

jest.mock('@/services/providers', () => ({
    providersApi: {
        getCalendar: jest.fn(),
    },
}));

jest.mock('@/components/calendar.native', () => {
    const { View, Pressable, Text } = require('react-native');

    return {
        Calendar: function MockCalendar({ onSelect }: any) {
            return (
                <View testID="mock-calendar">
                    <Pressable testID="mock-calendar-btn" onPress={() => {
                        const d = new Date();
                        d.setDate(15); // hardcoded day 15 for testing
                        onSelect(d);
                    }}>
                        <Text>Select 15th</Text>
                    </Pressable>
                </View>
            );
        }
    };
});

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
        useRoute: () => ({
            params: {},
        }),
    };
});

describe('ProviderCalendarScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useAuth as jest.Mock).mockReturnValue({
            tokens: { accessToken: 'valid-token' },
            user: { id: 'provider-1', userType: 'PROVIDER' },
            loading: false,
        });

        (useProviderGate as jest.Mock).mockReturnValue({
            status: 'provider',
            checked: true,
        });

        (providersApi.getCalendar as jest.Mock).mockResolvedValue({
            appointments: [
                {
                    id: 'apt-1',
                    date: new Date(new Date().setDate(15)).toISOString().split('T')[0],
                    startTime: '10:00:00',
                    endTime: '11:00:00',
                    services: [{ name: 'Box Braids', durationMinutes: 60 }],
                    totalPriceCents: 8000, // 80 EUR
                    client: { name: 'Alice' },
                    status: 'CONFIRMED',
                },
                {
                    id: 'apt-2',
                    date: new Date(new Date().setDate(15)).toISOString().split('T')[0],
                    startTime: '13:00:00',
                    endTime: '14:00:00',
                    services: [{ name: 'Cornrows', durationMinutes: 60 }],
                    totalPriceCents: 5000, // 50 EUR
                    client: { name: 'Bob' },
                    status: 'PENDING',
                }
            ],
        });
    });

    const renderComponent = () => render(<ProviderCalendar />);

    it('renders month view by default and switches views', async () => {
        const { getByText, queryByTestId } = renderComponent();

        // Default view is Month, so calendar mock should be visible
        await waitFor(() => {
            expect(queryByTestId('mock-calendar')).toBeTruthy();
        });

        // Check toggle buttons
        const dayBtn = getByText('Tag');
        const weekBtn = getByText('Woche');
        const monthBtn = getByText('Monat');

        fireEvent.press(weekBtn);

        // Changing views should trigger refetch (since viewMode changes)
        await waitFor(() => {
            expect(providersApi.getCalendar).toHaveBeenCalledWith(
                expect.objectContaining({ view: 'week' })
            );
        });
    });

    it('tapping a day with appointments shows the correct appointment cards and revenue', async () => {
        const { getByText, getByTestId, findAllByText } = renderComponent();

        // Wait for the calendar to load
        await waitFor(() => getByTestId('mock-calendar'));

        // Tap the 15th
        fireEvent.press(getByTestId('mock-calendar-btn'));

        // We expect both Alice and Bob to show up
        await waitFor(() => {
            expect(getByText('Alice')).toBeTruthy();
            expect(getByText('Bob')).toBeTruthy();
        });

        // Revenue calculation: 80 + 50 = 130 EUR
        await waitFor(() => {
            expect(getByText(/130 Umsatz/)).toBeTruthy();
            expect(getByText(/2 Termine/)).toBeTruthy(); // Subtitle has `2 Termine · €130 Umsatz`
        });
    });

    it('tapping a pending appointment navigates to AppointmentRequestScreen', async () => {
        const { getByText, getByTestId, findByText } = renderComponent();

        // Wait for calendar to load
        await waitFor(() => getByTestId('mock-calendar'));

        // Tap the 15th to show appointments
        fireEvent.press(getByTestId('mock-calendar-btn'));

        // Wait for pending appointment (Bob)
        const pendingText = await findByText('Ausstehend');

        // In RN testing library, pressing text might not trigger the parent Pressable/Card
        // Usually we get the parent. But here we can use `getByText('Bob')` and fireEvent on it, hopefully bubbles up
        fireEvent.press(getByText('Bob'));

        expect(mockNavigate).toHaveBeenCalledWith('AppointmentRequestScreen', { id: 'apt-2' });
    });

    it('tapping the + Termin button navigates to CreateAppointmentScreen', async () => {
        const { getByText, getByTestId } = renderComponent();

        // Wait for calendar to load
        await waitFor(() => getByTestId('mock-calendar'));

        // The header/top section has a "+ Termin" button
        const addButton = getByText('+ Termin');
        fireEvent.press(addButton);

        expect(mockNavigate).toHaveBeenCalledWith('CreateAppointmentScreen');
    });
});
