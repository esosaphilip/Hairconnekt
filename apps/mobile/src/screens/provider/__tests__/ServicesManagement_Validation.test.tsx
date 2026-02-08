import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ServicesManagementScreen } from '../ServicesManagementScreen';
import { Alert, Switch } from 'react-native';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
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

const validId = '123e4567-e89b-12d3-a456-426614174000';
const invalidId = 'bad-id';

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

// Mock Button
jest.mock('@/components/Button', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return ({ title, onPress, testID }: any) => (
    <TouchableOpacity onPress={onPress} testID={testID}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/Card', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: any) => <View>{children}</View>;
});

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('ServicesManagementScreen Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to create new service screen on "Neu" button press', () => {
    const { getByTestId } = render(<ServicesManagementScreen />);
    fireEvent.press(getByTestId('btn-new-service'));
    
    expect(mockNavigate).toHaveBeenCalledWith('AddEditServiceScreen', {
      serviceId: null
    });
  });

  describe('Editing Service', () => {
    it('allows editing service with valid UUID', () => {
      const { getByTestId } = render(<ServicesManagementScreen />);
      fireEvent.press(getByTestId(`edit-${validId}`));

      expect(mockNavigate).toHaveBeenCalledWith('AddEditServiceScreen', {
        serviceId: validId
      });
    });

    it('blocks editing service with invalid UUID', () => {
      const { getByTestId } = render(<ServicesManagementScreen />);
      fireEvent.press(getByTestId(`edit-${invalidId}`));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Ungültige Service-ID',
        expect.stringContaining('Dieser Service hat eine ungültige ID')
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Toggling Service Active State', () => {
    it('toggles service with valid UUID', async () => {
      const { getByTestId } = render(<ServicesManagementScreen />);
      const switchEl = getByTestId(`switch-${validId}`);
      
      await act(async () => {
        fireEvent(switchEl, 'valueChange', false);
      });

      expect(mockToggle).toHaveBeenCalledWith(validId, false);
    });

    it('blocks toggling service with invalid UUID', async () => {
      const { getByTestId } = render(<ServicesManagementScreen />);
      const switchEl = getByTestId(`switch-${invalidId}`);
      
      await act(async () => {
        fireEvent(switchEl, 'valueChange', false);
      });

      expect(mockToggle).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Ungültige Service-ID',
        expect.stringContaining('Dieser Service hat eine ungültige ID')
      );
    });
  });

  describe('Deleting Service', () => {
    it('shows confirmation and deletes service with valid UUID', async () => {
      const { getByTestId } = render(<ServicesManagementScreen />);
      fireEvent.press(getByTestId(`delete-${validId}`));

      // Check for confirmation alert
      expect(Alert.alert).toHaveBeenCalledWith(
        'Service löschen',
        expect.stringContaining('Möchtest du "Valid Service" wirklich löschen?'),
        expect.any(Array)
      );

      // Simulate clicking "Löschen" (destructive button)
      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const deleteButton = alertButtons.find((btn: any) => btn.style === 'destructive');
      
      await act(async () => {
        await deleteButton.onPress();
      });

      expect(mockDelete).toHaveBeenCalledWith(validId);
    });

    it('blocks deleting service with invalid UUID', () => {
      const { getByTestId } = render(<ServicesManagementScreen />);
      fireEvent.press(getByTestId(`delete-${invalidId}`));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Ungültige Service-ID',
        expect.stringContaining('Dieser Service hat eine ungültige ID')
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
