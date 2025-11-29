import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import Icon from '../components/Icon';

export interface IconWrapperProps {
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export default function Scale({ size = 24, color, style }: IconWrapperProps) {
  return <Icon name="scale" size={size} color={color} style={style} />;
}