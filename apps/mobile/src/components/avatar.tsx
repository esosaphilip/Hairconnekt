import React from 'react';
import { Image, View, Text, StyleSheet, StyleProp, ViewStyle, ImageProps, TextStyle, ImageSourcePropType, ImageStyle } from 'react-native';
import { colors } from '../theme/tokens';

export type AvatarProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  source?: ImageSourcePropType;
};

/**
 * Basic Avatar container
 */
export function Avatar({ size = 40, style, children, source }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {source && <AvatarImage source={source} size={size} />}
      {children}
    </View>
  );
}

export type AvatarImageProps = ImageProps & {
  size?: number;
  style?: StyleProp<ImageStyle>;
  uri?: string;
  source?: ImageSourcePropType;
};

import { BASE_URL } from '../config';

/**
 * Avatar image
 */
export function AvatarImage({ size, style, uri, source, ...rest }: AvatarImageProps) {
  const dim = size ?? 40;

  // Handle relative URLs (from local backend storage)
  let finalUri = uri;
  if (finalUri && typeof finalUri === 'string' && finalUri.startsWith('/')) {
    finalUri = `${BASE_URL}${finalUri}`;
  }

  return (
    <Image
      {...rest}
      source={finalUri ? { uri: finalUri } : source}
      style={[styles.image, { borderRadius: dim / 2, height: dim, width: dim }, style]}
    />
  );
}

export type AvatarFallbackProps = {
  label?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Fallback when no image is available
 */
export function AvatarFallback({ label = '', size = 40, style, textStyle }: AvatarFallbackProps) {
  const initials = label ? label.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '';
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.fallbackText, textStyle]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.gray300,
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  fallbackText: {
    color: colors.gray700,
    fontWeight: '600',
  },
  image: {
    resizeMode: 'cover',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});

export default Avatar;