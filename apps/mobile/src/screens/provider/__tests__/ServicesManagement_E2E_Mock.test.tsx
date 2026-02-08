
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ServicesManagementScreen } from '../ServicesManagementScreen';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../../api/http', () => ({
    http: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useFocusEffect: (callback: any) => callback(),
}));

jest.mock('../../../auth/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-provider-id' },
        logout: jest.fn(),
    }),
}));

// Mock useServices hook
const mockToggleServiceActive = jest.fn();
const mockDeleteService = jest.fn();
const mockLoadServices = jest.fn();

let mockServicesState: any[] = [];

jest.mock('../../../presentation/hooks/useServices', () => ({
    useServices: () => ({
        services: mockServicesState || [],
        loading: false,
        error: null,
        toggleServiceActive: mockToggleServiceActive,
        deleteService: mockDeleteService,
        createService: jest.fn(),
        loadServices: mockLoadServices,
    }),
}));

// Mock clientBraiderApi
jest.mock('../../../api/clientBraider', () => ({
    clientBraiderApi: {
        getCategories: jest.fn().mockResolvedValue([
            { id: 'cat1', name: 'Braids' }
        ]),
    },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ServicesManagement E2E Mock', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset local mock data
        mockServicesState = [];
    });

    it('displays empty state and navigates to add service', async () => {
        mockServicesState = []; // Empty

        const { getByTestId, getByText } = render(<ServicesManagementScreen />);

        await waitFor(() => expect(getByText('Noch keine Services')).toBeTruthy());
        
        const addButton = getByTestId('btn-empty-add-service');
        fireEvent.press(addButton);
    });

    it('displays services and handles toggle with valid UUID', async () => {
        const mockService = {
            id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
            name: 'Test Service',
            isActive: true,
            priceCents: 1000,
            durationMinutes: 60,
        };
        mockServicesState = [mockService];

        const { getByTestId, getByText } = render(<ServicesManagementScreen />);

        await waitFor(() => expect(getByText('Test Service')).toBeTruthy());

        const switchEl = getByTestId(`switch-${mockService.id}`);
        fireEvent(switchEl, 'valueChange', false);

        await waitFor(() => {
            expect(mockToggleServiceActive).toHaveBeenCalledWith(mockService.id, false);
        });
    });

    it('blocks action for invalid UUID and shows alert', async () => {
        const mockService = {
            id: 'invalid-id-123', // Invalid UUID
            name: 'Bad Service',
            isActive: true,
        };
        mockServicesState = [mockService];

        const { getByTestId, getByText } = render(<ServicesManagementScreen />);

        await waitFor(() => expect(getByText('Bad Service')).toBeTruthy());

        const switchEl = getByTestId(`switch-${mockService.id}`);
        fireEvent(switchEl, 'valueChange', false);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Ungültige Service-ID',
                expect.stringContaining('ungültige ID')
            );
            expect(mockToggleServiceActive).not.toHaveBeenCalled();
        });
    });

    it('handles delete service flow', async () => {
        const mockService = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Delete Me',
            isActive: true,
        };
        mockServicesState = [mockService];

        const { getByTestId, getByText } = render(<ServicesManagementScreen />);

        await waitFor(() => expect(getByText('Delete Me')).toBeTruthy());

        const deleteBtn = getByTestId(`delete-${mockService.id}`);
        fireEvent.press(deleteBtn);

        // Alert should be shown
        expect(Alert.alert).toHaveBeenCalled();
        
        // Simulate confirming the alert
        // @ts-ignore
        const alertButtons = Alert.alert.mock.calls[0][2];
        const deleteAction = alertButtons.find((b: any) => b.style === 'destructive');
        await deleteAction.onPress();

        expect(mockDeleteService).toHaveBeenCalledWith(mockService.id);
    });
});

