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
    providerId: 'p1', // Ensure this is present
    startTime: new Date().toISOString(),
    status: 'confirmed', // Check 'confirmed' status visibility
    providerName: 'Test Provider',
    provider: {
        id: 'p1',
        name: 'Test Provider',
        address: 'Musterstraße 1, Berlin',
        phone: '123456',
        businessName: 'Super Salon',
        avatarUrl: 'http://example.com/avatar.jpg'
    },
    services: [
        { name: 'Full Braids', durationMinutes: 120 }
    ],
    totalPriceCents: 8500,
    appointmentDate: new Date().toISOString()
};

describe('AppointmentDetailScreen - Manual Test Reproduction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (http.get as jest.Mock).mockResolvedValue({ data: { data: mockAppointment } });
    });

    it('shows 3-dot menu for confirmed status', async () => {
        const { findByTestId } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        const moreBtn = await findByTestId('more-options-btn');
        expect(moreBtn).toBeTruthy();
    });

    it('navigates to ProviderDetail with correct ID', async () => {
        const { getByText, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Termindetails');

        const profileBtn = getByText('Profil');
        fireEvent.press(profileBtn);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('ProviderDetail', { id: 'p1' });
    });

    it('renders Service Details rows matching UI', async () => {
         const { getByText, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Service-Details');
        expect(getByText('Full Braids')).toBeTruthy();
        expect(getByText('120 Min.')).toBeTruthy();
        // Use partial match or regex for price to avoid space issues
        expect(getByText(/85,00.*€/)).toBeTruthy();
    });
});
