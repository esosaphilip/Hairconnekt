import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { AllStylesScreen } from '../AllStylesScreen';
import { clientBraiderApi } from '../../../api/clientBraider';

// Mock the API
jest.mock('../../../api/clientBraider', () => ({
    clientBraiderApi: {
        getCategories: jest.fn(),
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
    const mockCategories = [
        { id: '1', name: 'Box Braids', slug: 'box-braids' },
        { id: '2', name: 'Cornrows', slug: 'cornrows' },
        { id: '3', name: 'Weave', slug: 'weave' }, // Should be filtered out for Braids
        { id: '4', name: 'Silk Press', slug: 'silk-press' }, // Natural
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (clientBraiderApi.getCategories as jest.Mock).mockResolvedValue(mockCategories);
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
        expect(await findByText('Cornrows')).toBeTruthy();

        // Should NOT show Weave (Extensions) or Silk Press (Natural)
        expect(queryByText('Weave')).toBeNull();
        expect(queryByText('Silk Press')).toBeNull();
    });

    it('updates filter when clicking a filter pill', async () => {
        (useRoute as jest.Mock).mockReturnValue({ params: {} }); // Start with All

        const { findByText, getByText, queryByText } = render(<AllStylesScreen />);

        expect(await findByText('Weave')).toBeTruthy();

        // Click "Braids" pill
        const braidsPill = getByText('Braids');
        fireEvent.press(braidsPill);

        // Wait for Weave to disappear (waitFor is needed for disappearance/updates sometimes, but findByText works for appearing)
        // For disappearance queryByText is needed inside waitFor, or check if new items appear.
        // Let's invoke the transition

        expect(await findByText('Box Braids')).toBeTruthy();
        expect(queryByText('Weave')).toBeNull();
    });

    it('navigates to Search with correct params when style is clicked', async () => {
        (useRoute as jest.Mock).mockReturnValue({ params: { category: 'Braids' } });
        const { findByText } = render(<AllStylesScreen />);

        const item = await findByText('Box Braids');
        fireEvent.press(item);

        expect(mockNavigate).toHaveBeenCalledWith('Search', { initialFilter: 'cat:box-braids' });
    });
});
