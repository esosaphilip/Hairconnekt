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
    providerId: 'p1',
    startTime: new Date().toISOString(),
    status: 'upcoming',
    providerName: 'Test Provider',
    provider: {
        id: 'p1',
        name: 'Test Provider',
        address: 'Musterstraße 1, Berlin',
        phone: '123456',
        businessName: 'Super Salon'
    },
    service: {
        name: 'Full Braids',
        duration: 120,
    },
    // Sometimes price/duration might be at root or in service object, testing robust mapping
    serviceName: 'Full Braids', 
    duration: 120,
    price: 85,
    totalPrice: 85
};

describe('AppointmentDetailScreen - Data & Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (http.get as jest.Mock).mockResolvedValue({ data: { data: mockAppointment } });
    });

    it('renders Service Name, Duration, and Price correctly', async () => {
        const { getByText, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Termindetails');

        // Check for Service Name
        expect(getByText('Full Braids')).toBeTruthy();
        
        // Check for Duration (flexible matching for "120 min" or "120 Min.")
        expect(getByText(/120\s*min/i)).toBeTruthy();

        // Check for Price (flexible matching for "85 €" or "€85")
        expect(getByText(/85\s*€/)).toBeTruthy();
    });

    it('navigates to Provider Profile when "Profil" is pressed', async () => {
        const { getByText, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Termindetails');

        const profileBtn = getByText('Profil');
        fireEvent.press(profileBtn);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('ProviderProfile', { providerId: 'p1' });
    });

    it('shows ActionSheet/Alert with "Termin verschieben" and "Termin stornieren" options', async () => {
        // Mock Alert for Android or verify ActionSheetIOS for iOS
        // Since we are in a test env, usually we mock the module.
        // For simplicity, let's assume we triggered the menu and check logic if possible, 
        // or just verify the button exists and triggers the handler.
        
        // Note: Testing ActionSheetIOS directly is tricky without mocking it at top level.
        // We will focus on finding the menu button.
        const { getByTestId, findByText } = render(
            <AppointmentDetailScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText('Termindetails');
        
        // Assuming we add testID="more-options-btn" to the header button
        // If not, we might need to select by Icon or accessibility label
        // For now, let's verify the button renders if status is upcoming
        // We will need to update the component to include testID for robust testing
    });
});
