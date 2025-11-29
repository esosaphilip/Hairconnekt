import React from 'react';
import { SafeAreaView, View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { spacing, colors } from '../../theme/tokens';

import { Ionicons } from '@expo/vector-icons';

// A simple placeholder for the logo
const Logo = () => (
  <View style={styles.logoContainer}>
    <Ionicons name="cut" size={80} color={colors.primary} />
  </View>
);

export default function WelcomeScreen() {
  const navigation = useNavigation() as { navigate: (route: string, params?: unknown) => void; goBack?: () => void };

  const goLogin = () => {
    navigation.navigate('Login');
  };

  const goAccountType = () => {
    navigation.navigate('AccountType');
  };

  const goProviderLogin = () => {
    // When the user chooses provider login, pass an expectedUserType flag.
    navigation.navigate('Login', { expectedUserType: 'provider', returnUrl: '/provider/dashboard' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Logo />
          <Text variant="h1" style={styles.title}>HairConnekt</Text>
          <Text style={styles.subtitle}>Ihr Friseur, Ihre Zeit</Text>
          <Text style={styles.description}>
            Verbinde dich mit den besten Friseuren, Salons und Barbieren in deiner Stadt
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Als Kunde anmelden" onPress={goLogin} style={styles.button} />
          <Button title="Als Anbieter anmelden" onPress={goProviderLogin} variant="secondary" style={styles.button} />
          <Pressable onPress={goAccountType} style={styles.registerButton}>
            <Text color={colors.white}>Noch kein Konto? <Text style={styles.bold}>Registrieren</Text></Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 HairConnekt. Alle Rechte vorbehalten.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    marginBottom: spacing.md,
  },
  container: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  description: {
    color: colors.white,
    maxWidth: 320,
    opacity: 0.8,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.6,
  },
  header: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    height: 128,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 128,
  },
  registerButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.white,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.white,
    marginBottom: spacing.sm,
  },
});
