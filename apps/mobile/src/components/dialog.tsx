"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View, StyleProp, ViewStyle, TextStyle } from "react-native";
import { theme } from "../theme/tokens";

type DialogContextValue = { open: boolean; setOpen: (next: boolean) => void } | null;
const DialogContext = createContext<DialogContextValue>(null);

function useDialogCtx(): { open: boolean; setOpen: (next: boolean) => void } {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>");
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
  children?: ReactNode;
}

function Dialog(props: DialogProps = {}) {
  const { open, defaultOpen, onOpenChange, children } = props ?? {};
  const isControlled = typeof open === "boolean";
  const [internal, setInternal] = useState<boolean>(defaultOpen ?? false);
  const value = isControlled ? (open as boolean) : internal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const ctx = useMemo(() => ({ open: value, setOpen }), [value, setOpen]);

  return <DialogContext.Provider value={ctx}>{children}</DialogContext.Provider>;
}

function DialogTrigger(props: { children?: ReactNode } = {}) {
  const { children } = props ?? {};
  const { setOpen } = useDialogCtx();
  return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
}

function DialogPortal(props: { children?: ReactNode } = {}) {
  const { children } = props ?? {};
  return <>{children}</>;
}

function DialogOverlay() {
  return <View style={styles.overlay} />;
}

function DialogContent(props: { children?: ReactNode; style?: StyleProp<ViewStyle> } = {}) {
  const { children, style } = props ?? {};
  const { open, setOpen } = useDialogCtx();
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.content, style]}>
          <Pressable
            onPress={() => setOpen(false)}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          >
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
          {typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children}
        </View>
      </View>
    </Modal>
  );
}

function DialogHeader(props: { children?: ReactNode } = {}) {
  const { children } = props ?? {};
  return (
    <View style={styles.header}>
      {typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children}
    </View>
  );
}

function DialogFooter(props: { children?: ReactNode } = {}) {
  const { children } = props ?? {};
  return (
    <View style={styles.footer}>
      {typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children}
    </View>
  );
}

function DialogTitle(props: { children?: ReactNode } = {}) {
  const { children } = props ?? {};
  return (
    <Text style={[theme.typography.h3 as TextStyle, { color: theme.colors.black }]}>
      {children}
    </Text>
  );
}

function DialogDescription(props: { children?: ReactNode } = {}) {
  const { children } = props ?? {};
  return (
    <Text style={{ fontSize: 14, color: theme.colors.gray600 }}>{children}</Text>
  );
}

function DialogClose(props: { children?: ReactNode } = {}) {
  const { children } = props ?? {};
  const { setOpen } = useDialogCtx();
  return <Pressable onPress={() => setOpen(false)}>{children}</Pressable>;
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeButton: {
    padding: 8,
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 1,
  },
  closeIcon: {
    color: theme.colors.gray600,
    fontSize: 20,
  },
  content: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray200,
    borderRadius: theme?.radii?.lg ?? 0,
    borderWidth: 1,
    padding: 16,
    width: "88%",
    ...(theme.shadows && theme.shadows.lg ? theme.shadows.lg : {}),
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  header: {
    marginBottom: 8,
  },
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
