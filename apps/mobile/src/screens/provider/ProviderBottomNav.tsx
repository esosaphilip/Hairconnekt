import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme/tokens';

type NavItem = {
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: number;
};

type ProviderBottomNavProps = {
  activePath?: string;
  onNavigate?: (path: string) => void;
  style?: any;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/provider/dashboard', icon: 'grid-outline', label: 'Dashboard' },
  { path: '/provider/calendar', icon: 'calendar-outline', label: 'Termine', badge: 5 },
  { path: '/provider/clients', icon: 'people-outline', label: 'Kunden' },
  { path: '/provider/messages', icon: 'chatbubble-ellipses-outline', label: 'Nachrichten', badge: 3 },
  { path: '/provider/more', icon: 'menu-outline', label: 'Mehr' },
];

export function ProviderBottomNav({ activePath = '/provider/dashboard', onNavigate, style }: ProviderBottomNavProps) {
  return (
    <View style={[styles.container, style]}
      // Accessibility role analogous to a navigation bar (RN supports 'menu')
      accessibilityRole={Platform.OS === 'web' ? 'menu' : undefined}
    >
      <View style={styles.row}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path;
          const tint = isActive ? colors.primary : colors.gray400;

          return (
            <Pressable
              key={item.path}
              onPress={() => {
                if (onNavigate) onNavigate(item.path);
                else if (Platform.OS === 'web') {
                  // Shallow fallback for web preview without react-router: update hash
                  try {
                    window.location.hash = item.path;
                  } catch {}
                }
              }}
              style={styles.tabItem}
              accessibilityRole={Platform.OS === 'web' ? 'link' : undefined}
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={24} color={tint} />
                {!!item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color: tint }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
    right: -10,
    top: -6,
    width: 16,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 12,
    textAlignVertical: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray200,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 50,
  },
  iconWrap: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    position: 'relative',
    width: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
});
