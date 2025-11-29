import * as React from "react";
import { TextInput, TextInputProps } from "react-native";

export type TextareaProps = TextInputProps & {
  invalid?: boolean;
};

declare const Textarea: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TextareaProps> & React.RefAttributes<TextInput>
>;

export { Textarea };
export default Textarea;