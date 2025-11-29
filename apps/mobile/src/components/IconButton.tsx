import React from 'react';
import { Pressable } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import Icon from './Icon';
import { colors, radii } from '../theme/tokens';

export interface IconButtonProps extends Omit<PressableProps, 'onPress' | 'style' | 'disabled'> {
  name: string;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function IconButton(props: IconButtonProps = { name: '' }) {
  const { name, onPress, disabled, size = 20, color = colors.black, style, ...rest } = props ?? { name: '' };
  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      onPress={onPress}
      disabled={!!disabled}
      style={[{ padding: 8, borderRadius: radii.md, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}