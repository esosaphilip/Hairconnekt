import React from 'react';
import Icon from '../components/Icon';

export default function FileText({ size = 24, color, style }) {
  return <Icon name="document-text" size={size} color={color} style={style} />;
}