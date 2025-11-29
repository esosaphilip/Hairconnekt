import React from 'react';
import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { colors } from '../theme/tokens';

export interface LabelProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export function Label(props: LabelProps = {}) {
  const { children, style, disabled } = props ?? {};
  return (
    <Text style={[{ fontSize: 14, fontWeight: '500', color: colors.gray700, opacity: disabled ? 0.5 : 1 }, style]}>
      {children}
    </Text>
  );
}
