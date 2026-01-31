import React from 'react';
import { render } from '@testing-library/react-native';
import ProviderCard from '../ProviderCard';

// Mock dependencies
jest.mock('../../ui', () => ({
  Card: ({ children }: any) => <>{children}</>,
  Avatar: ({ children }: any) => <>{children}</>,
  Badge: ({ children }: any) => <>{children}</>,
}));

jest.mock('../Icon', () => 'Icon');

// Mock AppImage
jest.mock('../AppImage', () => ({
  AppImage: (props: any) => <mock-app-image {...props} testID={props.testID} />,
}));

describe('ProviderCard Image', () => {
  it('renders AppImage with correct uri', () => {
    const data = {
      id: '1',
      name: 'Test',
      imageUrl: 'test.jpg',
    };
    
    const { getByTestId } = render(<ProviderCard data={data} />);
    
    const appImage = getByTestId('provider-card-image');
    expect(appImage.props.uri).toBe('test.jpg');
  });
});
