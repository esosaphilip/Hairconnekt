import React from 'react';
import Icon from '../components/Icon';

export default function MapPin({ size = 24, color, fill, style }: { size?: number; color?: string; fill?: string; style?: any }) {
  return <Icon name="map-pin" size={size} color={color} fill={fill} style={style} />;
}