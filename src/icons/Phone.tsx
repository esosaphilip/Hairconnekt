import React from 'react';
import Icon from '../components/Icon';

export default function Phone({ size = 24, color, style }) {
  return <Icon name="phone" size={size} color={color} style={style} />;
}