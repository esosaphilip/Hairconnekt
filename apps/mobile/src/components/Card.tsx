import React, { ReactNode } from 'react';
import { View, TouchableOpacity, Text, ViewProps, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { colors, radii, spacing, shadows } from '../theme/tokens';

export interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
  // Allow passing any native props to underlying container
  // Use a union to satisfy both View and TouchableOpacity depending on onPress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
      // Spread rest as it may include accessibility props etc.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(rest as any),
    };
    return <TouchableOpacity {...touchableProps}>{renderChildren(children)}</TouchableOpacity>;
  }

  const viewProps: ViewProps = {
    style: baseStyle,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(rest as any),
  };
  return <View {...viewProps}>{renderChildren(children)}</View>;
}

export default Card;