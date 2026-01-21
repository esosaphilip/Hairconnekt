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

import { Badge as ComponentsBadge } from '../components/badge';

// ... (other components)

export const Badge = ComponentsBadge;

// Re-export Avatar from components to ensure full functionality (source prop, etc.)
import { Avatar, AvatarImage, AvatarFallback } from '../components/avatar';
export { Avatar, AvatarImage, AvatarFallback };
export type { AvatarProps } from '../components/avatar';

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
  AvatarImage,
  AvatarFallback,
  Button,
  Input,
};
