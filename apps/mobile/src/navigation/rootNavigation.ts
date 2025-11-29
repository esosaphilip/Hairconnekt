import { createNavigationContainerRef } from '@react-navigation/native';

// Shared root navigation ref used across the app to allow nested screens
// to perform imperative navigation (e.g., after logout or via web hash routing).
// This ensures all navigations target the same NavigationContainer instance.
export const rootNavigationRef = createNavigationContainerRef<any>();