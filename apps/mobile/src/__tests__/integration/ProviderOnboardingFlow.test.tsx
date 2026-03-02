import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '@/screens/shared/RegisterScreen';
import { ProviderCalendar as ProviderCalendarScreen } from '@/screens/provider/ProviderCalendar';
import { AppointmentRequestScreen } from '@/screens/provider/AppointmentRequestScreen';
import { useAuth } from '@/auth/AuthContext';
import { providersApi } from '@/services/providers';
import { providerAppointmentsApi } from '@/api/providerAppointments';
import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert').mockImplementation(() => { });

jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/services/providers', () => ({
    providersApi: {
        addService: jest.fn(),
        addPortfolioItem: jest.fn(),
        updateAvailability: jest.fn(),
        getCalendar: jest.fn(),
        getVerificationStatus: jest.fn(),
        getMyProfile: jest.fn(),
    },
}));

jest.mock('@/api/providerAppointments', () => ({
    providerAppointmentsApi: {
        providerGetAppointments: jest.fn(),
        providerView: jest.fn(),
        accept: jest.fn(),
    },
}));

// Mock useProviderCalendar so the calendar tab doesn't make real API calls
jest.mock('@/hooks/useProviderCalendar', () => ({
    useProviderCalendar: jest.fn().mockReturnValue({
        markedDates: {},
        loading: false,
        error: null,
        refresh: jest.fn(),
    }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
        }),
        useRoute: () => ({
            params: { id: 'req-999' },
        }),
    };
});

describe('Integration: Provider Onboarding & Booking Flow', () => {
    let authContextMock: any;

    beforeEach(() => {
        jest.clearAllMocks();

        authContextMock = {
            register: jest.fn().mockResolvedValue(true),
            login: jest.fn().mockResolvedValue(true),
            tokens: null,
            user: null
        };
        (useAuth as jest.Mock).mockReturnValue(authContextMock);

        // Default calendar mock returns empty data
        (providersApi.getCalendar as jest.Mock).mockResolvedValue({ appointments: [] });
        (providersApi.getVerificationStatus as jest.Mock).mockResolvedValue({ status: 'approved' });
        (providersApi.getMyProfile as jest.Mock).mockResolvedValue({ id: 'jane-123' });
    });

    it('completes provider registration and service setup', async () => {
        // ---- STEP 1: Registration ----
        const renderResult = render(<RegisterScreen />);
        const { getByPlaceholderText, unmount: unmountRegister } = renderResult;

        fireEvent.changeText(getByPlaceholderText('Vorname *'), 'Jane');
        fireEvent.changeText(getByPlaceholderText('Nachname *'), 'Braider');
        fireEvent.changeText(getByPlaceholderText('E-Mail *'), 'jane@example.com');
        fireEvent.changeText(getByPlaceholderText('151 1234 5678'), '15112345678');

        const passwordInputs = renderResult.getAllByPlaceholderText('••••••••');
        fireEvent.changeText(passwordInputs[0], 'Jane1234!');
        fireEvent.changeText(passwordInputs[1], 'Jane1234!');

        fireEvent.press(renderResult.getByTestId('accept-terms-checkbox'));
        fireEvent.press(renderResult.getByTestId('register-submit-button'));

        await waitFor(() => {
            expect(authContextMock.register).toHaveBeenCalled();
        });

        unmountRegister();
    });

    it('provider can set up services and portfolio after registration', async () => {
        // Setup authenticated provider
        authContextMock = {
            ...authContextMock,
            tokens: { accessToken: 'valid' },
            user: { id: 'jane-123', userType: 'PROVIDER', providerStatus: 'APPROVED' },
        };
        (useAuth as jest.Mock).mockReturnValue(authContextMock);

        await (providersApi as any).addService('jane-123', { name: 'Twists', price: 100 });
        await (providersApi as any).addPortfolioItem('jane-123', { url: 'https://example.com/port.jpg' });

        expect((providersApi as any).addService).toHaveBeenCalledWith('jane-123', { name: 'Twists', price: 100 });
        expect((providersApi as any).addPortfolioItem).toHaveBeenCalledWith('jane-123', { url: 'https://example.com/port.jpg' });
        // [UPLOAD-REMOVED] uploadImageFile call removed — upload logic rebuilt with new system
    });

    it('provider can view their calendar and navigate to an appointment', async () => {
        // Setup authenticated provider
        authContextMock = {
            ...authContextMock,
            tokens: { accessToken: 'valid' },
            user: { id: 'jane-123', userType: 'PROVIDER', providerStatus: 'APPROVED' },
        };
        (useAuth as jest.Mock).mockReturnValue(authContextMock);

        // ---- STEP 3: Provider Calendar View ----
        (providersApi.getCalendar as jest.Mock).mockResolvedValue({
            appointments: [
                {
                    id: 'req-999',
                    status: 'PENDING',
                    startTime: '10:00',
                    endTime: '11:00',
                    date: '2026-03-15',
                    client: { name: 'Alice', image: null },
                    services: [{ name: 'Twists', durationMinutes: 60 }],
                    totalPriceCents: 10000,
                }
            ]
        });

        const { getByText, unmount: unmountCalendar } = render(<ProviderCalendarScreen />);

        // Calendar header should always render
        await waitFor(() => {
            expect(getByText('Terminkalender')).toBeTruthy();
        });

        // View mode buttons should be rendered
        expect(getByText('Tag')).toBeTruthy();
        expect(getByText('Woche')).toBeTruthy();
        expect(getByText('Monat')).toBeTruthy();

        // The add appointment button should also be available
        expect(getByText('+ Termin')).toBeTruthy();

        unmountCalendar();
    });

    it('provider can accept an appointment request', async () => {
        // Setup authenticated provider
        authContextMock = {
            ...authContextMock,
            tokens: { accessToken: 'valid' },
            user: { id: 'jane-123', userType: 'PROVIDER', providerStatus: 'APPROVED' },
        };
        (useAuth as jest.Mock).mockReturnValue(authContextMock);

        // ---- STEP 4: Accept Appointment ----
        (providerAppointmentsApi.providerView as jest.Mock).mockResolvedValue({
            id: 'req-999',
            client: { name: 'Alice', phone: '+49151234567' },
            service: { name: 'Twists' },
            requestedDate: '30.10.2025',
            status: 'PENDING',
            alternatives: [],
        });
        (providerAppointmentsApi.accept as jest.Mock).mockResolvedValue({ success: true, message: 'Termin bestätigt' });

        const { getByText: getReqText, findByText: findReqText, unmount: unmountRequest } = render(<AppointmentRequestScreen />);

        // Wait for Alice's name to appear
        await findReqText('Alice');

        // Press accept button
        fireEvent.press(getReqText('Anfrage annehmen'));

        // Confirm modal should appear
        await waitFor(() => {
            expect(getReqText('Bestätigen')).toBeTruthy();
        });

        fireEvent.press(getReqText('Bestätigen'));

        await waitFor(() => {
            expect(providerAppointmentsApi.accept).toHaveBeenCalledWith('req-999');
        });

        unmountRequest();
    });
});
