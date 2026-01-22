import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { AppointmentRequestScreen } from '../AppointmentRequestScreen';
import { providerAppointmentsApi } from '@/api/providerAppointments';
import { NavigationContainer } from '@react-navigation/native';

// Mock the API
jest.mock('@/api/providerAppointments', () => ({
  providerAppointmentsApi: {
    providerView: jest.fn(),
    accept: jest.fn(),
    decline: jest.fn(),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: { id: 'req-123' },
    }),
  };
});

// Mock UI components that might cause issues
jest.mock('@/components/avatar', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: any) => <View testID="avatar">{children}</View>,
    AvatarImage: ({ source }: any) => <View testID="avatar-image" source={source} />,
    AvatarFallback: () => <View />,
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('AppointmentRequestScreen', () => {
  const mockRequest = {
    id: 'req-123',
    client: {
      id: 'c-1',
      name: 'Sarah Connor',
      avatar: 'https://r2.dev/sarah.jpg',
      totalBookings: 5,
      joinedDate: '2024-01-01',
      phone: '1234567890',
    },
    service: {
      name: 'Haircut',
      duration: '1 Std.',
      price: '€50',
    },
    requestedDate: '2025-01-01',
    requestedTime: '10:00',
    requestedAt: 'Vor 2 Stunden',
    status: 'pending',
    notes: 'Please be on time',
    alternativeDates: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (providerAppointmentsApi.providerView as jest.Mock).mockResolvedValue(mockRequest);
  });

  it('renders correctly with loaded data', async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <AppointmentRequestScreen />
      </NavigationContainer>
    );

    // Initial loading state
    expect(getByText('Anfrage wird geladen...')).toBeTruthy();

    // Wait for data
    await waitFor(() => {
      expect(getByText('Sarah Connor')).toBeTruthy();
      expect(getByText('5 Buchungen • Mitglied seit 2024-01-01')).toBeTruthy();
      expect(getByText('Haircut')).toBeTruthy();
      expect(getByText('€50')).toBeTruthy();
      expect(getByText('Please be on time')).toBeTruthy();
    });
  });

  it('handles accept action', async () => {
    (providerAppointmentsApi.accept as jest.Mock).mockResolvedValue({ message: 'Confirmed' });

    const { getByText } = render(
      <NavigationContainer>
        <AppointmentRequestScreen />
      </NavigationContainer>
    );

    await waitFor(() => expect(getByText('Anfrage annehmen')).toBeTruthy());

    fireEvent.press(getByText('Anfrage annehmen'));

    // Should show confirmation dialog
    await waitFor(() => expect(getByText('Anfrage annehmen?')).toBeTruthy());

    // Press confirm in dialog
    fireEvent.press(getByText('Bestätigen'));

    await waitFor(() => {
      expect(providerAppointmentsApi.accept).toHaveBeenCalledWith('req-123');
    });
  });
});
