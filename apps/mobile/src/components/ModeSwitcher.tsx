import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '@/auth/AuthContext';
import { useUserMode } from '@/state/UserModeContext';
import { colors, spacing, radii, typography } from '@/theme/tokens';

export default function ModeSwitcher() {
  const { user } = useAuth();
  const { mode, setMode } = useUserMode();
  const show = String(user?.userType || '').toLowerCase() === 'both';
  if (!show) return null;
  return (
    <View style={styles.container}>
      <Pressable onPress={() => setMode('client')} style={[styles.pill, mode === 'client' ? styles.active : styles.inactive]}>
        <Text style={[styles.text, mode === 'client' ? styles.textActive : styles.textInactive]}>Kunde</Text>
      </Pressable>
      <Pressable onPress={() => setMode('provider')} style={[styles.pill, mode === 'provider' ? styles.active : styles.inactive]}>
        <Text style={[styles.text, mode === 'provider' ? styles.textActive : styles.textInactive]}>Anbieter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
    zIndex: 1000,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  active: {
    backgroundColor: colors.primary,
  },
  inactive: {
    backgroundColor: colors.gray100,
  },
  text: {
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  textActive: {
    color: colors.white,
  },
  textInactive: {
    color: colors.gray700,
  },
});

