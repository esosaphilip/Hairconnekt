import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export function Avatar({ source, size = 40, style, fallbackText }) {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (source?.uri) {
    return (
      <Image
        source={source}
        style={[styles.avatar, avatarStyle, style]}
        defaultSource={require('../../assets/default-avatar.png')}
      />
    );
  }

  return (
    <View style={[styles.fallbackAvatar, avatarStyle, style]}>
      <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
        {fallbackText?.charAt(0)?.toUpperCase() || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#F3F4F6',
  },
  fallbackAvatar: {
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
