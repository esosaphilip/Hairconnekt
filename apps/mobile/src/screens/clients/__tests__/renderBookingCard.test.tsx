
import React from 'react';
import { render } from '@testing-library/react-native';
import { renderBookingCard } from '../renderBookingCard';
import { IBooking } from '@/domain/models/booking';

// Robust Mocks
jest.mock('@/components/Card', () => {
    const { View } = require('react-native');
    const MockCard = (props: any) => <View {...props} />;
    return {
        __esModule: true,
        default: MockCard,
    };
});

jest.mock('@/components/badge', () => {
    const { Text } = require('react-native');
    const MockBadge = ({ label }: { label: string }) => <Text>{label}</Text>;
    return {
        __esModule: true,
        default: MockBadge,
    };
});

jest.mock('@/components/avatar', () => {
    return {
        __esModule: true,
        default: 'Avatar',
        AvatarImage: 'AvatarImage',
        AvatarFallback: 'AvatarFallback',
    };
});

jest.mock('@/components/Icon', () => {
    return {
        __esModule: true,
        default: 'Icon',
    };
});

describe('renderBookingCard', () => {
    it('renders "Ausstehend" badge for pending status', () => {
        const mockBooking: IBooking = {
            id: '1',
            providerId: 'p1',
            providerName: 'Test Provider',
            serviceName: 'Cornrows',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            status: 'pending',
            price: '€50',
            date: 'Fri, 1 Nov',
            time: '10:00',
            isReviewed: false,
            rawDate: new Date().toISOString()
        };

        const navigate = jest.fn();
        const { getByText } = render(renderBookingCard(mockBooking, navigate));

        expect(getByText('Ausstehend')).toBeTruthy();
    });

    it('renders "Bestätigt" badge for confirmed status', () => {
        const mockBooking: IBooking = {
            id: '2',
            providerId: 'p1',
            providerName: 'Test Provider',
            serviceName: 'Cornrows',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            status: 'confirmed',
            price: '€50',
            date: 'Fri, 1 Nov',
            time: '10:00',
            isReviewed: false,
            rawDate: new Date().toISOString()
        };

        const navigate = jest.fn();
        const { getByText } = render(renderBookingCard(mockBooking, navigate));

        expect(getByText('Bestätigt')).toBeTruthy();
    });
});
