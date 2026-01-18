
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AppointmentDetailScreen from '../AppointmentDetailScreen';
import { http } from '@/api/http';

// Mock http
jest.mock('@/api/http', () => ({
    http: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
};

const mockRoute = {
    params: { id: 'test-id' }
};

const mockAppointment = {
    id: 'test-id',
    providerId: 'p1', // Added providerId for logic check
    startTime: new Date().toISOString(),
    status: 'upcoming',
    providerName: 'Test Provider',
    provider: {
        id: 'p1',
        name: 'Test Provider',
        address: 'Musterstraße 1, Berlin', // Case 1: Provider has address
        phone: '123456',
    },
    service: {
        name: 'Braids',
        duration: 90,
    },
    price: 50,
};

describe('AppointmentDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (http.get as jest.Mock).mockResolvedValue({ data: { data: mockAppointment } });
    });

    it('displays the provider address correctly (Issue 12)', async () => {
        const { getByText, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Termindetails');

        // Should show the specific address, NOT "Adresse nicht verfügbar"
        expect(getByText('Musterstraße 1, Berlin')).toBeTruthy();
    });

    it('opens Maps when Route is pressed (Issue 21)', async () => {
        const openURLSpy = jest.spyOn(require('react-native').Linking, 'openURL').mockImplementation(() => Promise.resolve(true));

        const { getByText, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Termindetails');

        const routeBtn = getByText('Route');
        fireEvent.press(routeBtn);

        expect(openURLSpy).toHaveBeenCalled();
        const calledUrl = openURLSpy.mock.calls[0][0];
        expect(calledUrl).toContain('Musterstra%C3%9Fe%201%2C%20Berlin'); // URL encoded address
    });

    it('navigates to Chat when Message is pressed (Issue 21)', async () => {
        const { getByText, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Termindetails');

        const msgBtn = getByText('Nachricht senden');
        fireEvent.press(msgBtn);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Chat', { recipientId: 'p1' }); // providerId from mock
    });
});
