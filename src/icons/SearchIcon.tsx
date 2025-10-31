import React from 'react';
import Icon from '../components/Icon';

export default function SearchIcon({ size = 24, color, style }: { size?: number; color?: string; style?: any }) {
  return <Icon name="search" size={size} color={color} style={style} />;
}