import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ServicesManagementScreen } from '../ServicesManagementScreen';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@/navigation/rootNavigation', () => ({
  rootNavigationRef: {
    current: {
      navigate: jest.fn(),
    },
  },
}));

// Mock useServices hook
const mockToggle = jest.fn();
const mockDelete = jest.fn();
const mockLoad = jest.fn();

jest.mock('@/presentation/hooks/useServices', () => ({
  useServices: () => ({
    services: [
      { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Valid Service', isActive: true, priceCents: 1000 },
      { id: 'bad-id', name: 'Invalid Service', isActive: true, priceCents: 2000 },
    ],
    loading: false,
    error: null,
    toggleServiceActive: mockToggle,
    deleteService: mockDelete,
    createService: jest.fn(),
    loadServices: mockLoad,
  }),
}));

jest.mock('@/api/clientBraider', () => ({
  clientBraiderApi: {
    getCategories: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
// Mock Button to render title as text so queries work
jest.mock('@/components/Button', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return ({ title, onPress }: any) => (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});
jest.mock('@/components/Card', () => 'Card');

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('ServicesManagementScreen Validation', () => {
  it('allows editing service with valid UUID', () => {
    const { getAllByText } = render(<ServicesManagementScreen />);
    
    // Find "Bearbeiten" buttons. Since we have 2 services, there are 2 buttons.
    // However, since we mocked Button as string 'Button', we might need to find by text prop or testID.
    // In the code: <Button title="Bearbeiten" ... />
    // If 'Button' is a string mock, checking props is harder.
    // Let's rely on finding the text "Bearbeiten".
    const editButtons = getAllByText('Bearbeiten');
    expect(editButtons.length).toBe(2);

    // Click the first one (Valid)
    fireEvent.press(editButtons[0]);

    // Check navigation
    const { rootNavigationRef } = require('@/navigation/rootNavigation');
    expect(rootNavigationRef.current.navigate).toHaveBeenCalledWith('Mehr', {
      screen: 'AddEditServiceScreen',
      params: { serviceId: '123e4567-e89b-12d3-a456-426614174000' },
    });
  });

  it('blocks editing service with invalid UUID', () => {
    const { getAllByText } = render(<ServicesManagementScreen />);
    const editButtons = getAllByText('Bearbeiten');
    
    // Click the second one (Invalid)
    fireEvent.press(editButtons[1]);

    // Should NOT navigate
    // Should show Alert
    expect(Alert.alert).toHaveBeenCalledWith(
      'Ungültige Service-ID',
      expect.stringContaining('Dieser Service hat eine ungültige ID')
    );
  });
});
