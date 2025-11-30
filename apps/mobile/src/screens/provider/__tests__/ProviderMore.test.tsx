import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ProviderMore } from '../ProviderMore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from '../../../auth/AuthContext';
import * as httpMod from '../../../api/http';
import { Text } from 'react-native';

jest.mock('../../../api/http', () => {
  return {
    http: {
      get: jest.fn(),
    },
  };
});

function DummyScreen({ title }: { title: string }) {
  return <Text>{title}</Text> as any;
}

describe('ProviderMore screen', () => {
  beforeEach(() => {
    (httpMod.http.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/providers/me') {
        return Promise.resolve({ data: { businessName: 'Aisha\'s Braiding Studio', isVerified: true, user: { firstName: 'Aisha', lastName: 'Mensah' } } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => jest.resetAllMocks());

  it('navigates to Mein Profil and Bewertungen from menu', async () => {
    const Stack = createNativeStackNavigator();
    render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="ProviderMore" component={ProviderMore} />
            <Stack.Screen name="ProviderProfileScreen" children={() => <DummyScreen title="Mein Profil Screen" />} />
            <Stack.Screen name="ProviderReviewsScreen" children={() => <DummyScreen title="Bewertungen Screen" />} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Mehr')).toBeTruthy();
    });

    const profileItem = screen.getByText('Mein Profil');
    fireEvent.press(profileItem);
    await waitFor(() => {
      expect(screen.getByText('Mein Profil Screen')).toBeTruthy();
    });

    // Go back to menu by re-rendering
    render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="ProviderMore" component={ProviderMore} />
            <Stack.Screen name="ProviderReviewsScreen" children={() => <DummyScreen title="Bewertungen Screen" />} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    const reviewsItem = await screen.findByText('Bewertungen');
    fireEvent.press(reviewsItem);
    await waitFor(() => {
      expect(screen.getByText('Bewertungen Screen')).toBeTruthy();
    });
  });
});
