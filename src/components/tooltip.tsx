"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme/tokens";

const Ctx = createContext(null);

function useTooltipCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

function TooltipProvider({ children, delayDuration = 300 }) {
  return <Ctx.Provider value={{ open: false, setOpen: () => {}, delayDuration }}>{children}</Ctx.Provider>;
}

function Tooltip({ open, defaultOpen, onOpenChange, delayDuration = 300, children }) {
  const isControlled = typeof open === "boolean";
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const value = isControlled ? open : internal;
  const setOpen = useCallback(
    (next) => {
      if (!isControlled) setInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );
  const ctx = useMemo(() => ({ open: value, setOpen, delayDuration }), [value, setOpen, delayDuration]);
  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

function TooltipTrigger({ children }) {
  const { setOpen, delayDuration } = useTooltipCtx();
  let timeoutId;
  const onLongPress = () => {
    timeoutId = setTimeout(() => setOpen(true), delayDuration ?? 300);
  };
  const onPressOut = () => {
    clearTimeout(timeoutId);
    setOpen(false);
  };
  return <Pressable onLongPress={onLongPress} onPressOut={onPressOut}>{children}</Pressable>;
}

function TooltipContent({ children, style }) {
  const { open, setOpen } = useTooltipCtx();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.centerWrap}>
        <View style={[styles.bubble, style]}>
          {typeof children === "string" || typeof children === "number" ? (
            <Text style={styles.text}>{children}</Text>
          ) : (
            children
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  bubble: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.md,
    ...(theme.shadows.sm || {}),
  },
  text: {
    color: theme.colors.white,
    fontSize: 12,
  },
});

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
