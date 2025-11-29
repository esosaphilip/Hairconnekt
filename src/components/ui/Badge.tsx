import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Badge({ text, color = '#6B7280', style }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
