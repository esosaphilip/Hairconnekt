import React from 'react';
import Icon from '../components/Icon';

export default function Camera({ size = 24, color, style }: { size?: number; color?: string; style?: any }) {
  return <Icon name="camera" size={size} color={color} style={style} />;
}