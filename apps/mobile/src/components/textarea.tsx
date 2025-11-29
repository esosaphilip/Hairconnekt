import React, { forwardRef } from "react";
import { TextInput, StyleSheet } from "react-native";
import type { TextInputProps, StyleProp, TextStyle } from "react-native";
import { theme } from "../theme/tokens";

export interface TextareaProps extends Omit<TextInputProps, 'style'> {
  style?: StyleProp<TextStyle>;
  invalid?: boolean;
}

const Textarea = forwardRef<TextInput, TextareaProps>(function Textarea(_props: TextareaProps = {}, ref) {
  const props = _props ?? {};
  const { style, placeholderTextColor, invalid, ...rest } = props;
  return (
    <TextInput
      ref={ref}
      multiline
      textAlignVertical="top"
      placeholderTextColor={
        placeholderTextColor ?? theme.colors.gray500
      }
      style={[
        styles.base,
        invalid ? styles.invalid : null,
        style,
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    minHeight: 64,
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme?.radii?.md ?? 0,
    color: theme.colors.black,
    fontSize: 16,
  },
  invalid: {
    borderColor: theme.colors.error,
  },
});

export { Textarea };
export default Textarea;
