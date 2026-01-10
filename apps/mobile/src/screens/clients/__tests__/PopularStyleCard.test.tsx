import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PopularStyleCard } from '../components/PopularStyleCard';
import { rootNavigationRef } from '@/navigation/rootNavigation';

// Mock the root navigation ref
jest.mock('@/navigation/rootNavigation', () => ({
    rootNavigationRef: {
        current: {
            navigate: jest.fn(),
        },
    },
}));

describe('PopularStyleCard', () => {
    const mockItem = {
        id: '1',
        name: 'Goddess Braids',
        slug: 'goddess-braids',
        iconUrl: 'https://example.com/image.jpg',
        price: 4500, // €45.00
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with price', () => {
        const { getByText } = render(<PopularStyleCard item={mockItem} />);

        expect(getByText('Goddess Braids')).toBeTruthy();
        expect(getByText('ab €45.00')).toBeTruthy();
    });

    it('renders correctly without price (fallback)', () => {
        const itemWithoutPrice = { ...mockItem, price: undefined };
        const { getByText } = render(<PopularStyleCard item={itemWithoutPrice} />);

        expect(getByText('Goddess Braids')).toBeTruthy();
        expect(getByText('Jetzt entdecken')).toBeTruthy();
    });

    it('navigates to Search with service name when price exists', () => {
        const { getByText } = render(<PopularStyleCard item={mockItem} />);

        fireEvent.press(getByText('Goddess Braids'));

        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Search',
            params: {
                initialTerm: 'Goddess Braids',
                initialFilter: undefined,
            },
        });
    });

    it('navigates to Search with category filter when price is missing', () => {
        const itemWithoutPrice = { ...mockItem, price: undefined };
        const { getByText } = render(<PopularStyleCard item={itemWithoutPrice} />);

        fireEvent.press(getByText('Goddess Braids'));

        expect(rootNavigationRef.current?.navigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Search',
            params: {
                initialTerm: undefined,
                initialFilter: 'cat:goddess-braids',
            },
        });
    });
});
