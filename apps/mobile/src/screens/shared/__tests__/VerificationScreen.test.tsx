import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VerificationScreen } from '../VerificationScreen';
import { http } from '@/api/http';
import { Alert } from 'react-native';

// Mocks
jest.mock('@/api/http', () => ({
    http: {
        post: jest.fn(),
    },
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Mock Navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
}));

// Mock Auth Context
const mockSetUser = jest.fn();
const mockUser = {
    id: '123',
    email: 'test@example.com',
    phone: '+1234567890',
    emailVerified: false,
    phoneVerified: false,
};

jest.mock('@/auth/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        setUser: mockSetUser,
    }),
}));

describe('VerificationScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
    });

    it('renders correctly for unverified user', () => {
        const { getByText, getAllByPlaceholderText } = render(<VerificationScreen />);

        expect(getByText('Verifizierung')).toBeTruthy();
        expect(getByText('E-Mail verifizieren')).toBeTruthy();
        expect(getByText('Telefonnummer verifizieren')).toBeTruthy();
        const codes = getAllByPlaceholderText('Code');
        expect(codes.length).toBeGreaterThanOrEqual(1);
    });

    it('uses bypass code 000000 for email verification', async () => {
        const { getAllByPlaceholderText, getByText } = render(<VerificationScreen />);

        // Find inputs - first one is usually email if both pending, relying on order or specific props if available
        const inputs = getAllByPlaceholderText('Code');
        const emailInput = inputs[0]; // Logic in component: Email card comes first if needsEmail is true

        fireEvent.changeText(emailInput, '000000');

        const verifyButtons = getByText('E-Mail bestätigen');
        fireEvent.press(verifyButtons);

        await waitFor(() => {
            // Should NOT call API
            expect(http.post).not.toHaveBeenCalled();

            // Should update user
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                emailVerified: true
            }));

            // Should show success alert
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erfolg',
                expect.stringContaining('Dev Bypass')
            );
        });
    });

    it('calls API for valid normal code', async () => {
        const { getAllByPlaceholderText, getByText } = render(<VerificationScreen />);

        const inputs = getAllByPlaceholderText('Code');
        const emailInput = inputs[0];

        fireEvent.changeText(emailInput, '123456');

        const verifyButtons = getByText('E-Mail bestätigen');
        fireEvent.press(verifyButtons);

        await waitFor(() => {
            // Should call API
            expect(http.post).toHaveBeenCalledWith('/auth/verify-email', {
                email: 'test@example.com',
                code: '123456'
            });

            // Should update user
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                emailVerified: true
            }));
        });
    });

    it('handles API error correctly', async () => {
        (http.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid code'));

        const { getAllByPlaceholderText, getByText } = render(<VerificationScreen />);

        const inputs = getAllByPlaceholderText('Code');
        const emailInput = inputs[0];

        fireEvent.changeText(emailInput, '654321');

        const verifyButtons = getByText('E-Mail bestätigen');
        fireEvent.press(verifyButtons);

        await waitFor(() => {
            expect(http.post).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Fehler', 'Invalid code');
            expect(mockSetUser).not.toHaveBeenCalled();
        });
    });
});
