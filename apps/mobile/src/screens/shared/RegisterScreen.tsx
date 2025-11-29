import React, { useMemo, useState } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Text from '../../components/Text';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import { Checkbox } from '../../components/checkbox';
import { colors, spacing } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';

type UnauthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'client' | 'provider' } | undefined;
  AccountType: undefined;
};

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<UnauthStackParamList>>();
  const route = useRoute<RouteProp<UnauthStackParamList, 'Register'>>();
  const params = route?.params;
  const userType = params?.userType === 'provider' ? 'PROVIDER' : 'CLIENT';

  const { register: registerUser, loading, error } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s += 25;
    if (/[A-Z]/.test(password)) s += 25;
    if (/[0-9]/.test(password)) s += 25;
    if (/[^A-Za-z0-9]/.test(password)) s += 25;
    return s;
  }, [password]);

  const canSubmit = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.includes('@') &&
      phone.trim() &&
      password.length >= 8 &&
      password === confirmPassword &&
      acceptTerms &&
      !loading
    );
  }, [firstName, lastName, email, phone, password, confirmPassword, acceptTerms, loading]);

  const onSubmit = async () => {
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError('Passwörter stimmen nicht überein');
      return;
    }
    if (!acceptTerms) {
      setLocalError('Bitte akzeptiere die AGB');
      return;
    }
    try {
      await registerUser({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        userType,
      });
      // After successful registration, the root navigator will switch to the authenticated Tabs automatically
    } catch (e) {
      setLocalError((e as Error)?.message || 'Registrierung fehlgeschlagen');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 4 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md }}>
            <Text color={colors.primary} style={{ fontWeight: '700', marginBottom: spacing.xs }}>HairConnekt</Text>
            <Text style={{ fontWeight: '700', marginBottom: spacing.xs }}>Willkommen bei HairConnekt</Text>
            <Text color={colors.gray600}>Erstelle dein Konto</Text>
          </View>

          <Card>
            {/* Name */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Input label="Vorname *" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Input label="Nachname *" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </View>

            {/* Email */}
            <View style={{ marginTop: spacing.md }}>
              <Input label="E-Mail *" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>

            {/* Phone */}
            <View style={{ marginTop: spacing.md }}>
              <Input label="Telefonnummer *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="151 1234 5678" />
            </View>

            {/* Password */}
            <View style={{ marginTop: spacing.md }}>
              <Text style={{ marginBottom: 6, color: colors.gray700, fontWeight: '600' }}>Passwort *</Text>
              <View style={{ position: 'relative' }}>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 12, top: 12 }}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray400} />
                </Pressable>
              </View>

              {password.length > 0 ? (
                <View style={{ marginTop: spacing.sm }}>
                  <View style={{ height: 6, borderRadius: 9999, backgroundColor: '#00000015', overflow: 'hidden' }}>
                    <View style={{ width: `${strength}%`, height: '100%', backgroundColor: colors.primary }} />
                  </View>
                  <View style={{ marginTop: spacing.sm }}>
                    <Text color={/[A-Z]/.test(password) ? colors.success : colors.gray500}>1 Großbuchstabe</Text>
                    <Text color={/[0-9]/.test(password) ? colors.success : colors.gray500}>1 Zahl</Text>
                    <Text color={password.length >= 8 ? colors.success : colors.gray500}>Min. 8 Zeichen</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={{ marginTop: spacing.md }}>
              <Text style={{ marginBottom: 6, color: colors.gray700, fontWeight: '600' }}>Passwort wiederholen *</Text>
              <View style={{ position: 'relative' }}>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable onPress={() => setShowConfirmPassword((v) => !v)} style={{ position: 'absolute', right: 12, top: 12 }}>
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray400} />
                </Pressable>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword ? (
                <Text color={colors.error} style={{ marginTop: spacing.xs }}>Passwörter stimmen nicht überein</Text>
              ) : null}
            </View>

            {/* Terms and newsletter */}
            <View style={{ marginTop: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Checkbox checked={acceptTerms} onCheckedChange={setAcceptTerms} />
                <Text style={{ marginLeft: spacing.sm }}>Ich akzeptiere die AGB und Datenschutzerklärung</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
                <Checkbox checked={newsletter} onCheckedChange={setNewsletter} />
                <Text color={colors.gray600} style={{ marginLeft: spacing.sm }}>Newsletter und Angebote erhalten (optional)</Text>
              </View>
            </View>

            {(localError || error) ? (
              <Text color={colors.error} style={{ marginTop: spacing.md }}>{localError || error}</Text>
            ) : null}

            <Button title={loading ? 'Wird erstellt…' : 'Konto erstellen'} onPress={onSubmit} disabled={!canSubmit} loading={loading} style={{ marginTop: spacing.lg }} />
          </Card>

          {/* Separator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.gray200 }} />
            <Text color={colors.gray500} style={{ marginHorizontal: spacing.sm }}>Oder registrieren mit</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.gray200 }} />
          </View>

          {/* Social login */}
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            <Button
              variant="outline"
              onPress={() => { /* TODO: implement Google signup */ }}
              style={{ backgroundColor: colors.white, borderColor: colors.gray300 }}
              textStyle={{ color: colors.black, fontWeight: '600' }}
              icon={<Icon name="logo-google" size={20} color={colors.black} />}
            >
              Mit Google fortfahren
            </Button>

            <Button
              variant="outline"
              disabled
              onPress={() => { /* TODO: implement Apple signup */ }}
              style={{ backgroundColor: colors.white, borderColor: colors.gray300, marginTop: spacing.sm, opacity: 0.6 }}
              textStyle={{ color: colors.black, fontWeight: '600' }}
              icon={<Icon name="logo-apple" size={20} color={colors.black} />}
            >
              Mit Apple fortfahren
            </Button>
          </View>

          {/* Login link */}
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl }}>
            <Pressable onPress={() => { navigation.navigate('Login'); }}>
              <Text color={colors.gray600}>Bereits registriert? <Text color={colors.primary} style={{ fontWeight: '600' }}>Anmelden</Text></Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
