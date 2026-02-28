import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import { clientUserApi } from '@/api/clientUser';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import { colors, spacing, radii } from '@/theme/tokens';

export function DeleteAccountScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const [understood, setUnderstood] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  const canDelete = understood && confirmationText.trim().toUpperCase() === 'LÖSCHEN' && !loading;

  const handleDelete = async () => {
    if (!canDelete) return;

    setLoading(true);
    try {
      await clientUserApi.deleteAccount();
      await logout();

      Alert.alert(
        'Erfolg',
        'Dein Konto wurde erfolgreich gelöscht.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error?.message || 'Dein Konto konnte nicht gelöscht werden. Bitte versuche es später erneut.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.iconContainer}>
          <Icon name="alert-triangle" size={48} color={colors.error} />
        </View>

        <Text style={styles.title}>Konto löschen</Text>

        <Text style={styles.warningText}>
          Wenn du dein Konto löschst, werden alle deine Daten dauerhaft entfernt. Dies schließt folgende Informationen ein:
        </Text>

        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Profildaten</Text>
          <Text style={styles.bulletItem}>• Buchungshistorie</Text>
          <Text style={styles.bulletItem}>• Portfolio-Fotos</Text>
          <Text style={styles.bulletItem}>• Zahlungsinformationen</Text>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setUnderstood(!understood)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, understood && styles.checkboxChecked]}>
            {understood && <Icon name="check" size={16} color={colors.white} />}
          </View>
          <Text style={styles.checkboxLabel}>
            Ich verstehe, dass diese Aktion nicht rückgängig gemacht werden kann.
          </Text>
        </TouchableOpacity>

        <Text style={styles.inputLabel}>
          Bitte tippe <Text style={{ fontWeight: '700' }}>LÖSCHEN</Text> ein, um zu bestätigen:
        </Text>
        <TextInput
          placeholder="LÖSCHEN"
          value={confirmationText}
          onChangeText={setConfirmationText}
          autoCapitalize="characters"
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.actions}>
          <Button
            title={loading ? "Löscht..." : "Konto endgültig löschen"}
            onPress={handleDelete}
            disabled={!canDelete}
            style={[styles.deleteButton, !canDelete && styles.deleteButtonDisabled]}
            textStyle={styles.deleteButtonText}
          />
          <Button
            title="Abbrechen"
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  warningText: {
    fontSize: 16,
    color: colors.gray700,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  bulletList: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  bulletItem: {
    fontSize: 15,
    color: colors.gray800,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    backgroundColor: colors.red50,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.red200,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.error,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.red900,
    fontWeight: '500',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.xl,
    color: colors.gray900,
  },
  actions: {
    gap: spacing.md,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderWidth: 0,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.red200,
  },
  deleteButtonText: {
    color: colors.white,
  },
});