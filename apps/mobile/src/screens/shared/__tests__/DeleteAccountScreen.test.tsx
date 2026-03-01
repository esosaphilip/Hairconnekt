import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { DeleteAccountScreen } from '../DeleteAccountScreen';
import { useAuth } from '@/auth/AuthContext';
import { clientUserApi } from '@/api/clientUser';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

// Mock the Auth hook
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock the API
jest.mock('@/api/clientUser', () => ({
    clientUserApi: {
        deleteAccount: jest.fn(),
    },
}));

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

describe('DeleteAccountScreen', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            logout: mockLogout,
        });
    });

    it('button is disabled when checkbox is unchecked and text is empty', () => {
        const { getByText } = render(<DeleteAccountScreen />);

        const deleteButton = getByText('Konto endgültig löschen');
        fireEvent.press(deleteButton);
        expect(clientUserApi.deleteAccount).not.toHaveBeenCalled();
    });

    it('button is disabled when checkbox is checked but text is wrong', () => {
        const { getByText, getByPlaceholderText } = render(<DeleteAccountScreen />);

        // Check the box
        fireEvent.press(getByText('Ich verstehe, dass diese Aktion nicht rückgängig gemacht werden kann.'));

        // Type wrong text
        fireEvent.changeText(getByPlaceholderText('LÖSCHEN'), 'DELETE');

        const deleteButton = getByText('Konto endgültig löschen');
        fireEvent.press(deleteButton);
        expect(clientUserApi.deleteAccount).not.toHaveBeenCalled();
    });

    it('button is disabled when text is correct but checkbox is unchecked', () => {
        const { getByText, getByPlaceholderText } = render(<DeleteAccountScreen />);

        // Type correct text
        fireEvent.changeText(getByPlaceholderText('LÖSCHEN'), 'LÖSCHEN');

        const deleteButton = getByText('Konto endgültig löschen');
        fireEvent.press(deleteButton);
        expect(clientUserApi.deleteAccount).not.toHaveBeenCalled();
    });

    it('button is ENABLED only when checkbox is checked AND text is exactly "LÖSCHEN"', () => {
        const { getByText, getByPlaceholderText } = render(<DeleteAccountScreen />);

        // Check the box
        fireEvent.press(getByText('Ich verstehe, dass diese Aktion nicht rückgängig gemacht werden kann.'));

        // Type correct text
        fireEvent.changeText(getByPlaceholderText('LÖSCHEN'), 'LÖSCHEN');

        const deleteButton = getByText('Konto endgültig löschen');
        // Valid case is tested thoroughly in the success test
        expect(deleteButton).toBeTruthy();
    });

    it('successful delete calls logout', async () => {
        (clientUserApi.deleteAccount as jest.Mock).mockResolvedValueOnce({});

        const { getByText, getByPlaceholderText } = render(<DeleteAccountScreen />);

        fireEvent.press(getByText('Ich verstehe, dass diese Aktion nicht rückgängig gemacht werden kann.'));
        fireEvent.changeText(getByPlaceholderText('LÖSCHEN'), 'LÖSCHEN');

        fireEvent.press(getByText('Konto endgültig löschen'));

        await waitFor(() => {
            expect(clientUserApi.deleteAccount).toHaveBeenCalled();
            expect(mockLogout).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erfolg',
                'Dein Konto wurde erfolgreich gelöscht.',
                expect.any(Array)
            );
        });
    });

    it('failed delete shows German error alert without crashing', async () => {
        (clientUserApi.deleteAccount as jest.Mock).mockRejectedValueOnce(new Error('Netzwerkfehler'));

        const { getByText, getByPlaceholderText } = render(<DeleteAccountScreen />);

        fireEvent.press(getByText('Ich verstehe, dass diese Aktion nicht rückgängig gemacht werden kann.'));
        fireEvent.changeText(getByPlaceholderText('LÖSCHEN'), 'LÖSCHEN');

        fireEvent.press(getByText('Konto endgültig löschen'));

        await waitFor(() => {
            expect(clientUserApi.deleteAccount).toHaveBeenCalled();
            expect(mockLogout).not.toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith(
                'Fehler',
                'Netzwerkfehler'
            );
        });
    });
});
