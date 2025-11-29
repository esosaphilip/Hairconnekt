"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../theme/tokens";

const MenuContext = createContext(null);

function useMenuCtx() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be within <DropdownMenu>");
  return ctx;
}

function DropdownMenu({ open, defaultOpen, onOpenChange, children }) {
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
  return <MenuContext.Provider value={ctx}>{children}</MenuContext.Provider>;
}

function DropdownMenuPortal({ children }) {
  return <>{children}</>;
}

function DropdownMenuTrigger({ children }) {
  const { setOpen } = useMenuCtx();
  return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
}

function DropdownMenuContent({ children, style }) {
  const { open, setOpen } = useMenuCtx();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.menuCard, style]}>
          <ScrollView>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DropdownMenuGroup({ children }) {
  return <View>{children}</View>;
}

function DropdownMenuItem({ children, inset, variant = "default", disabled, onPress, onSelect }) {
  const { setOpen } = useMenuCtx();
  const handlePress = () => {
    if (disabled) return;
    onPress?.();
    onSelect?.();
    setOpen(false);
  };
  return (
    <Pressable
      accessibilityRole="menuitem"
      disabled={disabled}
      onPress={handlePress}
      style={[
        styles.item,
        inset ? { paddingLeft: 24 } : null,
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      <Text style={[styles.itemText, variant === "destructive" ? { color: theme.colors.error } : null]}>{children}</Text>
    </Pressable>
  );
}

function DropdownMenuCheckboxItem({ children, checked, onCheckedChange, disabled }) {
  const toggle = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked, disabled }} onPress={toggle} style={[styles.item, disabled ? { opacity: 0.5 } : null]}>
      <Text style={styles.itemText}>{checked ? "✓ " : "  "}{children}</Text>
    </Pressable>
  );
}

const RadioContext = createContext(null);

function DropdownMenuRadioGroup({ value, onValueChange, children }) {
  const [internal, setInternal] = useState(value);
  const isControlled = typeof value === "string";
  const current = isControlled ? value : internal;
  const setValue = (v) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };
  const ctx = useMemo(() => ({ value: current, setValue }), [current]);
  return <RadioContext.Provider value={ctx}>{children}</RadioContext.Provider>;
}

function useRadioCtx() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("RadioItem must be used within DropdownMenuRadioGroup");
  return ctx;
}

function DropdownMenuRadioItem({ value, children, disabled }) {
  const { value: selected, setValue } = useRadioCtx();
  const { setOpen } = useMenuCtx();
  const selectedMark = selected === value ? "◉" : "○";
  const onPress = () => {
    if (disabled) return;
    setValue(value);
    setOpen(false);
  };
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.item, disabled ? { opacity: 0.5 } : null]}>
      <Text style={styles.itemText}>{selectedMark} {children}</Text>
    </Pressable>
  );
}

function DropdownMenuLabel({ children, inset }) {
  return (
    <View style={{ paddingHorizontal: inset ? 24 : 12, paddingVertical: 8 }}>
      <Text style={{ fontSize: 12, color: theme.colors.gray600, fontWeight: "500" }}>{children}</Text>
    </View>
  );
}

function DropdownMenuSeparator() {
  return <View style={styles.separator} />;
}

function DropdownMenuShortcut({ children }) {
  return <Text style={styles.shortcut}>{children}</Text>;
}

// Submenus are not implemented; export no-op wrappers so usage doesn't break
function DropdownMenuSub({ children }) {
  return <>{children}</>;
}
function DropdownMenuSubTrigger({ children }) {
  return <>{children}</>;
}
function DropdownMenuSubContent({ children }) {
  return <>{children}</>;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  menuCard: {
    maxHeight: "70%",
    minWidth: 200,
    width: "80%",
    backgroundColor: theme.colors.white,
    borderRadius: theme?.radii?.md ?? 0,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingVertical: 4,
    ...(theme.shadows?.md || {}),
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 14,
    color: theme.colors.black,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: 4,
  },
  shortcut: {
    marginLeft: "auto",
    color: theme.colors.gray500,
    fontSize: 12,
  },
});

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
