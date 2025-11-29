import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext'; // Correct context path
import Text from '../../components/Text';

/**
 * A component to guard routes that require authentication in a React Native app
 * using React Navigation.
 *
 * It checks for a valid access token and, if not present, navigates the user
 * to the Login screen, replacing the current screen in the stack.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children components to render if authenticated.
 * @returns {React.ReactNode} The authenticated children or a redirection/loading state.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { tokens, loading } = useAuth();
  const navigation = useNavigation();

  // 1. Handle Loading State
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Use ActivityIndicator for a standard mobile loading spinner */}
        <ActivityIndicator size="large" color="#6B7280" />
        <Text style={styles.loadingText}>Laden...</Text>
      </View>
    );
  }

  // 2. Handle Unauthenticated State
  // The 'Navigate' component from react-router-dom is replaced by an effect that
  // dispatches a navigation action to replace the current screen.
  if (!tokens?.accessToken) {
    // We use a React.useEffect with an empty dependency array to ensure
    // the navigation happens only once on initial render if unauthenticated.
    React.useEffect(() => {
      // The StackActions.replace is equivalent to the 'replace' prop in the web 'Navigate'
      navigation.dispatch(
        StackActions.replace('Login', {
          // The returnUrl and userType are passed as route parameters
          returnUrl: 'Home', // In RN, you pass the screen name, not the path
          userType: 'client',
        })
      );
    }, [navigation]);

    // Return null while the navigation action takes effect to prevent
    // rendering the protected content momentarily.
    return null;
  }

  // 3. Render Children if Authenticated
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280', // Corresponds to 'text-gray-600'
  },
});