import React from 'react';
import { Text as RNText } from 'react-native';
import type { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { colors, typography } from '../theme/tokens';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export default function Text(props: TextProps = {}) {
  const { variant = 'body', style, color: colorOverride, ...rest } = props ?? {};
  const base = (typography as Record<TextVariant, TextStyle>)[variant] || typography.body;
  return <RNText {...rest} style={[{ color: colorOverride || colors.black }, base, style]} />;
}