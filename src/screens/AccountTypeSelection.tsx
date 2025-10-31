import React from 'react';
import { SafeAreaView, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Card from '../components/Card';
import Text from '../components/Text';
import Button from '../components/Button';
import { spacing } from '../theme/tokens';

type UnauthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'client' | 'provider' } | undefined;
  AccountType: undefined;
};

export default function AccountTypeSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<UnauthStackParamList>>();

  const goToLogin = () => {
    // Proceed to client registration
    navigation.navigate('Register', { userType: 'client' });
  };

  const goToProviderOnboarding = () => {
    // Temporarily route providers to the simple register screen
    navigation.navigate('Register', { userType: 'provider' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', padding: spacing.lg }}>
      {/* Logo */}
      <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl }}>
        <Text color="#8B4513" style={{ fontWeight: '700', marginBottom: spacing.xs }}>HairConnekt</Text>
        <Text color="#6b7280">Verbinde dich mit deinem perfekten Style</Text>
      </View>

      {/* Account Type Cards */}
      <View style={{ flex: 1 }}>
        <Pressable onPress={goToLogin} style={{ width: '100%' }}>
          <Card style={{ padding: spacing.xl }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 80, height: 80, borderRadius: 9999, backgroundColor: 'rgba(139,69,19,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
                <Ionicons name="search" size={40} color="#8B4513" />
              </View>
              <Text style={{ fontWeight: '700', marginBottom: spacing.xs }}>Ich suche einen Braider</Text>
              <Text color="#6b7280" style={{ textAlign: 'center' }}>
                Finde und buche talentierte Braider in deiner Nähe
              </Text>
            </View>
          </Card>
        </Pressable>

        <Pressable onPress={goToProviderOnboarding} style={{ width: '100%', marginTop: spacing.md }}>
          <Card style={{ padding: spacing.xl }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 80, height: 80, borderRadius: 9999, backgroundColor: 'rgba(139,69,19,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
                <Ionicons name="briefcase" size={40} color="#8B4513" />
              </View>
              <Text style={{ fontWeight: '700', marginBottom: spacing.xs }}>Ich biete Friseur-Services an</Text>
              <Text color="#6b7280" style={{ textAlign: 'center' }}>
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
