import React, { useState, createContext, useContext } from 'react';
import { View, Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

type CollapsibleCtx = { open: boolean; setOpen: (next: boolean) => void } | null;
const Ctx = createContext<CollapsibleCtx>(null);

export interface CollapsibleProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function Collapsible(props: CollapsibleProps = {}) {
  const { children, open, defaultOpen, onOpenChange, style } = props ?? {};
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen ?? false);
  const isControlled = typeof open === 'boolean';
  const actualOpen = isControlled ? (open as boolean) : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };
  return (
    <Ctx.Provider value={{ open: actualOpen, setOpen }}>
      <View style={style}>{children}</View>
    </Ctx.Provider>
  );
}

export interface CollapsibleTriggerProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CollapsibleTrigger(props: CollapsibleTriggerProps = {}) {
  const { children, onPress, style } = props ?? {};
  const ctx = useContext(Ctx);
  if (!ctx) return <View style={style}>{children}</View>;
  return (
    <Pressable onPress={() => { ctx.setOpen(!ctx.open); onPress?.(); }} style={style}>
      {children}
    </Pressable>
  );
}

export interface CollapsibleContentProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CollapsibleContent(props: CollapsibleContentProps = {}) {
  const { children, style } = props ?? {};
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  if (!ctx.open) return null;
  return <View style={style}>{children}</View>;
}
