
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ProviderRegistrationFlow } from '../ProviderRegistrationFlow';
import { http } from '../../../../api/http';
import { Alert, TextInput } from 'react-native';

// Mock dependencies
jest.mock('../../../../api/http', () => ({
    http: {
        post: jest.fn(),
    },
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
}));

// Mock AuthContext
jest.mock('../../../../auth/AuthContext', () => ({
    useAuth: () => ({
        setSession: jest.fn(),
        user: null,
        tokens: null,
    }),
}));

// Mock the Picker component
jest.mock('../../../../components/Picker', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ({ onValueChange, testID, selectedValue }: any) => (
        <TouchableOpacity 
            testID={testID} 
            onPress={() => onValueChange('NRW')} // Auto-select NRW on press
        >
            <Text>{selectedValue || 'Select State'}</Text>
        </TouchableOpacity>
    );
});

// Mock Checkbox
jest.mock('../../../../components/checkbox', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return {
        Checkbox: ({ checked, onCheckedChange, testID }: any) => (
            <TouchableOpacity 
                testID={testID} 
                onPress={() => onCheckedChange(!checked)}
            >
                <Text>{checked ? '[x]' : '[ ]'}</Text>
            </TouchableOpacity>
        ),
    };
});

// Mock Input component to ensure stability
jest.mock('../../../../components/Input', () => {
    const React = require('react');
    const { TextInput } = require('react-native');
    const MockInput = (props: any) => (
        <TextInput
            {...props}
            onChangeText={(t: string) => {
                if (props.onChangeText) props.onChangeText(t);
            }}
            value={props.value}
        />
    );
    return {
        __esModule: true,
        Input: MockInput,
        default: MockInput,
    };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProviderRegistrationFlow E2E Mock', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default success response
        (http.post as jest.Mock).mockResolvedValue({
            data: {
                user: { id: 'new-provider-id', role: 'PROVIDER' },
                tokens: { accessToken: 'mock-token' },
            },
        });
    });

    it('Complete Registration Flow Success', async () => {
        const { getByTestId, getByText, queryByText } = render(<ProviderRegistrationFlow />);

        // --- STEP 1: Personal Info ---
        fireEvent.changeText(getByTestId('reg-firstname-input'), 'Max');
        fireEvent.changeText(getByTestId('reg-lastname-input'), 'Mustermann');
        fireEvent.changeText(getByTestId('reg-email-input'), 'max.mustermann@test.com');
        fireEvent.changeText(getByTestId('reg-phone-input'), '15112345678');
        fireEvent.changeText(getByTestId('reg-password-input'), 'TestPass123');
        fireEvent.changeText(getByTestId('reg-confirm-password-input'), 'TestPass123');
        
        // Checkboxes (using press for toggle)
        fireEvent.press(getByTestId('reg-terms-checkbox'));
        fireEvent.press(getByTestId('reg-privacy-checkbox'));

        // Click Next
        fireEvent.press(getByTestId('reg-next-button'));

        // --- STEP 2: Business Info ---
        await waitFor(() => expect(getByText('Über dein Business')).toBeTruthy());

        fireEvent.changeText(getByTestId('reg-business-name'), 'Max Studio');
        fireEvent.press(getByTestId('reg-bus-type-INDIVIDUAL'));
        
        fireEvent.changeText(getByTestId('reg-street'), 'Musterstr.');
        fireEvent.changeText(getByTestId('reg-house-number'), '1');
        fireEvent.changeText(getByTestId('reg-zip'), '12345');
        fireEvent.changeText(getByTestId('reg-city'), 'Berlin');
        
        // Select State via mock
        fireEvent.press(getByTestId('reg-state-picker'));

        // Click Next
        fireEvent.press(getByTestId('reg-next-button'));

        // --- STEP 3: Services ---
        await waitFor(() => expect(getByText('Deine Dienstleistungen')).toBeTruthy());

        // Select "Box Braids"
        fireEvent.press(getByTestId('reg-cat-box-braids'));
        // Select Language "Deutsch"
        fireEvent.press(getByTestId('reg-lang-deutsch'));

        // Click Next
        fireEvent.press(getByTestId('reg-next-button'));

        // --- STEP 4: Verification ---
        await waitFor(() => expect(getByText('Verifizierung')).toBeTruthy());

        // Simulate uploads (which mock triggers setFormData immediately in useProviderRegistration hook mock logic)
        // Wait, we need to ensure the hook logic for file upload is triggered.
        // The buttons call handleFileUpload.
        fireEvent.press(getByTestId('reg-upload-id'));
        fireEvent.press(getByTestId('reg-upload-profile'));
        // Portfolio is optional/array, let's upload one
        fireEvent.press(getByTestId('reg-upload-portfolio'));
        // Upload again to meet >= 3 requirement (mock adds 2 at a time)
        fireEvent.press(getByTestId('reg-upload-portfolio'));

        // Click Next
        fireEvent.press(getByTestId('reg-next-button'));

        // --- STEP 5: Summary ---
        await waitFor(() => expect(getByText('Zusammenfassung')).toBeTruthy());

        // Submit
        fireEvent.press(getByTestId('reg-next-button'));

        // Assert API call
        await waitFor(() => {
            expect(http.post).toHaveBeenCalledWith('/providers', expect.objectContaining({
                contact: expect.objectContaining({
                    firstName: 'Max',
                    lastName: 'Mustermann',
                    email: 'max.mustermann@test.com',
                }),
                profile: expect.objectContaining({
                    businessName: 'Max Studio',
                    businessType: 'INDIVIDUAL',
                }),
                address: expect.objectContaining({
                    street: 'Musterstr.',
                    city: 'Berlin',
                    state: 'NRW', // From mock picker
                }),
                services: expect.arrayContaining(['Box Braids']),
            }));
        });
    });
});
