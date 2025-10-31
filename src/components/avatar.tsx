import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, ImageStyle, ImageSourcePropType, TextStyle } from 'react-native';
import { colors } from '../theme/tokens';

export interface AvatarProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface AvatarImageProps {
  uri?: string;
  source?: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
}

export interface AvatarFallbackProps {
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Avatar(props: AvatarProps = {}) {
  const { size = 40, style, children } = props ?? {};
  return <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>{children}</View>;
}

export function AvatarImage(props: AvatarImageProps = {}) {
  const { uri, source, style } = props ?? {};
  const imgSource = source || (uri ? { uri } : undefined);
  if (!imgSource) return null;
  return <Image source={imgSource} style={[styles.image, style]} resizeMode="cover" />;
}

export function AvatarFallback(props: AvatarFallbackProps = {}) {
  const { label, style, textStyle } = props ?? {};
  return (
    <View style={[styles.fallback, style]}>
      {!!label && <Text style={[styles.fallbackText, textStyle]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray200,
  },
  fallbackText: {
    color: colors.gray700,
    fontWeight: '600',
  },
});

export default Avatar;
