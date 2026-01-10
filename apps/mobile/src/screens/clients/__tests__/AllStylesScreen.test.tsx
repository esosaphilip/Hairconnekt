import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { AllStylesScreen } from '../AllStylesScreen';
import { clientBraiderApi } from '../../../api/clientBraider';

// Mock the API
jest.mock('../../../api/clientBraider', () => ({
    clientBraiderApi: {
        searchServices: jest.fn(),
    },
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: jest.fn(),
    }),
    useRoute: jest.fn(),
}));

// Import useRoute to mock return value per test
import { useRoute } from '@react-navigation/native';

describe('AllStylesScreen', () => {
    const mockServices = [
        {
            id: '1',
            name: 'Box Braids',
            categorySlug: 'box-braids',
            price: 4500,
            duration: 180,
            provider: { id: 'p1', name: 'Jane' }
        },
        {
            id: '2',
            name: 'Cornrows',
            categorySlug: 'cornrows',
            price: 3500,
            duration: 120,
            provider: { id: 'p1', name: 'Jane' }
        },
        {
            id: '3',
            name: 'Weave',
            categorySlug: 'weave',
            price: 5000,
            duration: 240,
            provider: { id: 'p2', name: 'Mary' }
        },
        {
            id: '4',
            name: 'Silk Press',
            categorySlug: 'silk-press',
            price: 4000,
            duration: 90,
            provider: { id: 'p3', name: 'Liz' }
        },
        {
            id: '5',
            name: 'Senegalese Twists',
            categorySlug: 'senegalese-twists',
            price: 5500,
            duration: 200,
            provider: { id: 'p4', name: 'Anna' }
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (clientBraiderApi.searchServices as jest.Mock).mockResolvedValue(mockServices);
    });

    it('renders all styles by default', async () => {
        (useRoute as jest.Mock).mockReturnValue({ params: {} });

        const { findByText } = render(<AllStylesScreen />);

        // findByText waits for element to appear
        expect(await findByText('Box Braids')).toBeTruthy();
        expect(await findByText('Weave')).toBeTruthy();
    });

    it('filters correctly when "Braids" category is passed via route', async () => {
        (useRoute as jest.Mock).mockReturnValue({ params: { category: 'Braids' } });

        const { findByText, queryByText } = render(<AllStylesScreen />);

        // Should show Braids
        expect(await findByText('Box Braids')).toBeTruthy();

        // Should NOT show Weave (Extensions) or Silk Press (Natural)
        expect(queryByText('Weave')).toBeNull();
    });

    it('updates filter when clicking a filter pill', async () => {
        (useRoute as jest.Mock).mockReturnValue({ params: {} }); // Start with All

        const { findByText, getByText, queryByText, getAllByText } = render(<AllStylesScreen />);

        expect(await findByText('Weave')).toBeTruthy();

        // Click "Braids" pill. Note: Braids might appear in card badges too.
        const braidsElements = await getAllByText('Braids');
        // Assuming the pill is rendered first (in header) or we can iterate to find the one that is the button
        const braidsPill = braidsElements[0];
        fireEvent.press(braidsPill);

        // Wait for filtering
        await waitFor(() => {
            expect(queryByText('Weave')).toBeNull();
        }, { timeout: 2000 });

        expect(getByText('Box Braids')).toBeTruthy();
    });

    it('filters correctly when clicking "Twists" pill', async () => {
        (useRoute as jest.Mock).mockReturnValue({ params: {} });

        const { findByText, queryByText, getAllByText } = render(<AllStylesScreen />);

        expect(await findByText('Box Braids')).toBeTruthy();

        // Click "Twists" pill
        const elements = await getAllByText('Twists');
        const twistsPill = elements[0];
        fireEvent.press(twistsPill);

        // Wait for filtering: Box Braids should disappear, Senegalese Twists should remain
        await waitFor(() => {
            expect(queryByText('Box Braids')).toBeNull();
        }, { timeout: 2000 });

        expect(await findByText('Senegalese Twists')).toBeTruthy();
    });

    it('navigates to ProviderProfile with correct params when style is clicked', async () => {
        (useRoute as jest.Mock).mockReturnValue({ params: { category: 'Braids' } });
        const { findByText } = render(<AllStylesScreen />);

        const item = await findByText('Box Braids');
        fireEvent.press(item);

        expect(mockNavigate).toHaveBeenCalledWith('ProviderDetail', { id: 'p1' });
    });
});
