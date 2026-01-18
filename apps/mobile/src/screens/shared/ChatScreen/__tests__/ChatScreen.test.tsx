import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatScreen } from '../ChatScreen';
import { chatApi } from '../../../../api/chat';
import { Alert } from 'react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        params: { conversationId: '123' }
    }),
}));

// Mock chatApi
jest.mock('../../../../api/chat', () => ({
    chatApi: {
        getMessages: jest.fn(),
        sendMessage: jest.fn(),
        startConversation: jest.fn(),
        getConversations: jest.fn(),
    },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ChatScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads messages on mount', async () => {
        (chatApi.getMessages as jest.Mock).mockResolvedValue([
            { id: '1', text: 'Hello', sender: 'other', timestamp: new Date().toISOString() }
        ]);
        (chatApi.getConversations as jest.Mock).mockResolvedValue([
            { id: '123', otherUser: { id: 'u1', name: 'Test User' } }
        ]);

        const { getByText } = render(<ChatScreen />);

        await waitFor(() => {
            expect(chatApi.getMessages).toHaveBeenCalledWith('123');
        });

        expect(getByText('Hello')).toBeTruthy();
    });

    it('sends a message', async () => {
        (chatApi.getMessages as jest.Mock).mockResolvedValue([]);
        (chatApi.getConversations as jest.Mock).mockResolvedValue([]);
        (chatApi.sendMessage as jest.Mock).mockResolvedValue({});

        const { getByPlaceholderText, getByTestId } = render(<ChatScreen />);

        // Find input using placeholder - might need adjustment if using specific testID
        const input = getByPlaceholderText('Nachricht schreiben...');
        fireEvent.changeText(input, 'New Message');
        fireEvent(input, 'submitEditing'); // Simulates return key or use a send button if testID available

        // Wait for send to be called
        await waitFor(() => {
            expect(chatApi.sendMessage).toHaveBeenCalledWith('123', 'New Message');
        });
    });
});
