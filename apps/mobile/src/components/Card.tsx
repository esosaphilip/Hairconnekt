import React, { ReactNode } from 'react';
import { View, TouchableOpacity, Text, ViewProps, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { colors, radii, spacing, shadows } from '../theme/tokens';

type NativeProps = ViewProps & TouchableOpacityProps;

export interface CardProps extends Partial<NativeProps> {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
}

export function Card(props: CardProps) {
  const { children, style, elevated = true, onPress, activeOpacity = 0.8, disabled, ...rest } = props ?? {} as CardProps;
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

  // Helper to normalize children so strings/numbers render on RN Web
  const renderChildren = (nodes: ReactNode): ReactNode => {
    // Wrap string/number children in Text to satisfy React Native Web
    if (typeof nodes === 'string' || typeof nodes === 'number') {
      return <Text>{nodes}</Text>;
    }
    if (Array.isArray(nodes)) {
      return nodes.map((node, idx) =>
        typeof node === 'string' || typeof node === 'number' ? <Text key={idx}>{node}</Text> : node
      );
    }
    return nodes;
  };

  if (onPress) {
    const touchableProps: TouchableOpacityProps = {
      onPress,
      disabled,
      activeOpacity,
      style: baseStyle,
      ...(rest as TouchableOpacityProps),
    };
    return <TouchableOpacity {...touchableProps}>{renderChildren(children)}</TouchableOpacity>;
  }

  const viewProps: ViewProps = {
    style: baseStyle,
    ...(rest as ViewProps),
  };
  return <View {...viewProps}>{renderChildren(children)}</View>;
}

export default Card;
