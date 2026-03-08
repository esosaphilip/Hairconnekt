import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import IconButton from '../../components/IconButton';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { providerVouchersApi } from '../../api/providerVouchers';
import { http } from '@/api/http';

export function CreateEditVoucherScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route && route.params) ? route.params : {};
  const isEdit = (params as any)?.id && typeof ((params as any)?.id) === 'string';
  const voucherId = (params as any)?.id;

  const [code, setCode] = useState((params as any)?.code || '');
  const [title, setTitle] = useState((params as any)?.title || '');
  const [description, setDescription] = useState((params as any)?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!code.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Code ein');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        code: code.trim(),
        title: title.trim(),
        description: description.trim(),
        // Defaults for required fields that aren't in this UI yet
        type: 'percentage' as const, 
        discountValue: 10,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimits: { totalUses: 100, usesPerClient: 1 }
      };

      const { id } = route.params || {} as any;
      if (id) {
          await http.put(`/providers/me/vouchers/${id}`, payload);
      } else {
          await http.post('/providers/me/vouchers', payload);
      }
      Alert.alert('Erfolg', id ? 'Gutschein aktualisiert.' : 'Gutschein erstellt.');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Fehler beim Speichern';
      Alert.alert('Fehler', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>{isEdit ? 'Gutschein bearbeiten' : 'Gutschein erstellen'}</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.label}>Code</Text>
          <Input value={code} onChangeText={setCode} placeholder="z. B. NEUKUNDE20" />

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Titel</Text>
          <Input value={title} onChangeText={setTitle} placeholder="Kurzbeschreibung" />

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Beschreibung</Text>
          <Input value={description} onChangeText={setDescription} placeholder="Details zum Angebot" />

          <View style={styles.actionsRow}>
            <Button
              title="Abbrechen"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={{ flex: 1 }}
            />
            <Button
              title={isEdit ? 'Speichern' : 'Erstellen'}
              icon="check"
              onPress={handleSave}
              disabled={loading}
              style={{ flex: 1, marginLeft: SPACING.sm }}
            />
          </View>
        </Card>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    padding: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateEditVoucherScreen;
