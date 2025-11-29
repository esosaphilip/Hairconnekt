import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { Button as ComponentsButton } from '../components/Button';
import { Input as ComponentsInput } from '../components/Input';

// Simple Card
export type CardProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Card: React.FC<CardProps> = ({ children, style }) => {
  /**
   * Normalize children to renderable nodes
   * Keep loose typing here for flexibility across app usage
   */
  const renderChildren = (nodes: ReactNode | ReactNode[] | string | number): ReactNode => {
    if (typeof nodes === 'string' || typeof nodes === 'number') {
      return <Text>{nodes}</Text>;
    }
    if (Array.isArray(nodes)) {
      return nodes.map((node, idx) =>
        typeof node === 'string' || typeof node === 'number' ? <Text key={idx}>{node}</Text> : node
      );
    }
    return nodes;
  };
  return <View style={[styles.card, style]}>{renderChildren(children)}</View>;
};

// Simple Badge with variants
export type BadgeProps = {
  children?: ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'outline';
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', textStyle, style }) => {
  const backgroundColor = variant === 'secondary' ? colors.gray200 : variant === 'success' ? colors.green600 : colors.gray200;
  const textColor = variant === 'secondary' ? colors.gray700 : colors.gray800;
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }, textStyle]}>{children}</Text>
    </View>
  );
};

// Simple Avatar; supports children (e.g., Text or Image) and size
export type AvatarProps = {
  children?: ReactNode;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const Avatar: React.FC<AvatarProps> = ({ children, size = 40, style }) => {
  const normalize = (nodes: ReactNode | ReactNode[] | string | number): ReactNode => {
    if (typeof nodes === 'string' || typeof nodes === 'number') return <Text>{nodes}</Text>;
    if (Array.isArray(nodes)) return nodes.map((n, i) => (typeof n === 'string' || typeof n === 'number') ? <Text key={i}>{n}</Text> : n);
    return nodes;
  };
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>{normalize(children)}</View>;
};

export const Button = ComponentsButton;

export const Input = ComponentsInput;

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm / 2,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
});

export default {
  Card,
  Badge,
  Avatar,
  Button,
  Input,
};
