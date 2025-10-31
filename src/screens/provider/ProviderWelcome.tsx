import React from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Platform } from 'react-native';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.lg }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg }}>
          <Text style={[{ color: colors.primary, fontSize: 28, fontWeight: '800' }, { marginBottom: spacing.xs }]}>HairConnekt</Text>
        <Text style={[typography.h2, { marginBottom: spacing.xs }]}>Werde Teil von HairConnekt</Text>
          <Text style={{ color: colors.gray600, textAlign: 'center' }}>Erreiche neue Kunden und wachse dein Business</Text>
        </View>

        {/* Benefits */}
        <View style={{ marginVertical: spacing.lg }}>
          {benefits.map((benefit, index) => (
            <View key={index} style={{ flexDirection: 'row', padding: spacing.md, borderRadius: radii.lg, backgroundColor: colors.gray50, alignItems: 'center', marginBottom: spacing.sm }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(139,69,19,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
                <Icon name={benefit.iconName} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', marginBottom: 2 }}>{benefit.title}</Text>
                <Text style={{ fontSize: 14, color: colors.gray600 }}>{benefit.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={{ paddingBottom: spacing.lg }}>
          <Button title="Als Anbieter anmelden" onPress={goLogin} style={{ height: 56, marginBottom: spacing.sm }} />
          <Pressable onPress={goRegister} style={{ alignItems: 'center', padding: spacing.sm }} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
            <Text style={{ color: colors.gray600 }}>
              Neu bei HairConnekt? <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>Jetzt registrieren</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
