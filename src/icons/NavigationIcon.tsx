import React from 'react';
import Icon from '../components/Icon';

export default function NavigationIcon({ size = 24, color, style }: { size?: number; color?: string; style?: any }) {
  return <Icon name="navigation" size={size} color={color} style={style} />;
}