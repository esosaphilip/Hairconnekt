import React from 'react';
import { SafeAreaView, View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Card from '@/components/Card';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { colors, spacing } from '@/theme/tokens';

type UnauthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'client' | 'provider' } | undefined;
  AccountType: undefined;
  ProviderRegistration: undefined;
};

export default function AccountTypeSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<UnauthStackParamList>>();

  const goToLogin = () => {
    // Proceed to client registration
    navigation.navigate('Register', { userType: 'client' });
  };

  const goToProviderOnboarding = () => {
    // Route to comprehensive provider registration flow
    navigation.navigate('ProviderRegistration');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text color={colors.primary} style={styles.logoTitle}>HairConnekt</Text>
        <Text color={colors.gray600}>Verbinde dich mit deinem perfekten Style</Text>
      </View>

      {/* Account Type Cards */}
      <View style={styles.flexFill}>
        <Pressable onPress={goToLogin} style={styles.pressableFullWidth}>
          <Card style={styles.cardPadding}>
            <View style={styles.centeredRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="search" size={40} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Ich suche einen Braider</Text>
              <Text color={colors.gray600} style={styles.cardSubtitle}>
                Finde und buche talentierte Braider in deiner Nähe
              </Text>
            </View>
          </Card>
        </Pressable>

        <Pressable testID="account-type-provider" onPress={goToProviderOnboarding} style={styles.cardSpacer}>
          <Card style={styles.cardPadding}>
            <View style={styles.centeredRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="briefcase" size={40} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Ich biete Friseur-Services an</Text>
              <Text color={colors.gray600} style={styles.cardSubtitle}>
                Erreiche mehr Kunden und verwalte deine Termine
              </Text>
            </View>
          </Card>
        </Pressable>
      </View>

      {/* Skip Option */}
      <Button title="Später entscheiden" variant="ghost" onPress={() => { navigation.navigate('Login'); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardPadding: { padding: spacing.xl },
  cardSpacer: { marginTop: spacing.md, width: '100%' },
  cardSubtitle: { textAlign: 'center' },
  cardTitle: { fontWeight: '700', marginBottom: spacing.xs },
  centeredRow: { alignItems: 'center' },
  container: { backgroundColor: colors.white, flex: 1, padding: spacing.lg },
  flexFill: { flex: 1 },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 9999,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 80,
  },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.xl },
  logoTitle: { fontWeight: '700', marginBottom: spacing.xs },
  pressableFullWidth: { width: '100%' },
});
