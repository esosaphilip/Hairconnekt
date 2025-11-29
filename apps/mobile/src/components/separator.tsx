import React from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps {
  orientation?: SeparatorOrientation;
  style?: StyleProp<ViewStyle>;
}

export function Separator(props: SeparatorProps = {}) {
  const { orientation = 'horizontal', style } = props ?? {};
  if (orientation === 'vertical') {
    return <View style={[{ width: 1, height: '100%', backgroundColor: colors.gray200 }, style]} />;
  }
  return <View style={[{ height: 1, width: '100%', backgroundColor: colors.gray200 }, style]} />;
}

export default Separator;
