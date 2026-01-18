import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBookingFlow } from './useBookingFlow';
import { clientBookingApi } from '@/api/clientBooking';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@/api/clientBooking');
jest.mock('@/api/clientBraider', () => ({
  clientBraiderApi: {
    getProfile: jest.fn().mockResolvedValue({
      id: 'provider-123',
      services: [{ items: [{ id: 's1', price: '€50', duration: '60 min' }] }]
    })
  }
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));
jest.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ tokens: { accessToken: 'token' } }),
}));

describe('useBookingFlow - Booking Error Handling', () => {
  it('should show detailed error message when booking fails', async () => {
    // Setup mocks
    const alertSpy = jest.spyOn(Alert, 'alert');
    const mockError = {
      response: {
        data: {
          message: 'Slot already taken'
        }
      }
    };
    (clientBookingApi.createAppointment as jest.Mock).mockRejectedValue(mockError);

    // Initialize hook
    const { result } = renderHook(() => useBookingFlow('provider-123'));
    
    // Wait for provider load
    await waitFor(() => expect(result.current.loadingProvider).toBe(false));

    // Advance to details step
    act(() => {
      result.current.setSelectedServices(['s1']);
      result.current.setStep('datetime');
    });
    
    act(() => {
      result.current.setSelectedDate(new Date());
      result.current.setSelectedTime('10:00');
      result.current.setStep('details');
    });

    // Trigger booking
    await act(async () => {
      await result.current.handleNext();
    });

    // Verify Alert
    expect(alertSpy).toHaveBeenCalledWith(
      "Fehler",
      "Buchung fehlgeschlagen: Slot already taken"
    );
  });
});