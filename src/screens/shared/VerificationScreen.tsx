import { useState, useMemo, useEffect } from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import type { PublicUser } from '@/auth/tokenStorage';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Text from '../../components/Text';
import { http } from '@/api/http';
import { spacing, colors } from '../../theme/tokens';

function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const base = (err as Record<string, unknown>).message;
    if (typeof base === 'string') return base;
    const resp = (err as Record<string, unknown>)['response'];
    if (resp && typeof resp === 'object') {
      const data = (resp as Record<string, unknown>)['data'];
      if (data && typeof data === 'object') {
        const msg = (data as Record<string, unknown>)['message'];
        if (typeof msg === 'string') return msg;
      }
    }
  }
  return fallback;
}

export function VerificationScreen() {
  // Be explicit about the shape returned by the auth context to avoid TS inferring `never`
  const auth = useAuth() as unknown as {
    user: PublicUser | null;
    setUser: (u: PublicUser) => Promise<void>;
  };
  const user: PublicUser | null = auth?.user || null;
  const setUser = (auth?.setUser || (async (_u: PublicUser) => {})) as (u: PublicUser) => Promise<void>;
  const navigation = useNavigation();
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  const needsEmail = !!user?.email && !user?.emailVerified;
  const needsPhone = !!user?.phone && !user?.phoneVerified;
  const allVerified = !!user?.emailVerified && (!!user?.phoneVerified || !user?.phone);

  const canSubmitEmail = useMemo(() => needsEmail && emailCode.length >= 6, [needsEmail, emailCode]);
  const canSubmitPhone = useMemo(() => needsPhone && phoneCode.length >= 6, [needsPhone, phoneCode]);

  const handleVerifyEmail = async () => {
    if (!user?.email) return;
    setLoadingEmail(true);
    try {
      await http.post('/auth/verify-email', { email: user.email, code: emailCode });
      // Merge current user with updated verification flag using explicit types
      const currentUser: Partial<PublicUser> = (user ?? {}) as Partial<PublicUser>;
      const nextUser: PublicUser = { ...currentUser, emailVerified: true } as PublicUser;
      await setUser(nextUser);
      Alert.alert('Erfolg', 'E-Mail erfolgreich verifiziert');
      setEmailCode('');
    } catch (e) {
      Alert.alert('Fehler', getErrorMessage(e, 'Verifizierung fehlgeschlagen'));
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!user?.phone) return;
    setLoadingPhone(true);
    try {
      await http.post('/auth/verify-phone', { phone: user.phone, code: phoneCode });
      // Merge current user with updated verification flag using explicit types
      const currentUser: Partial<PublicUser> = (user ?? {}) as Partial<PublicUser>;
      const nextUser: PublicUser = { ...currentUser, phoneVerified: true } as PublicUser;
      await setUser(nextUser);
      Alert.alert('Erfolg', 'Telefonnummer erfolgreich verifiziert');
      setPhoneCode('');
    } catch (e) {
      Alert.alert('Fehler', getErrorMessage(e, 'Verifizierung fehlgeschlagen'));
    } finally {
      setLoadingPhone(false);
    }
  };

  // Cooldown timers
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const id = setInterval(() => setEmailCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [emailCooldown]);
  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const id = setInterval(() => setPhoneCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [phoneCooldown]);

  const handleResendEmail = async () => {
    if (!user?.email || emailCooldown > 0) return;
    setLoadingEmail(true);
    try {
      await http.post('/auth/resend-verification', { email: user.email, channel: 'email' });
      Alert.alert('Erfolg', 'Code erneut gesendet an deine E-Mail');
      setEmailCooldown(60);
    } catch (e) {
      Alert.alert('Fehler', getErrorMessage(e, 'Erneutes Senden fehlgeschlagen'));
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleResendPhone = async () => {
    if (!user?.phone || phoneCooldown > 0) return;
    setLoadingPhone(true);
    try {
      await http.post('/auth/resend-verification', { phone: user.phone, channel: 'phone' });
      Alert.alert('Erfolg', 'Code erneut gesendet an deine Telefonnummer');
      setPhoneCooldown(60);
    } catch (e) {
      Alert.alert('Fehler', getErrorMessage(e, 'Erneutes Senden fehlgeschlagen'));
    } finally {
      setLoadingPhone(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Text variant="h3">Verifizierung</Text>
        <Button variant="ghost" title="Zurück" onPress={() => (typeof navigation.goBack === 'function' ? navigation.goBack() : undefined)} />
      </View>

      {allVerified ? (
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text variant="h3">Alles verifiziert</Text>
              <Text style={{ color: colors.gray600 }}>Dein Konto ist vollständig verifiziert.</Text>
            </View>
          </View>
        </Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {needsEmail && (
            <Card style={{ padding: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
                <Ionicons name="mail" size={20} color={colors.gray700} />
                <Text variant="h3">E-Mail verifizieren</Text>
              </View>
              <Text style={{ color: colors.gray600, marginBottom: spacing.sm }}>
                Bitte gib den 6-stelligen Code ein, der an {user?.email} gesendet wurde.
              </Text>
              <Input value={user?.email || ''} editable={false} style={{ marginBottom: spacing.sm }} />
              <Input
                placeholder="Code"
                keyboardType="number-pad"
                maxLength={6}
                value={emailCode}
                onChangeText={setEmailCode}
                style={{ marginBottom: spacing.md }}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={loadingEmail ? 'Wird verifiziert…' : 'E-Mail bestätigen'}
                    onPress={handleVerifyEmail}
                    disabled={!canSubmitEmail || loadingEmail}
                    loading={loadingEmail}
                  />
                </View>
                <Button
                  variant="ghost"
                  title={emailCooldown > 0 ? `Erneut senden (${emailCooldown}s)` : 'Code erneut senden'}
                  onPress={handleResendEmail}
                  disabled={loadingEmail || emailCooldown > 0}
                />
              </View>
              {__DEV__ && (
                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    variant="secondary"
                    title="Dev: Auto-verifizieren (000000)"
                    onPress={async () => {
                      setEmailCode('000000');
                      await handleVerifyEmail();
                    }}
                    disabled={loadingEmail}
                  />
                </View>
              )}
            </Card>
          )}

          {needsPhone && (
            <Card style={{ padding: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
                <Ionicons name="call" size={20} color={colors.gray700} />
                <Text variant="h3">Telefonnummer verifizieren</Text>
              </View>
              <Text style={{ color: colors.gray600, marginBottom: spacing.sm }}>
                Bitte gib den 6-stelligen Code ein, der an {user?.phone} gesendet wurde.
              </Text>
              <Input value={user?.phone || ''} editable={false} style={{ marginBottom: spacing.sm }} />
              <Input
                placeholder="Code"
                keyboardType="number-pad"
                maxLength={6}
                value={phoneCode}
                onChangeText={setPhoneCode}
                style={{ marginBottom: spacing.md }}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={loadingPhone ? 'Wird verifiziert…' : 'Telefon bestätigen'}
                    onPress={handleVerifyPhone}
                    disabled={!canSubmitPhone || loadingPhone}
                    loading={loadingPhone}
                  />
                </View>
                <Button
                  variant="ghost"
                  title={phoneCooldown > 0 ? `Erneut senden (${phoneCooldown}s)` : 'Code erneut senden'}
                  onPress={handleResendPhone}
                  disabled={loadingPhone || phoneCooldown > 0}
                />
              </View>
              {__DEV__ && (
                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    variant="secondary"
                    title="Dev: Auto-verifizieren (000000)"
                    onPress={async () => {
                      setPhoneCode('000000');
                      await handleVerifyPhone();
                    }}
                    disabled={loadingPhone}
                  />
                </View>
              )}
            </Card>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}