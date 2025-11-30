import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { StyleProp, TextInputProps, TextInput as RNTextInput, TextStyle } from 'react-native';
import { colors, radii } from '../theme/tokens';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  leftIcon?: React.ReactNode;
  /** Compatibility alias used by some screens */
  icon?: React.ReactNode;
  /** Optional error text, accepted for compatibility; not rendered by default */
  error?: string;
  style?: StyleProp<TextStyle>;
  required?: boolean; // compatibility flag from web
  label?: string; // ignored visually but allowed for typing
  /** Optional text style for future label rendering */
  labelStyle?: StyleProp<TextStyle>;
}

export const Input = forwardRef<RNTextInput, InputProps>(function Input(props: InputProps = {}, ref) {
  const { leftIcon, icon, style, ...rest } = props ?? {};
  const iconNode = leftIcon ?? icon;
  const hasIcon = iconNode != null && iconNode !== false;
  return (
    <View style={styles.container}>
      {hasIcon && (
        <View style={styles.icon}>
          {typeof iconNode === 'string' || typeof iconNode === 'number'
            ? <Text style={styles.iconText}>{String(iconNode)}</Text>
            : (iconNode as React.ReactNode)}
        </View>
      )}
      <TextInput
        ref={ref}
        {...rest}
        style={[styles.input, hasIcon ? styles.inputWithIcon : null, style]}
      />
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    left: 8,
    position: 'absolute',
    zIndex: 1,
  },
  iconText: {
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 12,
  },
  inputWithIcon: {
    paddingLeft: 36,
  },
});
