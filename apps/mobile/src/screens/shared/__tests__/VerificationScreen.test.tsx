import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { VerificationScreen } from '../VerificationScreen';
import { http } from '@/api/http';
import { useAuth } from '@/auth/AuthContext';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@/api/http');
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: jest.fn(),
    }),
}));

const mockSetUser = jest.fn();
const mockUser = {
    id: 'u1',
    email: 'test@example.com',
    emailVerified: false,
    phone: '1234567890',
    phoneVerified: false,
};

describe('VerificationScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            setUser: mockSetUser,
        });
        // @ts-ignore
        Alert.alert = jest.fn();
    });

    it('renders verify options for email and phone', () => {
        render(<VerificationScreen />);
        expect(screen.getByText('E-Mail verifizieren')).toBeTruthy();
        expect(screen.getByText('Telefonnummer verifizieren')).toBeTruthy();
    });

    it('bypasses API and verifies locally when code is 000000 (Email)', async () => {
        render(<VerificationScreen />);

        // Find inputs. There are two inputs per card: readonly value and code input.
        // We need to target the code input for email.
        // The screen renders email card first.
        // Placeholders are "Code".
        const codeInputs = screen.getAllByPlaceholderText('Code');
        const emailCodeInput = codeInputs[0];

        // Type 000000
        fireEvent.changeText(emailCodeInput, '000000');

        // Find verify button
        // "E-Mail bestätigen"
        const verifyBtn = screen.getByText('E-Mail bestätigen');
        fireEvent.press(verifyBtn);

        await waitFor(() => {
            // Check that setUser was called with emailVerified: true
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                emailVerified: true
            }));
            // Check that API was NOT called
            expect(http.post).not.toHaveBeenCalled();
            // Check success alert
            expect(Alert.alert).toHaveBeenCalledWith('Erfolg', expect.stringContaining('Dev Bypass'));
        });
    });

    it('calls API correctly for normal code (Phone)', async () => {
        // We test phone verification this time
        render(<VerificationScreen />);

        const codeInputs = screen.getAllByPlaceholderText('Code');
        const phoneCodeInput = codeInputs[1]; // Second one is phone in this mock setup (needsPhone=true)

        fireEvent.changeText(phoneCodeInput, '123456');

        const verifyBtn = screen.getByText('Telefon bestätigen');

        (http.post as jest.Mock).mockResolvedValue({ data: { success: true } });

        fireEvent.press(verifyBtn);

        await waitFor(() => {
            expect(http.post).toHaveBeenCalledWith('/auth/verify-phone', {
                phone: '1234567890',
                code: '123456'
            });
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                phoneVerified: true
            }));
        });
    });
});
