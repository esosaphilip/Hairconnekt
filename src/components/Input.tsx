import React, { forwardRef } from 'react';
import { View, TextInput } from 'react-native';
import type { StyleProp, ViewStyle, TextInputProps, TextInput as RNTextInput } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  required?: boolean; // compatibility flag from web
  label?: string; // ignored visually but allowed for typing
}

export const Input = forwardRef<RNTextInput, InputProps>(function Input(props: InputProps = {}, ref) {
  const { leftIcon, style, required: _required, label: _label, ...rest } = props ?? {};
  return (
    <View style={[{ position: 'relative', justifyContent: 'center' }]}> 
      {!!leftIcon && <View style={{ position: 'absolute', left: 8, zIndex: 1 }}>{leftIcon}</View>}
      <TextInput
        ref={ref as any}
        {...rest}
        style={[{ height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#fff' }, leftIcon ? { paddingLeft: 36 } : null, style]}
      />
    </View>
  );
});

export default Input;