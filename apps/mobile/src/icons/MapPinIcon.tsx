import React from 'react';
import Icon from '../components/Icon';

export default function MapPinIcon({ size = 24, color, style }: { size?: number; color?: string; style?: any }) {
  return <Icon name="map-pin" size={size} color={color} style={style} />;
}