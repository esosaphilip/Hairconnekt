import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ProviderDashboard } from '../ProviderDashboard';
import * as httpMod from '../../../api/http';
import { rootNavigationRef } from '../../../navigation/rootNavigation';

jest.mock('../../../api/http', () => {
  return {
    http: {
      get: jest.fn(),
    },
  };
});

describe('ProviderDashboard screen', () => {
  beforeEach(() => {
    (rootNavigationRef as any).current = { navigate: jest.fn() };
    (httpMod.http.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/providers/me') {
        return Promise.resolve({ data: { name: 'Aisha' } });
      }
      if (url === '/providers/dashboard') {
        return Promise.resolve({
          data: {
            stats: {
              todayCount: 1,
              nextAppointment: { time: '10:00', client: 'Client Test', hoursUntil: 2 },
              weekEarningsCents: 12345,
              ratingAverage: 4.8,
              reviewCount: 234,
            },
            todayAppointments: [],
            recentReviews: [
              { id: 'r1', client: 'Lisa', rating: 5, date: new Date().toISOString(), text: 'Top', hasResponse: false },
            ],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => jest.resetAllMocks());

  it('navigates to reviews via stat card and quick action', async () => {
    render(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Willkommen zurück/)).toBeTruthy();
    });

    const ratingLabel = screen.getByText('Bewertung');
    fireEvent.press(ratingLabel);
    await waitFor(() => {
      expect((rootNavigationRef as any).current.navigate).toHaveBeenCalledWith('Mehr', { screen: 'ProviderReviewsScreen' });
    });

    const servicesQuickAction = screen.getByText('Dienste bearbeiten');
    fireEvent.press(servicesQuickAction);
    await waitFor(() => {
      expect((rootNavigationRef as any).current.navigate).toHaveBeenCalledWith('Mehr', { screen: 'ProviderServicesScreen' });
    });
  });
});

