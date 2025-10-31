import React, { useState } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import Text from '../components/Text';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { spacing } from '../theme/tokens';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [emailOrPhone, setId] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = emailOrPhone.trim().length > 0 && password.length >= 6 && !loading;

  const onSubmit = async () => {
    setLocalError(null);
    try {
      await login(emailOrPhone.trim(), password);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setLocalError(errMsg || 'Login failed');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
        <Text variant="h1" style={{ textAlign: 'center', marginBottom: spacing.md }}>Anmelden</Text>
        <Card style={{ width: '100%' }}>
          <Input
            label="E-Mail oder Telefonnummer"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={emailOrPhone}
            onChangeText={setId}
            style={{ marginBottom: spacing.md }}
          />
          <Input
            label="Passwort"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ marginBottom: spacing.md }}
          />
          {(localError || error) && (
            <Text color="#F44336" style={{ marginBottom: spacing.md, textAlign: 'center' }}>{localError || error}</Text>
          )}
          <Button title="Einloggen" onPress={onSubmit} loading={loading} disabled={!canSubmit} />
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}