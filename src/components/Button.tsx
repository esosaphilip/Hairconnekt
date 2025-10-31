import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import Icon from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'default';
export type ButtonSize = 'default' | 'small' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'onPress' | 'style' | 'disabled'> {
  title?: string; // preferred text API
  children?: React.ReactNode; // compatibility with older ui.Button usage
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode | string;
}

export function Button(props: ButtonProps = {}) {
  const { title, children, onPress, disabled, loading, variant = 'primary', size = 'default', style, textStyle, icon, ...rest } = props ?? {};
  const base: ViewStyle = {
    paddingVertical: size === 'small' || size === 'sm' ? spacing.xs + 6 : spacing.sm + 4,
    paddingHorizontal: size === 'small' || size === 'sm' ? spacing.md : spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };
  const variants: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: disabled ? colors.gray400 : colors.black },
    secondary: { backgroundColor: disabled ? colors.gray300 : colors.primary },
    ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.gray300 },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.gray300 },
    default: { backgroundColor: disabled ? colors.gray400 : colors.black },
  };
  const label: TextStyle = {
    color: variant === 'ghost' ? colors.black : colors.white,
    fontWeight: '600',
    fontSize: size === 'small' || size === 'sm' ? 14 : 16,
  };

  return (
    <Pressable
      {...rest}
      onPress={onPress}
      disabled={disabled || !!loading}
      style={[base, variants[variant], style]}
    >
      {loading ? (
        <ActivityIndicator color={label.color as string} />
      ) : (
        <>
          {!!icon && (
            typeof icon === 'string' ? (
              <Icon name={icon} size={18} color={label.color as string} />
            ) : (
              <>{icon}</>
            )
          )}
          <Text style={[label, { marginLeft: icon ? 8 : 0 }, textStyle]}>
            {typeof title === 'string' && title.length > 0 ? title : (children as any)}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export default Button;