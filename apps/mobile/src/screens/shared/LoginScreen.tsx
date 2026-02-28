import React, { useState } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, View, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Text from '../../components/Text';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Checkbox } from '../../components/checkbox';
import { colors, spacing } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import Icon from '../../components/Icon';

type UnauthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'client' | 'provider' } | undefined;
  AccountType: undefined;
};

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<UnauthStackParamList>>();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben.');
      return;
    }

    try {
      await login(email.trim(), password);
      // auth context state update will redirect automatically
    } catch (e: any) {
      Alert.alert('Fehler', e.response?.data?.message || e.message || 'Anmeldung fehlgeschlagen');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray100 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 4 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl }}>
            <Text color={colors.primary} style={{ fontSize: 32, fontWeight: '700', marginBottom: spacing.xs }}>HairConnekt</Text>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: spacing.xs }}>Willkommen zurück!</Text>
            <Text color={colors.gray600} style={{ fontSize: 16 }}>Melde dich an, um fortzufahren</Text>
          </View>

          <Card style={{ padding: spacing.xl }}>
            <View style={{ marginBottom: spacing.lg }}>
              <Input
                label="E-Mail oder Telefonnummer"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="max.mueller@email.com"
              />
            </View>

            <View style={{ marginBottom: spacing.md }}>
              <View style={{ position: 'relative' }}>
                <Input
                  label="Passwort"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                />
                <View style={{ position: 'absolute', right: 12, top: 38 }}>
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray400} />
                  </Pressable>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', marginTop: spacing.xs }}>
                <Pressable onPress={() => { /* Navigate to forgot password if exists */ }}>
                  <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>Passwort vergessen?</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl }}>
              <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
              <Text style={{ marginLeft: spacing.sm, color: colors.gray700 }}>Angemeldet bleiben</Text>
            </View>

            <Button
              title="Anmelden"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !email.trim() || !password}
            />

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.gray200 }} />
              <Text style={{ marginHorizontal: spacing.md, color: colors.gray500, fontSize: 14 }}>Oder anmelden mit</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.gray200 }} />
            </View>

            {/* Social Logins */}
            <Button
              title="Mit Google fortfahren"
              variant="outline"
              onPress={() => { }}
              style={{ marginBottom: spacing.md }}
            />
            <Button
              title="Mit Apple fortfahren"
              variant="outline"
              onPress={() => { }}
              style={{ backgroundColor: '#000', borderColor: '#000' }}
              textStyle={{ color: '#FFF' }}
            />
          </Card>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <Text style={{ color: colors.gray600 }}>
              Noch kein Konto?{' '}
              <Text
                style={{ color: colors.primary, fontWeight: '600' }}
                onPress={() => navigation.navigate('AccountType')}
              >
                Jetzt registrieren
              </Text>
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
