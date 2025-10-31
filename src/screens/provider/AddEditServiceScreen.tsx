import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { Label } from '../../components/label';
import { Textarea } from '../../components/textarea';
import { Switch } from '../../components/switch';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const categories = [
  "Box Braids",
  "Knotless Braids",
  "Cornrows",
  "Senegalese Twists",
  "Passion Twists",
  "Locs",
  "Natural Hair Care",
  "Barber Services",
  "Other",
];

const durationOptions = [
  { value: 30, label: '30 Min.' },
  { value: 60, label: '1 Std.' },
  { value: 90, label: '1,5 Std.' },
  { value: 120, label: '2 Std.' },
  { value: 150, label: '2,5 Std.' },
  { value: 180, label: '3 Std.' },
  { value: 240, label: '4 Std.' },
  { value: 300, label: '5 Std.' },
  { value: 360, label: '6 Std.' },
];
export function AddEditServiceScreen() {
  // Best-effort detection: if running on web and URL contains 'edit', treat as editing
  const isEditing = useMemo(() => {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' && window.location.hash.includes('/provider/services/edit');
      } catch {}
    }
    return false;
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: 100,
    duration: 180,
    deposit: 20,
    isActive: true,
    allowOnlineBooking: true,
    requiresConsultation: false,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);

  const onBack = () => {
    // Placeholder navigation
    if (Platform.OS === 'web') {
      try { window.history.back(); } catch {}
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setMessage('Bitte einen Service-Namen eingeben');
      return;
    }
    if (!formData.category) {
      setMessage('Bitte eine Kategorie auswählen');
      return;
    }
    setMessage(isEditing ? 'Service aktualisiert! (placeholder)' : 'Service erstellt! (placeholder)');
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider/services'; } catch {}
    }
  };

  const incrementDeposit = (delta: number) => {
    setFormData((prev) => {
      const next = Math.min(100, Math.max(0, prev.deposit + delta));
      return { ...prev, deposit: next };
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} style={styles.iconBtn} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
            <Ionicons name="chevron-back" size={24} color={colors.black} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, typography.h3]}>{isEditing ? 'Service bearbeiten' : 'Neuer Service'}</Text>
            <Text style={styles.headerSubtitle}>{isEditing ? 'Aktualisiere deinen Service' : 'Füge einen neuen Service hinzu'}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Info */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Grundinformationen</Text>

          <View style={{ marginTop: spacing.sm }}>
            <Label>Service-Name *</Label>
            <Input
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              placeholder="z.B. 'Box Braids - Medium Length'"
              style={{ marginTop: 6 }}
            />
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Label>Kategorie *</Label>
            <Pressable onPress={() => setCategoryOpen(true)} style={styles.selectTrigger} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
              <Text style={[styles.selectText, !formData.category ? { color: colors.gray500 } : null]}>
                {formData.category || 'Kategorie wählen'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.gray500} />
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Label>Beschreibung</Label>
            <Textarea
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              placeholder="Beschreibe den Service, verwendete Techniken, etc."
              style={{ marginTop: 6, minHeight: 100 }}
            />
          </View>
        </Card>

        {/* Pricing & Duration */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Preis & Dauer</Text>

          <View style={{ marginTop: spacing.sm }}>
            <Label>Preis (€) *</Label>
            <View style={styles.inputWithIcon}>
              <Ionicons name="logo-euro" size={16} color={colors.gray400} style={{ marginRight: 8 }} />
              <Input
                keyboardType="numeric"
                value={String(formData.price)}
                onChangeText={(t) => {
                  const normalized = t.replace(',', '.');
                  const num = Number(normalized);
                  setFormData({ ...formData, price: isNaN(num) ? 0 : num });
                }}
                placeholder="Preis"
                style={{ flex: 1 }}
              />
            </View>
            <Text style={styles.mutedNote}>Kunden sehen diesen Preis bei der Buchung</Text>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Label>Dauer *</Label>
            <Pressable onPress={() => setDurationOpen(true)} style={styles.selectTrigger} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
              <Text style={styles.selectText}>
                {durationOptions.find((o) => o.value === formData.duration)?.label || 'Dauer wählen'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.gray500} />
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Label>Anzahlung (%)</Label>
            <View style={styles.depositRow}>
              <Button title="-" variant="ghost" onPress={() => incrementDeposit(-5)} />
              <Text style={{ marginHorizontal: spacing.md }}>{formData.deposit}%</Text>
              <Button title="+" variant="ghost" onPress={() => incrementDeposit(5)} />
              <View style={{ flex: 1 }} />
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {((formData.price * formData.deposit) / 100).toFixed(2)}€
              </Text>
            </View>
            <Text style={styles.mutedNote}>Kunden zahlen bei der Buchung eine Anzahlung</Text>
          </View>
        </Card>

        {/* Booking Settings */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Buchungseinstellungen</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Label>Service aktiv</Label>
              <Text style={styles.mutedNote}>Kunden können diesen Service buchen</Text>
            </View>
            <Switch value={formData.isActive} onValueChange={(v: boolean) => setFormData({ ...formData, isActive: v })} />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Label>Online-Buchung erlauben</Label>
              <Text style={styles.mutedNote}>Kunden können direkt online buchen</Text>
            </View>
            <Switch value={formData.allowOnlineBooking} onValueChange={(v: boolean) => setFormData({ ...formData, allowOnlineBooking: v })} />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Label>Beratung erforderlich</Label>
              <Text style={styles.mutedNote}>Kunden müssen zuerst eine Beratung buchen</Text>
            </View>
            <Switch value={formData.requiresConsultation} onValueChange={(v: boolean) => setFormData({ ...formData, requiresConsultation: v })} />
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons name="information-circle-outline" size={20} color="#2563EB" style={{ marginRight: spacing.sm, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoText}>Stelle sicher, dass deine Preise wettbewerbsfähig sind und deine tatsächlichen Kosten decken.</Text>
              <Text style={styles.infoText}>Die angegebene Dauer sollte realistisch sein, inkl. Vorbereitung und Nachbereitung.</Text>
            </View>
          </View>
        </Card>

        {/* Feedback message */}
        {message ? (
          <Text style={{ color: colors.primary, marginTop: spacing.sm, marginHorizontal: spacing.md }}>{message}</Text>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button title="Abbrechen" variant="ghost" onPress={onBack} style={{ flex: 1 }} />
          <View style={{ width: spacing.sm }} />
          <Button title={isEditing ? 'Speichern' : 'Service erstellen'} onPress={handleSubmit} style={{ flex: 1, backgroundColor: colors.primary }} />
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={categoryOpen} transparent animationType="fade" onRequestClose={() => setCategoryOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Kategorie wählen</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {categories.map((cat) => (
                <Pressable key={cat} style={styles.modalItem} onPress={() => { setFormData({ ...formData, category: cat }); setCategoryOpen(false); }}>
                  <Text style={{ color: colors.black }}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title="Abbrechen" variant="ghost" onPress={() => setCategoryOpen(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>

      {/* Duration Modal */}
      <Modal visible={durationOpen} transparent animationType="fade" onRequestClose={() => setDurationOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Dauer wählen</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {durationOptions.map((opt) => (
                <Pressable key={opt.value} style={styles.modalItem} onPress={() => { setFormData({ ...formData, duration: opt.value }); setDurationOpen(false); }}>
                  <Text style={{ color: colors.black }}>{opt.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title="Abbrechen" variant="ghost" onPress={() => setDurationOpen(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    marginBottom: 2,
    color: colors.black,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.gray600,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  mutedNote: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
  selectTrigger: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: colors.black,
  },
  depositRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  modalItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
});
