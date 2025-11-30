import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ProviderReviews } from '../ProviderReviews';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as httpMod from '../../../api/http';
import { Alert } from 'react-native';

jest.mock('../../../api/http', () => {
  return {
    http: {
      get: jest.fn(),
      post: jest.fn(),
    },
  };
});

describe('ProviderReviews screen', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  function seedReviews() {
    const reviews = [
      {
        id: 'r1',
        client: { name: 'Sarah Müller', avatarUrl: null },
        rating: 5,
        createdAt: new Date().toISOString(),
        appointment: { services: [{ name: 'Box Braids' }] },
        comment: 'Fantastisch!',
        isAnonymous: false,
        images: [],
        providerResponse: null,
      },
      {
        id: 'r2',
        client: { name: 'Maria König', avatarUrl: null },
        rating: 4,
        createdAt: new Date().toISOString(),
        appointment: { services: [{ name: 'Cornrows' }] },
        comment: 'Sehr gut',
        isAnonymous: false,
        images: [],
        providerResponse: 'Danke!'
      },
    ];
    (httpMod.http.get as jest.Mock).mockResolvedValue({ data: reviews });
  }

  it('loads and displays reviews, toggles filter chips', async () => {
    seedReviews();
    const Stack = createNativeStackNavigator();
    render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="ProviderReviews" component={ProviderReviews} />
        </Stack.Navigator>
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(screen.getByText('234 Bewertungen')).toBeTruthy();
      expect(screen.getByText('Fantastisch!')).toBeTruthy();
      expect(screen.getByText('Sehr gut')).toBeTruthy();
    });

    const fiveStarChip = screen.getByText('5 Sterne');
    fireEvent.press(fiveStarChip);
    await waitFor(() => {
      expect(screen.getByText('Fantastisch!')).toBeTruthy();
      expect(screen.queryByText('Sehr gut')).toBeNull();
    });
  });

  it('opens reply form and submits provider response', async () => {
    seedReviews();
    (httpMod.http.post as jest.Mock).mockResolvedValue({ data: { ok: true } });

    const Stack = createNativeStackNavigator();
    render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="ProviderReviews" component={ProviderReviews} />
        </Stack.Navigator>
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(screen.getByText('Fantastisch!')).toBeTruthy();
    });

    const replyButton = screen.getByText('Antworten');
    fireEvent.press(replyButton);

    const input = screen.getByPlaceholderText('Deine Antwort...');
    fireEvent.changeText(input, 'Vielen Dank!');

    const submit = screen.getByText('Antwort senden');
    fireEvent.press(submit);

    await waitFor(() => {
      expect(httpMod.http.post).toHaveBeenCalledWith('/reviews/respond', { reviewId: 'r1', response: 'Vielen Dank!' });
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
