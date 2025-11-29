import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import Icon from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'default';
export type ButtonSize = 'default' | 'small' | 'sm' | 'icon';

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
    paddingVertical: size === 'small' || size === 'sm' || size === 'icon' ? spacing.xs + 6 : spacing.sm + 4,
    paddingHorizontal: size === 'small' || size === 'sm' || size === 'icon' ? spacing.md : spacing.lg,
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
    // Ensure outline and ghost variants use a visible text color on light backgrounds
    color: (variant === 'ghost' || variant === 'outline') ? colors.black : colors.white,
    fontWeight: '600',
    fontSize: size === 'small' || size === 'sm' || size === 'icon' ? 14 : 16,
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
          {/* If a textual title is provided OR children is a plain string, render it inside Text. */}
          {( 
            (typeof title === 'string' && title.length > 0) ||
            typeof children === 'string'
          ) ? (
            <>
              {!!icon && (
                typeof icon === 'string' ? (
                  <Icon name={icon} size={18} color={label.color as string} />
                ) : (
                  <>{icon}</>
                )
              )}
              {(() => { const labelMargin: TextStyle = { marginLeft: icon ? 8 : 0 }; return (
              <Text style={[label, labelMargin, textStyle]}>
                {typeof title === 'string' && title.length > 0 ? title : (children as string)}
              </Text>
              ); })()}
            </>
          ) : (
            /* Otherwise, render children as-is to allow complex content (icons + views). */
            <>
              {!!icon && (
                typeof icon === 'string' ? (
                  <Icon name={icon} size={18} color={label.color as string} />
                ) : (
                  <>{icon}</>
                )
              )}
              {children}
            </>
          )}
        </>
      )}
    </Pressable>
  );
}

export default Button;