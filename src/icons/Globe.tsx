import React from 'react';
import Icon from '../components/Icon';

export default function Globe({ size = 24, color, style }) {
  return <Icon name="globe" size={size} color={color} style={style} />;
}