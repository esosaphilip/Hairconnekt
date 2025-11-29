import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import IconButton from '../../components/IconButton';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

export function CreateEditVoucherScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route && route.params) ? route.params : {};
  const isEdit = typeof ((params as any)?.id) === 'number';

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
              onPress={() => {
                // TODO: Wire to backend: POST /providers/vouchers or PUT /providers/vouchers/:id
                navigation.goBack();
              }}
              style={{ flex: 1, marginLeft: SPACING.sm }}
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  card: {
    padding: SPACING.md,
  },
  content: {
    padding: SPACING.md,
  },
  flexContainer: {
    backgroundColor: COLORS.background || '#F9FAFB',
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
    marginBottom: SPACING.xs,
  },
});

export default CreateEditVoucherScreen;
