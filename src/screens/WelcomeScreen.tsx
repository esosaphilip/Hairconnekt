import React from 'react';
import { SafeAreaView, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../components/Text';
import Button from '../components/Button';
import Card from '../components/Card';
import { spacing } from '../theme/tokens';

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#8B4513' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg }}>
        {/* Logo & Branding */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ width: 128, height: 128, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, backgroundColor: '#ffffff' }}>
            <Ionicons name="cut" size={48} color="#8B4513" />
          </Card>
          <Text color="#ffffff" style={{ fontSize: 32, fontWeight: '700', marginBottom: spacing.sm }}>HairConnekt</Text>
          <Text color="#ffffff" style={{ fontSize: 18, marginBottom: spacing.xs }}>Ihr Friseur, Ihre Zeit</Text>
          <Text color="rgba(255,255,255,0.8)" style={{ textAlign: 'center', maxWidth: 320 }}>
            Verbinde dich mit den besten Friseuren, Salons und Barbieren in deiner Stadt
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ width: '100%' }}>
          <Button title="Anmelden" onPress={goLogin} />
          <Pressable
            onPress={goAccountType}
            style={{ width: '100%', paddingVertical: 14, borderWidth: 2, borderColor: '#ffffff', borderRadius: 12, alignItems: 'center', marginTop: spacing.md }}
          >
            <Text color="#ffffff" style={{ fontWeight: '600' }}>Als Anbieter registrieren</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={{ marginTop: spacing.lg }}>
          <Text color="rgba(255,255,255,0.6)" style={{ fontSize: 12 }}>© 2025 HairConnekt. Alle Rechte vorbehalten.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
