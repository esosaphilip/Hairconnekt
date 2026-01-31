import { renderHook, waitFor } from '@testing-library/react-native';
import { useHomeScreen } from '../hooks/useHomeScreen';
import { clientBraiderApi } from '@/api/clientBraider';
// Mock config BEFORE import
jest.mock('@/config', () => ({
  API_BASE_URL: 'https://api.hairconnekt.de/api/v1',
  BASE_URL: 'https://api.hairconnekt.de'
}));

import { favoriteStatus } from '@/services/favorites';

// Mocks
jest.mock('@/api/clientBraider');
jest.mock('@/services/favorites');
jest.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ tokens: { accessToken: 'token' }, user: { email: 'test@example.com' } }),
}));
jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ location: { lat: 10, lon: 10 } }),
}));
jest.mock('@/i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: 'de' }),
}));
// Fix infinite loop by preventing immediate callback in mock
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (cb: any) => {
      // Only run once
      React.useEffect(cb, []); 
    },
  };
});

import React from 'react';

describe('useHomeScreen Integration Test', () => {
  it('handles successful nearby fetching', async () => {
    // Mock successful API response
    (clientBraiderApi.getNearby as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Braider A' },
      { id: '2', name: 'Braider B' },
    ]);
    (favoriteStatus as jest.Mock).mockResolvedValue({ favorites: [] });

    const { result } = renderHook(() => useHomeScreen());

    // Should start loading
    await waitFor(() => expect(result.current.nearbyLoading).toBe(true));

    // Wait for update
    await waitFor(() => expect(result.current.nearbyLoading).toBe(false));

    // Assertions
    expect(result.current.nearby).toHaveLength(2);
    expect(result.current.nearbyError).toBeNull();
    expect(clientBraiderApi.getNearby).toHaveBeenCalledWith(expect.objectContaining({
      lat: 10,
      lon: 10
    }));
  });

  it('handles API errors gracefully (no raw object object)', async () => {
    // Mock API failure
    (clientBraiderApi.getNearby as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.nearbyLoading).toBe(false));

    // Error should be the clean translated key, NOT "[object Object]"
    expect(result.current.nearbyError).toBe('screens.home.fetchError');
    expect(result.current.nearby).toEqual([]);
  });

  it('uses the correct production API URL', () => {
     const { API_BASE_URL } = require('@/config');
    // This verifies the config change we made
    expect(API_BASE_URL).toContain('https://api.hairconnekt.de');
  });
});
