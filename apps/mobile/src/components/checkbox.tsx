"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../theme/tokens";

type CheckboxSize = "sm" | "md";

type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  disabled?: boolean;
  size?: CheckboxSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  size = "md",
  style,
  testID,
}: CheckboxProps) {
  const isControlled = typeof checked === "boolean";
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const value = isControlled ? checked : internal;

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !value;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  }, [disabled, isControlled, value, onCheckedChange]);

  const dim = size === "sm" ? 16 : 20;

  const boxStyle = useMemo(
    () => [
      styles.box,
      {
        width: dim,
        height: dim,
        borderRadius: 4,
        borderColor: value ? theme.colors.primary : theme.colors.gray300,
        backgroundColor: value ? theme.colors.primary : theme.colors.white,
        opacity: disabled ? 0.5 : 1,
      },
      style,
    ],
    [dim, value, disabled, style]
  );

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      onPress={toggle}
      style={boxStyle}
      testID={testID}
    >
      {value ? (
        <View style={styles.checkMarkContainer}>
          {/* Simple check mark using a unicode character for broad compatibility */}
          <Text style={[styles.checkMark, { fontSize: size === "sm" ? 12 : 14 }]}>
            ✓
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
  },
  checkMark: {
    color: theme.colors.white,
    fontWeight: "700",
    lineHeight: 16,
  },
  checkMarkContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export { Checkbox };
export type { CheckboxProps };
