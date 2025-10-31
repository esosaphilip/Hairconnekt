import React, { useMemo } from 'react';
import { View, Pressable, Animated, Easing } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

export interface SwitchProps {
  value?: boolean;
  onValueChange?: (next: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Switch(props: SwitchProps = {}) {
  const { value = false, onValueChange, disabled, style } = props ?? {};
  const translateX = useMemo(() => new Animated.Value(value ? 14 : 0), [value]);
  const toggle = () => {
    if (disabled) return;
    Animated.timing(translateX, { toValue: value ? 0 : 14, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    onValueChange?.(!value);
  };
  return (
    <Pressable onPress={toggle} disabled={!!disabled} style={[{ width: 32, height: 18, borderRadius: 9, padding: 2, backgroundColor: value ? colors.primary : colors.gray300 }, style]}>
      <Animated.View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.white, transform: [{ translateX }] }} />
    </Pressable>
  );
}

export default Switch;
