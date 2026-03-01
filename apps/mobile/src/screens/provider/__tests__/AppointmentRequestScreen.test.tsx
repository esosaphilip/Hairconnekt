import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AppointmentRequestScreen } from '../AppointmentRequestScreen';
import { providerAppointmentsApi } from '@/api/providerAppointments';
import { Alert } from 'react-native';

// Mock Dependencies
jest.mock('@/api/providerAppointments', () => ({
  providerAppointmentsApi: {
    providerView: jest.fn(),
    accept: jest.fn(),
    decline: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => { });

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

describe('AppointmentRequestScreen', () => {
  const mockRequestData = {
    id: 'req-123',
    requestedAt: 'Vor 2 Stunden',
    requestedDate: '27. Oktober 2025',
    requestedTime: '14:00',
    location: 'Beim Kunden',
    address: 'Musterstraße 1, Berlin',
    notes: 'Bitte pünktlich sein.',
    service: {
      name: 'Box Braids',
      price: '€80',
      duration: '120 Min',
    },
    client: {
      id: 'client-1',
      name: 'Maria Schmidt',
      avatar: 'https://example.com/avatar.jpg',
      phone: '+4912345678',
      totalBookings: 5,
      joinedDate: 'Jan 2024',
    },
    alternativeDates: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (providerAppointmentsApi.providerView as jest.Mock).mockResolvedValue(mockRequestData);
  });

  const renderComponent = () => render(<AppointmentRequestScreen />);

  it('displays pending appointment details correctly (client name, service, date, time)', async () => {
    const { getByText, findByText } = renderComponent();

    // Verify loading state
    expect(getByText('Anfrage wird geladen...')).toBeTruthy();

    // Verify data rendered
    const clientName = await findByText('Maria Schmidt');
    expect(clientName).toBeTruthy();
    expect(getByText('Box Braids')).toBeTruthy();
    expect(getByText('27. Oktober 2025')).toBeTruthy();
    expect(getByText('14:00 (120 Min)')).toBeTruthy();
    // Use `await findByText` for notes because they might render slightly differently if wrapped or in a card
    const notesText = await findByText('Bitte pünktlich sein.');
    expect(notesText).toBeTruthy();
  });

  it('pressing "Anfrage annehmen" triggers accept API and navigates', async () => {
    (providerAppointmentsApi.accept as jest.Mock).mockResolvedValue({ message: 'Success' });

    // We use fake timers since component uses setTimeout for navigation
    jest.useFakeTimers();

    const { getByText, findByText } = renderComponent();
    await findByText('Maria Schmidt');

    // Open Modal
    fireEvent.press(getByText('Anfrage annehmen'));

    // Confirm inside Modal
    await waitFor(() => {
      expect(getByText('Bestätigen')).toBeTruthy();
    });
    fireEvent.press(getByText('Bestätigen'));

    await waitFor(() => {
      expect(providerAppointmentsApi.accept).toHaveBeenCalledWith('req-123');
    });

    // Fast forward setTimeout
    act(() => {
      jest.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ProviderCalendar');

    jest.useRealTimers();
  });

  it('pressing "Ablehnen" triggers decline API correctly', async () => {
    (providerAppointmentsApi.decline as jest.Mock).mockResolvedValue({ message: 'Declined' });

    jest.useFakeTimers();

    const { getByText, getAllByText, findByText } = renderComponent();
    await findByText('Maria Schmidt');

    // The main screen button
    const mainDeclineBtn = getByText('Ablehnen');
    fireEvent.press(mainDeclineBtn);

    // Wait for modal to open and select reason
    await waitFor(() => getByText('Termin nicht verfügbar'));
    fireEvent.press(getByText('Termin nicht verfügbar'));

    // Now there are two "Ablehnen" texts. We press the one in the modal's action row
    const allDecline = getAllByText('Ablehnen');
    fireEvent.press(allDecline[allDecline.length - 1]);

    await waitFor(() => {
      expect(providerAppointmentsApi.decline).toHaveBeenCalledWith('req-123', expect.objectContaining({
        reason: 'Termin nicht verfügbar'
      }));
    });

    // Fast forward navigation
    act(() => {
      jest.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ProviderDashboard');

    jest.useRealTimers();
  });
});
