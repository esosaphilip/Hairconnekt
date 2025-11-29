import React from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Platform, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const benefits = [
  { iconName: 'people-outline', title: 'Mehr Kunden erreichen', description: 'Wachse dein Business mit neuen Kunden' },
  { iconName: 'calendar-outline', title: 'Termine einfach verwalten', description: 'Alles an einem Ort organisiert' },
  { iconName: 'shield-outline', title: 'Sichere Zahlungen', description: 'Garantierte Auszahlungen' },
  { iconName: 'flash-outline', title: 'Flexibles Arbeiten', description: 'Arbeite wann und wo du willst' },
];

export function ProviderWelcome() {
  const goLogin = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/login?userType=provider&returnUrl=%2Fprovider%2Fdashboard'; } catch {}
    } else {
      console.log('Navigate to /login with userType=provider');
    }
  };

  const goRegister = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider-onboarding/type'; } catch {}
    } else {
      console.log('Navigate to /provider-onboarding/type');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.brand}>HairConnekt</Text>
          <Text style={styles.title}>Werde Teil von HairConnekt</Text>
          <Text style={styles.subtitle}>Erreiche neue Kunden und wachse dein Business</Text>
        </View>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefit}>
              <View style={styles.benefitIconContainer}>
                <Icon name={benefit.iconName} size={22} color={colors.primary} />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          <Button title="Als Anbieter anmelden" onPress={goLogin} style={styles.button} />
          <Pressable onPress={goRegister} style={styles.registerButton} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
            <Text style={styles.registerText}>
              Neu bei HairConnekt? <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>Jetzt registrieren</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  benefit: {
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: radii.lg,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  benefitDescription: {
    color: colors.gray600,
    fontSize: 14,
  },
  benefitIconContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(139,69,19,0.1)',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  benefitsContainer: {
    marginVertical: spacing.lg,
  },
  brand: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  button: {
    height: 56,
    marginBottom: spacing.sm,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  ctaContainer: {
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  registerButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  registerLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  registerText: {
    color: colors.gray600,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  subtitle: {
    color: colors.gray600,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
});