import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Button as ComponentsButton, type ButtonProps as ComponentsButtonProps } from '../components/Button';
import { Input as ComponentsInput, type InputProps as ComponentsInputProps } from '../components/Input';

// Simple Card
export interface CardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, style }: CardProps) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

// Simple Badge with variants
export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'outline';
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

export const Badge = ({ children, variant = 'default', textStyle, style }: BadgeProps) => {
  const backgroundColor =
    variant === 'secondary' ? '#E5E7EB' : variant === 'success' ? '#10B981' : '#EEE';
  const textColor = variant === 'secondary' ? '#374151' : '#111827';
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }, textStyle]}>{children}</Text>
    </View>
  );
};

// Simple Avatar; supports children (e.g., Text or Image) and size
export interface AvatarProps {
  children?: React.ReactNode;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const Avatar = ({ children, size = 40, style }: AvatarProps) => {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {children}
    </View>
  );
};

// Consolidated Button: re-export the canonical components/Button to avoid duplication
export type ButtonProps = ComponentsButtonProps;
export const Button = ComponentsButton;

// Consolidated Input: re-export the canonical components/Input to avoid duplication
export type InputProps = ComponentsInputProps;
export const Input = ComponentsInput;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  // Removed local Button and Input styles to rely on canonical components
});

export default {
  Card,
  Badge,
  Avatar,
  Button,
  Input,
};