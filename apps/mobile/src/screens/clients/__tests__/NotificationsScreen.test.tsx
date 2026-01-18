import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NotificationsScreen } from '../NotificationsScreen';
import { notificationsApi } from '@/api/notifications';

// Mock the API
jest.mock('@/api/notifications', () => ({
    notificationsApi: {
        list: jest.fn(),
        markAllRead: jest.fn(),
        clearAll: jest.fn(),
        markRead: jest.fn(),
    },
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

describe('NotificationsScreen', () => {
    const mockNotifications = [
        {
            id: '1',
            type: 'booking',
            title: 'Booking Confirmed',
            message: 'Your appointment is confirmed.',
            createdAt: new Date().toISOString(),
            isRead: false,
        },
        {
            id: '2',
            type: 'promo',
            title: 'Special Offer',
            message: 'Get 20% off!',
            createdAt: new Date().toISOString(),
            isRead: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (notificationsApi.list as jest.Mock).mockResolvedValue({
            items: mockNotifications,
            unreadCount: 1,
        });
    });

    it('renders notifications list correctly without crashing', async () => {
        const { getByText, findByText } = render(<NotificationsScreen />);

        // Should verify loading state initially if desired, or wait for data
        await waitFor(() => {
            expect(notificationsApi.list).toHaveBeenCalled();
        });

        expect(await findByText('Booking Confirmed')).toBeTruthy();
        expect(await findByText('Special Offer')).toBeTruthy();
    });

    it('filters unread notifications', async () => {
        const { getByText, findByText, queryByText } = render(<NotificationsScreen />);

        await findByText('Booking Confirmed');

        // Click "Ungelesen" tab
        fireEvent.press(getByText(/Ungelesen/));

        expect(await findByText('Booking Confirmed')).toBeTruthy();
        expect(queryByText('Special Offer')).toBeNull();
    });
});
