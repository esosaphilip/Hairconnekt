
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ClientDetailScreen } from '../ClientDetailScreen'; // Named export
import { providerClientsApi } from '@/api/providerClients';
import { getProviderAppointments } from '@/api/appointments';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: mockGoBack,
        navigate: jest.fn(),
    }),
    useRoute: () => ({
        params: { clientId: 'client-1' }
    }),
}));

// Mock API
jest.mock('@/api/providerClients', () => ({
    providerClientsApi: {
        detail: jest.fn(),
        patchVip: jest.fn(),
        patchNotes: jest.fn(),
        block: jest.fn(),
    },
}));

jest.mock('@/api/appointments', () => ({
    getProviderAppointments: jest.fn(),
}));

describe('ClientDetailScreen', () => {
    const mockClient = {
        id: 'client-1',
        name: 'Jane Doe',
        phone: '123456',
        email: 'jane@example.com',
        notes: 'Initial notes',
        isVIP: false,
        appointments: 3,
        totalSpentCents: 15000,
        lastVisitIso: new Date().toISOString(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (providerClientsApi.detail as jest.Mock).mockResolvedValue(mockClient);
        (getProviderAppointments as jest.Mock).mockResolvedValue({ items: [] });
    });

    it('renders client details', async () => {
        const { getByText } = render(<ClientDetailScreen />);

        await waitFor(() => {
            expect(getByText('Jane Doe')).toBeTruthy();
            expect(getByText('Initial notes')).toBeTruthy();
        });
    });

    it('updates notes via API', async () => {
        (providerClientsApi.patchNotes as jest.Mock).mockResolvedValue({ notes: 'Updated notes' });

        const { getByTestId, getByPlaceholderText } = render(<ClientDetailScreen />);
        await waitFor(() => getByTestId('edit-notes-btn'));

        fireEvent.press(getByTestId('edit-notes-btn'));

        const input = getByPlaceholderText('Notizen zu diesem Kunden...');
        fireEvent.changeText(input, 'Updated notes');

        fireEvent.press(getByTestId('save-notes-btn'));

        await waitFor(() => {
            expect(providerClientsApi.patchNotes).toHaveBeenCalledWith('client-1', 'Updated notes');
        });
    });

    it('toggles VIP status', async () => {
        (providerClientsApi.patchVip as jest.Mock).mockResolvedValue({ isVIP: true });
        const { getByTestId } = render(<ClientDetailScreen />);

        await waitFor(() => getByTestId('vip-toggle-btn'));
        fireEvent.press(getByTestId('vip-toggle-btn'));

        await waitFor(() => {
            expect(providerClientsApi.patchVip).toHaveBeenCalledWith('client-1', true);
        });
    });
});
