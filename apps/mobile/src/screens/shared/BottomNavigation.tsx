import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import Icon from "../../components/Icon";
import { colors } from "../../theme/tokens";

// --- Configuration Data ---
const navItems = [
  { path: "Home", iconName: "home", label: "Startseite", badge: 0 },
  { path: "Search", iconName: "search", label: "Suchen", badge: 0 },
  { path: "Appointments", iconName: "calendar", label: "Termine", badge: 2 },
  { path: "Messages", iconName: "chatbubbles", label: "Nachrichten", badge: 3 },
  { path: "Profile", iconName: "person", label: "Profil", badge: 0 },
];

// --- Refactored Component ---

export function BottomNavigation() {
  const navigation = useNavigation();
  const route = useRoute(); // The current route object (used primarily for debugging/context in a sub-component)
  
  // Use navigation.getState() to reliably get the active route name
  // TypeScript-safe access to navigation state
  const state = (typeof navigation.getState === 'function'
    ? navigation.getState()
    : null);
  // Avoid optional chaining with bracket element access (?.[]) which can break some parsers.
  // Safely derive the current route name using defensive checks in plain JS.
  let currentRouteName;
  if (state && Array.isArray(state.routes)) {
    const idx = typeof state.index === 'number' ? state.index : -1;
    const routeObj = idx >= 0 ? state.routes[idx] : undefined;
    if (routeObj && typeof routeObj.name === 'string') {
      currentRouteName = routeObj.name;
    }
  }
  currentRouteName = currentRouteName || (route && route.name) || undefined;

  const handlePress = (targetPath: string) => {
    // Navigate to the desired screen, resetting the navigation state to ensure
    // the tab behavior (e.g., navigating back to the root of that tab stack)
    navigation.dispatch(
      CommonActions.navigate({ name: targetPath })
    );
  };

  return (
    // SafeAreaView ensures content is below the bottom safe area (home indicator on iOS)
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = currentRouteName === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => handlePress(item.path)}
              style={styles.navItem}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  name={item.iconName}
                  size={24}
                  color={isActive ? colors.primary : colors.gray400}
                />
                {item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.labelText,
                  isActive ? styles.labelTextActive : styles.labelTextInactive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

const styles = StyleSheet.create({
  navContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  safeArea: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray200,
    borderTopWidth: 1,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 12,
    marginTop: 4, // mt-1
    // RN handles transitions implicitly with state changes on press/touch
  },
  labelTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  labelTextInactive: {
    color: colors.gray400,
  },
});