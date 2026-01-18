import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PasswordResetScreen } from '../PasswordResetScreen';
import { http } from '@/api/http';
import { Alert } from 'react-native';

// Mocks
jest.mock('@/api/http', () => ({
    http: {
        post: jest.fn(),
    },
}));

jest.mock('../../../components/Icon', () => 'Icon');

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
    useRoute: () => ({
        params: {},
    }),
}));

describe('PasswordResetScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
    });

    it('renders request step correctly', () => {
        const { getByText, getByPlaceholderText } = render(<PasswordResetScreen />);

        expect(getByText('Passwort zurücksetzen')).toBeTruthy();
        expect(getByText('Gib deine E-Mail oder Telefonnummer ein um einen Code zu erhalten')).toBeTruthy();
        expect(getByPlaceholderText('max.mueller@email.com')).toBeTruthy();
    });

    it('sends code and moves to verify step on success', async () => {
        (http.post as jest.Mock).mockResolvedValueOnce({});
        const { getByText, getByPlaceholderText } = render(<PasswordResetScreen />);

        const input = getByPlaceholderText('max.mueller@email.com');
        fireEvent.changeText(input, 'test@example.com');

        const sendButton = getByText('Code senden');
        fireEvent.press(sendButton);

        await waitFor(() => {
            expect(http.post).toHaveBeenCalledWith('/auth/forgot-password', { emailOrPhone: 'test@example.com' });
            expect(getByText('6-stelligen Code eingeben')).toBeTruthy(); // Should be in verify step
        });
    });

    it('shows error if sending code fails', async () => {
        (http.post as jest.Mock).mockRejectedValueOnce(new Error('User not found'));
        const { getByText, getByPlaceholderText } = render(<PasswordResetScreen />);

        const input = getByPlaceholderText('max.mueller@email.com');
        fireEvent.changeText(input, 'unknown@example.com');

        const sendButton = getByText('Code senden');
        fireEvent.press(sendButton);

        await waitFor(() => {
            expect(http.post).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Fehler', 'User not found');
        });
    });
});
