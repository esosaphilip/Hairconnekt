import React from 'react';
import Icon from '../components/Icon';

export default function Heart({ size = 24, color, fill, style }: { size?: number; color?: string; fill?: string; style?: any }) {
  return <Icon name="heart" size={size} color={color} fill={fill} style={style} />;
}