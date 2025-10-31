import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { Home, Search, Calendar, MessageCircle, User } from "lucide-react-native";

// --- Configuration Data ---
const navItems = [
  { path: "Home", icon: Home, label: "Startseite", badge: 0 }, // Route names are used instead of URL paths
  { path: "Search", icon: Search, label: "Suchen", badge: 0 },
  { path: "Appointments", icon: Calendar, label: "Termine", badge: 2 },
  { path: "Messages", icon: MessageCircle, label: "Nachrichten", badge: 3 },
  { path: "Profile", icon: User, label: "Profil", badge: 0 },
];

// --- Refactored Component ---

export function BottomNavigation() {
  const navigation = useNavigation<any>();
  const route = useRoute(); // The current route object (used primarily for debugging/context in a sub-component)
  
  // Use navigation.getState() to reliably get the active route name
  // TypeScript-safe access to navigation state
  const state = (typeof (navigation as any).getState === 'function'
    ? (navigation as any).getState()
    : null) as any;
  const currentRouteName = state?.routes?.[state?.index]?.name ?? route.name;

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
          const Icon = item.icon;
          
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => handlePress(item.path)}
              style={styles.navItem}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  size={24} // w-6 h-6
                  color={isActive ? "#8B4513" : "#9CA3AF"} // brown / gray-400
                  strokeWidth={isActive ? 2 : 1.5}
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
  safeArea: {
    // Ensures the nav bar sticks to the bottom edge and is above the home indicator
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // border-gray-200
    // In a real app, this component would be placed outside the main screen view
    // or defined as part of a Tab Navigator, making the following styles unnecessary:
    // position: 'absolute', 
    // bottom: 0, 
    // left: 0, 
    // right: 0,
    zIndex: 50,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64, // h-16
    paddingHorizontal: 8,
    // The border-t is moved to the SafeAreaView above
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4, // -top-1
    right: -4, // -right-1
    backgroundColor: '#FF6B6B', // Red badge color
    borderRadius: 8, // Half of w/h
    width: 16, // w-4
    height: 16, // h-4
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10, // text-xs
    color: '#fff',
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 12, // text-xs
    marginTop: 4, // mt-1
    // RN handles transitions implicitly with state changes on press/touch
  },
  labelTextActive: {
    color: '#8B4513', // brown
    fontWeight: '600',
  },
  labelTextInactive: {
    color: '#9CA3AF', // gray-400
  },
});