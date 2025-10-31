import React from 'react';
import Icon from '../components/Icon';

export default function Check({ size = 24, color, style }) {
  return <Icon name="check" size={size} color={color} style={style} />;
}