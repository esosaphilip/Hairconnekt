import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

export interface CheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (next: boolean) => void;
  size?: number;
  style?: any;
}

export function Checkbox({ checked = false, disabled = false, onCheckedChange, size = 20, style }: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onCheckedChange?.(!checked)}
      activeOpacity={0.8}
      style={[styles.box, { width: size, height: size, borderRadius: 4 }, style]}
      disabled={disabled}
    >
      {checked ? <View style={[styles.inner, { width: size - 8, height: size - 8 }]} /> : null}
    </TouchableOpacity>
  );
}

export default Checkbox;

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  inner: {
    backgroundColor: '#8B4513',
  },
});