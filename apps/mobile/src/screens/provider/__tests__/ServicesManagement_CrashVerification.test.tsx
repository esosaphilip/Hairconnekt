import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddEditServiceScreen } from '../AddEditServiceScreen';
import { clientBraiderApi } from '@/api/clientBraider';

// Mock API
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getCategories: jest.fn(),
    },
}));

jest.mock('@/api/http', () => ({
    http: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
    },
}));

jest.mock('@/services/providers', () => ({
    providersApi: {
        uploadServiceImage: jest.fn(),
    },
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        canGoBack: jest.fn(),
    }),
    useRoute: () => ({
        params: { serviceId: undefined },
    }),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// Mock UI Components
jest.mock('@/components/Button', () => {
    const { Text, TouchableOpacity } = require('react-native');
    return ({ title, onPress, disabled, style }: any) => (
        <TouchableOpacity onPress={onPress} disabled={disabled} testID={`btn-${title}`} style={style}>
            <Text>{title}</Text>
        </TouchableOpacity>
    );
});

jest.mock('@/components/Card', () => {
    const { View } = require('react-native');
    return ({ children, style }: any) => <View style={style}>{children}</View>;
});

jest.mock('@/components/Input', () => {
    const { TextInput } = require('react-native');
    return (props: any) => <TextInput {...props} testID="input-component" />;
});
jest.mock('@/components/textarea', () => ({
    Textarea: (props: any) => {
        const { TextInput } = require('react-native');
        return <TextInput {...props} testID="textarea-component" />;
    }
}));

// Mock Picker to be interactive for tests
jest.mock('@/components/Picker', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return ({ selectedValue, onValueChange, items }: any) => (
        <View testID="picker-container">
            <Text testID="picker-selected">{items.find((i: any) => i.value === selectedValue)?.label || 'Select'}</Text>
            {items.map((item: any) => (
                <TouchableOpacity
                    key={item.value}
                    onPress={() => onValueChange(item.value)}
                    testID={`picker-item-${item.value}`}
                >
                    <Text>{item.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
});

jest.mock('@/components/slider', () => ({ Slider: () => null }));

describe('AddEditServiceScreen Crash Verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing and handles category selection with tags', async () => {
        // 1. Mock Categories with Tags
        (clientBraiderApi.getCategories as jest.Mock).mockResolvedValue([
            { id: 'cat_braids', name: 'Braids', slug: 'braids', tags: ['Box Braids', 'Cornrows'] }
        ]);

        const { getByText, getByTestId, queryByText } = render(<AddEditServiceScreen />);

        // 2. Wait for Categories to load
        await waitFor(() => {
            expect(queryByText('Lade Kategorien…')).toBeNull();
        });

        // 3. Select a category
        const categoryItem = getByTestId('picker-item-cat_braids');
        fireEvent.press(categoryItem);

        // 4. Verify tags are rendered (checking if the map function worked without crashing)
        // Expect 'Cornrows' because logic uses local HAIR_CATEGORIES for hydration if match found
        await waitFor(() => {
            expect(getByText('Cornrows')).toBeTruthy();
        });
    });

    it('handles category selection where tags is null/undefined safely', async () => {
        // 1. Mock Categories with null/undefined tags
        (clientBraiderApi.getCategories as jest.Mock).mockResolvedValue([
            { id: 'cat_simple', name: 'Simple Cut', slug: 'simple', tags: undefined }
        ]);

        const { getByTestId, queryByText } = render(<AddEditServiceScreen />);

        // 2. Wait for load
        await waitFor(() => {
            expect(queryByText('Lade Kategorien…')).toBeNull();
        });

        // 3. Select the category
        const categoryItem = getByTestId('picker-item-cat_simple');
        fireEvent.press(categoryItem);

        // 4. Verify NO crash and "Spezialisierungen" section is NOT shown
        await waitFor(() => {
            expect(queryByText('Spezialisierungen (Optional)')).toBeNull();
        });
    });
});
