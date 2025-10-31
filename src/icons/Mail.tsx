import React from 'react';
import Icon from '../components/Icon';

export default function Mail({ size = 24, color, style }) {
  return <Icon name="mail" size={size} color={color} style={style} />;
}