import React from 'react';
import { render } from '@testing-library/react-native';
import ProviderCard from '../ProviderCard';
import { normalizeUrl } from '@/utils/url';

jest.mock('@/utils/url', () => ({
  normalizeUrl: jest.fn(url => `NORMALIZED_${url}`),
}));

// Mock other dependencies
jest.mock('../../ui', () => ({
  Card: ({ children }: any) => <>{children}</>,
  Avatar: ({ children }: any) => <>{children}</>,
  Badge: ({ children }: any) => <>{children}</>,
}));

jest.mock('../Icon', () => 'Icon');

describe('ProviderCard Image', () => {
  it('calls normalizeUrl with imageUrl', () => {
    const data = {
      id: '1',
      name: 'Test',
      imageUrl: 'test.jpg',
    };
    
    render(<ProviderCard data={data} />);
    
    expect(normalizeUrl).toHaveBeenCalledWith('test.jpg');
  });
});
