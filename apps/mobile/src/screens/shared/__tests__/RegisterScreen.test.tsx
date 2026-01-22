
import React from 'react';
import { render } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
    return {
        NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
        useNavigation: () => ({
            navigate: jest.fn(),
        }),
        useRoute: () => ({
            params: {}
        }),
    };
});

// Simple mocks for custom components
jest.mock('../../../components/Icon', () => ({ __esModule: true, default: 'Icon' }));
jest.mock('../../../components/Input', () => ({ __esModule: true, default: 'Input' }));

// Button mock that wraps children in Text for getByText
jest.mock('../../../components/Button', () => {
    const { View, Text } = require('react-native');
    const MockButton = ({ title, children, ...props }: any) => (
        <View {...props}>
            {title && <Text>{title}</Text>}
            <Text>{children}</Text>
        </View>
    );
    return {
        __esModule: true,
        default: MockButton,
    };
});

jest.mock('../../../components/Card', () => ({ __esModule: true, default: 'Card' }));
jest.mock('../../../components/checkbox', () => ({ Checkbox: 'Checkbox' }));
jest.mock('../../../components/Text', () => ({ __esModule: true, default: 'Text' }));

// Mock AuthContext
jest.mock('../../../auth/AuthContext', () => ({
    useAuth: () => ({
        register: jest.fn(),
        loading: false,
        error: null,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('RegisterScreen', () => {
    it('renders correctly', () => {
        const { getByText } = render(
            <NavigationContainer>
                <RegisterScreen />
            </NavigationContainer>
        );

        expect(getByText('HairConnekt')).toBeTruthy();
        expect(getByText('Willkommen bei HairConnekt')).toBeTruthy();
        expect(getByText('Erstelle dein Konto')).toBeTruthy();
        expect(getByText('+49')).toBeTruthy();
        expect(getByText('Mit Apple fortfahren')).toBeTruthy();
    });
});
