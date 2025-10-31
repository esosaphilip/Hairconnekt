import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, radii } from '../theme/tokens';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends Omit<ViewProps, 'style'> {
  children?: React.ReactNode;
  title?: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  color?: string; // optional text color override for compatibility
  textColor?: string; // alias used by some screens
}

export function Badge(props: BadgeProps = {}) {
  const { children, title, variant: variantProp, style, textStyle, color, textColor, ...rest } = props ?? {};
  const variant: BadgeVariant = variantProp ?? 'default';
  const { containerStyle, labelStyle } = getStylesForVariant(variant);
  return (
    <View {...rest} style={[styles.base, containerStyle, style]}>
      {typeof children === 'string' ? (
        <Text style={[styles.text, labelStyle, (textColor || color) ? { color: textColor || color } : null, textStyle]}>{children}</Text>
      ) : title ? (
        <Text style={[styles.text, labelStyle, (textColor || color) ? { color: textColor || color } : null, textStyle]}>{title}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function getStylesForVariant(variant: BadgeVariant = 'default') {
  switch (variant) {
    case 'secondary':
      return {
        containerStyle: { backgroundColor: colors.gray100, borderColor: colors.gray300 },
        labelStyle: { color: colors.gray700 },
      };
    case 'destructive':
      return {
        containerStyle: { backgroundColor: colors.error, borderColor: colors.error },
        labelStyle: { color: colors.white },
      };
    case 'outline':
      return {
        containerStyle: { backgroundColor: colors.white, borderColor: colors.gray300 },
        labelStyle: { color: colors.gray700 },
      };
    case 'default':
    default:
      return {
        containerStyle: { backgroundColor: colors.primary, borderColor: colors.primary },
        labelStyle: { color: colors.white },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Badge;
