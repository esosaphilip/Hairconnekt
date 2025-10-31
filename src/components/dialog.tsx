"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { theme } from "../theme/tokens";

type DialogContextValue = { open: boolean; setOpen: (next: boolean) => void };
const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogCtx() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>");
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
  children?: React.ReactNode;
}

function Dialog(props: DialogProps = {}) {
  const { open, defaultOpen, onOpenChange, children } = props ?? {};
  const isControlled = typeof open === "boolean";
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const value = isControlled ? open : internal;
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

export interface DialogTriggerProps { children?: React.ReactNode }
function DialogTrigger(props: DialogTriggerProps = {}) {
  const { children } = props ?? {};
  const { setOpen } = useDialogCtx();
  return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
}

export interface DialogPortalProps { children?: React.ReactNode }
function DialogPortal(props: DialogPortalProps = {}) {
  const { children } = props ?? {};
  return <>{children}</>;
}

function DialogOverlay() {
  return <View style={styles.overlay} />;
}

export interface DialogContentProps { children?: React.ReactNode; style?: StyleProp<ViewStyle> }
function DialogContent(props: DialogContentProps = {}) {
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
          {children}
        </View>
      </View>
    </Modal>
  );
}

export interface DialogHeaderProps { children?: React.ReactNode }
function DialogHeader(props: DialogHeaderProps = {}) {
  const { children } = props ?? {};
  return <View style={styles.header}>{children}</View>;
}

export interface DialogFooterProps { children?: React.ReactNode }
function DialogFooter(props: DialogFooterProps = {}) {
  const { children } = props ?? {};
  return <View style={styles.footer}>{children}</View>;
}

export interface DialogTitleProps { children?: React.ReactNode }
function DialogTitle(props: DialogTitleProps = {}) {
  const { children } = props ?? {};
  return (
    <Text style={[theme.typography.h3, { color: theme.colors.black }]}>
      {children}
    </Text>
  );
}

export interface DialogDescriptionProps { children?: React.ReactNode }
function DialogDescription(props: DialogDescriptionProps = {}) {
  const { children } = props ?? {};
  return (
    <Text style={{ fontSize: 14, color: theme.colors.gray600 }}>{children}</Text>
  );
}

export interface DialogCloseProps { children?: React.ReactNode }
function DialogClose(props: DialogCloseProps = {}) {
  const { children } = props ?? {};
  const { setOpen } = useDialogCtx();
  return <Pressable onPress={() => setOpen(false)}>{children}</Pressable>;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    width: "88%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    ...(theme.shadows && theme.shadows.lg ? theme.shadows.lg : {}),
  },
  header: {
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    color: theme.colors.gray600,
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
