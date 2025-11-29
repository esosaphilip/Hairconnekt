import React from 'react';
import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

export interface CheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (next: boolean) => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({ checked = false, disabled = false, onCheckedChange, size = 20, style }: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onCheckedChange?.(!checked)}
      activeOpacity={0.8}
      style={[styles.box, styles.boxRadius, { width: size, height: size }, style]}
      disabled={disabled}
    >
      {checked ? <View style={[styles.inner, { width: size - 8, height: size - 8 }]} /> : null}
    </TouchableOpacity>
  );
}

export default Checkbox;

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderWidth: 1,
    justifyContent: 'center',
  },
  boxRadius: {
    borderRadius: 4,
  },
  inner: {
    backgroundColor: colors.primary,
  },
});
