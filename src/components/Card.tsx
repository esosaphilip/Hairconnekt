import React from 'react';
import { View, ViewProps, TouchableOpacity } from 'react-native';
import type { StyleProp } from 'react-native';
import type { ViewStyle } from 'react-native';
import { colors, radii, spacing, shadows } from '../theme/tokens';

export interface CardProps extends Omit<ViewProps, 'style'> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
}

export function Card(props: CardProps = {}) {
  const { children, style, elevated = true, onPress, activeOpacity = 0.8, disabled, ...rest } = props ?? {};
  const baseStyle = [
    {
      backgroundColor: colors.white,
      borderRadius: radii.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: '#00000010',
    },
    elevated ? shadows.md : null,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        {...rest as any}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        style={baseStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View {...rest} style={baseStyle}>
      {children}
    </View>
  );
}

export default Card;