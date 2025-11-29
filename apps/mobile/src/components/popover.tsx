"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { theme } from "../theme/tokens";

const Ctx = createContext(null);

function usePopover() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Popover components must be used within <Popover>");
  return ctx;
}

function Popover({ open, defaultOpen, onOpenChange, children }) {
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
  const ctx = useMemo(() => ({ open: value, setOpen }), [value, setOpen]);
  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

function PopoverTrigger({ children }) {
  const { setOpen } = usePopover();
  return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
}

function PopoverContent({ children, style }) {
  const { open, setOpen } = usePopover();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.centerWrap}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.card, style]}>{children}</View>
      </View>
    </Modal>
  );
}

function PopoverAnchor({ children }) {
  return <>{children}</>;
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray200,
    borderRadius: theme?.radii?.md ?? 0,
    borderWidth: 1,
    maxWidth: "90%",
    padding: 16,
    width: 280,
    ...(theme.shadows?.md || {}),
  },
  centerWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
