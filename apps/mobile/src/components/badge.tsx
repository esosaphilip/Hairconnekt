import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

const PRESETS = {
  green: { bg: '#ECFDF5', fg: '#065F46', border: '#A7F3D0' },
  amber: { bg: '#FFFBEB', fg: '#78350F', border: '#FDE68A' },
  red:   { bg: '#FEF2F2', fg: '#7F1D1D', border: '#FECACA' },
  gray:  { bg: '#F3F4F6', fg: '#374151', border: '#E5E7EB' },
} as const;

type PresetKey = keyof typeof PRESETS;

export type BadgeProps = {
  color?: PresetKey | string;
  variant?: 'success' | 'danger' | 'secondary' | 'outline';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  label?: string;
  title?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Badge(props: BadgeProps) {
  const presetColor = props?.color ?? 'gray';
  const basePreset = (typeof presetColor === 'string' && presetColor in PRESETS)
    ? PRESETS[presetColor as PresetKey]
    : PRESETS.gray;
  const variant = props?.variant;
  const mappedFromVariant: { bg: string; fg: string; border: string } | null =
    variant === 'success' ? PRESETS.green :
    variant === 'danger' ? PRESETS.red :
    variant === 'secondary' ? PRESETS.gray :
    variant === 'outline' ? { ...PRESETS.gray, bg: 'transparent' } : null;
  const bg = props?.backgroundColor != null ? props.backgroundColor : (mappedFromVariant?.bg ?? basePreset.bg);
  const fg = props?.textColor != null ? props.textColor : (mappedFromVariant?.fg ?? basePreset.fg);
  const border = props?.borderColor != null ? props.borderColor : (mappedFromVariant?.border ?? basePreset.border);
  const labelText = props?.label != null ? props.label : (props?.title != null ? props.title : props?.children);
  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }, props?.style]}> 
      <Text style={[styles.text, { color: fg }, props?.textStyle]}
      >
        {labelText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Badge;
