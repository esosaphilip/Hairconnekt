import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AddEditServiceScreen } from '../AddEditServiceScreen';
import { clientBraiderApi } from '@/api/clientBraider';

// Mock API
jest.mock('@/api/clientBraider', () => ({
  clientBraiderApi: {
    getCategories: jest.fn(),
  },
}));

jest.mock('@/api/http', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock('@/services/providers', () => ({
  providersApi: {
    uploadServiceImage: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// Mock UI Components
jest.mock('@/components/Button', () => 'Button');
jest.mock('@/components/Card', () => 'Card');
jest.mock('@/components/Input', () => 'Input');
jest.mock('@/components/textarea', () => ({ Textarea: 'Textarea' }));
jest.mock('@/components/Picker', () => 'Picker');
jest.mock('@/components/slider', () => ({ Slider: 'Slider' }));

import { http } from '@/api/http';

describe('AddEditServiceScreen Categories', () => {
  it('fetches categories on mount', async () => {
    (http.get as jest.Mock).mockResolvedValue({
      data: [
        { id: 'uuid-1', name: 'Braids', slug: 'braids' },
        { id: 'uuid-2', name: 'Twists', slug: 'twists' },
      ]
    });

    const { getByText } = render(<AddEditServiceScreen />);

    // Verify it renders
    expect(getByText('Neuer Service')).toBeTruthy();

    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/services/categories');
    });
  });
});
