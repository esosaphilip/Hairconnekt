import React from 'react';
import { SafeAreaView, View, Pressable, StyleSheet, Image } from 'react-native';
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
  const navigation = useNavigation();

  const goLogin = () => {
    // @ts-ignore
    navigation.navigate('Login');
  };

  const goAccountType = () => {
    // @ts-ignore
    navigation.navigate('AccountType');
  };

  const goProviderLogin = () => {
    // When the user chooses provider login, pass an expectedUserType flag.
    // @ts-ignore
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
            <Text color={colors.white}>Noch kein Konto? <Text style={{ fontWeight: 'bold' }}>Registrieren</Text></Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  logoContainer: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    maxWidth: 320,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.md,
  },
  registerButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});