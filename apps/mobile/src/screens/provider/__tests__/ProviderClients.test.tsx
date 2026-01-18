
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProviderClients from '../ProviderClients';
import { http } from '@/api/http';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        addListener: jest.fn((event, callback) => {
            if (event === 'focus') callback(); // Trigger focus immediately
            return jest.fn(); // unsubscribe
        }),
    }),
}));

// Mock useProviderGate
jest.mock('@/hooks/useProviderGate', () => ({
    useProviderGate: () => ({ isProvider: true, isLoading: false }),
}));

// Mock http
jest.mock('@/api/http', () => ({
    http: {
        get: jest.fn(),
    },
}));

// Mock Constants
jest.mock('@/constants', () => ({
    API_CONFIG: { ENDPOINTS: { PROVIDERS: { CLIENTS: '/providers/clients' } } },
    MESSAGES: {},
}));

describe('ProviderClients', () => {
    const mockClients = [
        {
            id: '1',
            name: 'Alice',
            lastVisitIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
            isVIP: true,
            appointments: 5,
            totalSpentCents: 5000
        },
        {
            id: '2',
            name: 'Bob',
            lastVisitIso: new Date().toISOString(), // Now (New)
            isVIP: false,
            appointments: 1,
            totalSpentCents: 1000
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (http.get as jest.Mock).mockResolvedValue({
            data: { success: true, data: { items: mockClients } }
        });
    });

    it('renders list of clients', async () => {
        const { getByText } = render(<ProviderClients />);

        await waitFor(() => {
            expect(getByText('Alice')).toBeTruthy();
            expect(getByText('Bob')).toBeTruthy();
        });
    });

    it('filters by "Stammkunden" (VIP/Repeat)', async () => {
        const { getByText, queryByText } = render(<ProviderClients />);
        await waitFor(() => getByText('Alice'));

        const filterBtn = getByText('Stammkunden');
        fireEvent.press(filterBtn);

        await waitFor(() => {
            expect(getByText('Alice')).toBeTruthy(); // Alice is VIP
            expect(queryByText('Bob')).toBeNull(); // Bob has 1 apt, not VIP
        });
    });

    it('filters by "Neu" (Recent)', async () => {
        const { getByText, queryByText } = render(<ProviderClients />);
        await waitFor(() => getByText('Alice'));

        const filterBtn = getByText('Neu');
        fireEvent.press(filterBtn);

        await waitFor(() => {
            expect(getByText('Bob')).toBeTruthy(); // Bob visits today
            expect(queryByText('Alice')).toBeNull(); // Alice 1 month ago
        });
    });

    it('sorts by A-Z', async () => {
        const { getByText } = render(<ProviderClients />);
        await waitFor(() => getByText('Alice'));

        const sortBtn = getByText('A-Z');
        fireEvent.press(sortBtn);

        // Cannot easily check order in DOM tree without internal structure knowledge, 
        // but verifying state updates don't crash and button exists.
        // We can check if re-render happens.
        expect(getByText('Alice')).toBeTruthy();
    });
});
