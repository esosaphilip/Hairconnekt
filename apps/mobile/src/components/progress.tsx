import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radii } from '../theme/tokens';

type ProgressProps = {
  value?: number; // 0 - 100
  style?: StyleProp<ViewStyle>;
};

export function Progress({ value = 0, style }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.bar, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  container: {
    backgroundColor: colors.gray200,
    borderRadius: radii.full,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
});
