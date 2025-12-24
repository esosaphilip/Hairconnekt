import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { Textarea } from '@/components/textarea';
import { Switch } from 'react-native';
import { colors, spacing, radii, typography } from '@/theme/tokens';
import { http } from '@/api/http';
import { providersApi } from '@/services/providers';
import { logger } from '@/services/logger';
import { API_CONFIG, MESSAGES } from '@/constants';
import Picker from '@/components/Picker';
import { Slider } from '@/components/slider';

type CategoryItem = { id: string; nameDe?: string; name_en?: string; name_de?: string; name?: string };

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
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProviderMoreStackParamList } from '@/navigation/types';

type RouteParams = NativeStackScreenProps<ProviderMoreStackParamList, 'AddEditServiceScreen'>['route']['params'];

export function AddEditServiceScreen() {
  const route = useRoute();
  const params = (route?.params as RouteParams) || {};
  const serviceId = (params as any)?.serviceId as string | undefined;
  // Best-effort detection: if running on web and URL contains 'edit', treat as editing
  const isEditing = useMemo(() => {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' && window.location.hash.includes('/provider/services/edit');
      } catch {}
    }
    return !!serviceId;
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: 100,
    duration: 180,
    deposit: 0,
    isActive: true,
    allowOnlineBooking: true,
    requiresConsultation: false,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [durationOpen, setDurationOpen] = useState(false);

  const onBack = () => {
    // Placeholder navigation
    if (Platform.OS === 'web') {
      try { window.history.back(); } catch {}
    }
  };

  useEffect(() => {
    (async () => {
      if (!serviceId) return;
      try {
        const res = await http.get('/providers/me/services');
        const data = (res?.data && (res.data as any).data) ? (res.data as any).data : res?.data;
        const items: any[] = (data?.services ?? data?.items ?? []);
        const found = items.find((s: any) => String(s.id) === String(serviceId));
        if (found) {
          setFormData({
            name: String(found.name || ''),
            category: String(found?.category || ''),
            description: found?.description || '',
            price: typeof found.price === 'number' ? found.price : 100,
            duration: typeof found.duration === 'number' ? found.duration : 180,
            deposit: 0,
            isActive: !!found.isActive,
            allowOnlineBooking: true,
            requiresConsultation: false,
          });
        }
      } catch {}
    })();
  }, [serviceId]);

  useEffect(() => {
    const normalize = (raw: any): CategoryItem[] => {
      const arr = Array.isArray(raw) ? raw : (raw?.items ?? []);
      return (arr as any[]).map((c) => ({ id: String(c.id), nameDe: c.nameDe ?? c.name_de ?? c.name }));
    };
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        try {
          const res = await http.get('/services/categories', { params: { locale: 'de' } });
          const items = normalize(res?.data);
          if (items.length) { setCategories(items); return; }
        } catch {}
        try {
          const res = await http.get('/provider/services/categories', { params: { locale: 'de' } });
          const items = normalize(res?.data);
          if (items.length) { setCategories(items); return; }
        } catch {}
        try {
          const res = await http.get('/providers/services/categories', { params: { locale: 'de' } });
          const items = normalize(res?.data);
          if (items.length) { setCategories(items); return; }
        } catch {}
        try {
          const res = await http.get('/service-categories', { params: { locale: 'de' } });
          const items = normalize(res?.data);
          if (items.length) { setCategories(items); return; }
        } catch {}
        try {
          const res = await http.get('/categories', { params: { type: 'service', locale: 'de' } });
          const items = normalize(res?.data);
          if (items.length) { setCategories(items); return; }
        } catch {}
        setCategoriesError('Keine Kategorien gefunden.');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setMessage('Bitte einen Service-Namen eingeben');
      return;
    }
    if (!isEditing && !formData.category) {
      setMessage('Bitte wähle eine Kategorie');
      return;
    }

    setLoading(true);
    setError(null);

    const body: any = {
      name: formData.name,
      categoryId: formData.category,
      durationMinutes: Number(formData.duration || 0),
      priceCents: Math.round(Number(formData.price || 0) * 100),
      description: formData.description || undefined,
      isActive: !!formData.isActive,
      allowOnlineBooking: !!formData.allowOnlineBooking,
      requiresConsultation: !!formData.requiresConsultation,
    };

    try {
      if (isEditing && serviceId) {
        await http.patch(`/providers/me/services/${serviceId}`, body);
        setMessage('Dienst aktualisiert');
      } else {
        const res = await http.post('/providers/me/services', body);
        const msg = (res?.data && (res.data as any)?.data?.message) || 'Dienst gespeichert';
        setMessage(String(msg));
      }

      if (Platform.OS === 'web') {
        try { window.location.hash = '/provider/services'; } catch {}
      }
    } catch (err) {
      let msg = 'Ein Fehler ist aufgetreten.';
      if (typeof err === 'object' && err !== null) {
        const response = (err as Record<string, unknown>)['response'] as Record<string, unknown> | undefined;
        const data = response?.['data'] as Record<string, unknown> | undefined;
        const m = data?.['message'];
        if (typeof m === 'string') {
          msg = m;
        } else {
          const m2 = (err as Record<string, unknown>)['message'];
          if (typeof m2 === 'string') msg = m2;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
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
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, typography.h3]}>{isEditing ? 'Service bearbeiten' : 'Neuer Service'}</Text>
            <Text style={styles.headerSubtitle}>{isEditing ? 'Aktualisiere deinen Service' : 'Füge einen neuen Service hinzu'}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Info */}
        <Card style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Grundinformationen</Text>

          <View style={styles.mtSm}>
            <Text style={styles.label}>Service-Name *</Text>
            <Input
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              placeholder="z.B. 'Box Braids - Medium Length'"
              style={styles.inputMarginTop}
            />
          </View>

          <View style={styles.mtMd}>
            <Text style={styles.label}>Kategorie *</Text>
            {categoriesLoading ? (
              <Text style={styles.mutedNote}>Lade Kategorien…</Text>
            ) : (
            <Picker
                selectedValue={formData.category}
                onValueChange={(v: string) => setFormData({ ...formData, category: v })}
                items={[{ label: 'Kategorie wählen', value: '' }, ...categories.map((c) => ({ label: c.nameDe ?? 'Kategorie', value: (c.nameDe ?? c.name ?? '') }))]}
              />
            )}
            {categoriesError && <Text style={styles.feedbackError}>{categoriesError}</Text>}
          </View>

          <View style={styles.mtMd}>
            <Text style={styles.label}>Beschreibung</Text>
            <Textarea
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              placeholder="Beschreibe den Service, verwendete Techniken, etc."
              style={styles.textarea}
            />
          </View>
        </Card>

        {/* Pricing & Duration */}
        <Card style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Preis & Dauer</Text>

          <View style={styles.mtSm}>
            <Text style={styles.label}>Preis (€) *</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="logo-euro" size={16} color={colors.gray400} style={styles.iconRight} />
              <Input
                keyboardType="numeric"
                value={String(formData.price)}
                onChangeText={(t) => {
                  const normalized = t.replace(',', '.');
                  const num = Number(normalized);
                  setFormData({ ...formData, price: isNaN(num) ? 0 : num });
                }}
                placeholder="Preis"
                style={styles.flex1}
              />
            </View>
            <Text style={styles.mutedNote}>Kunden sehen diesen Preis bei der Buchung</Text>
          </View>

          <View style={styles.mtMd}>
            <Text style={styles.label}>Dauer *</Text>
            <Pressable onPress={() => setDurationOpen(true)} style={styles.selectTrigger} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
              <Text style={styles.selectText}>
                {durationOptions.find((o) => o.value === formData.duration)?.label || 'Dauer wählen'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.gray500} />
            </Pressable>
          </View>

          <View style={styles.mtMd}>
            <Text style={styles.label}>Anzahlung (%)</Text>
            <Slider value={formData.deposit} onValueChange={(v) => setFormData({ ...formData, deposit: v })} min={0} max={50} step={5} />
            <Text style={styles.mutedNote}>{formData.deposit}% Anzahlung   {((formData.price * formData.deposit) / 100).toFixed(2)}€</Text>
          </View>
        </Card>

        {/* Booking Settings */}
        <Card style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Buchungseinstellungen</Text>

          <View style={styles.switchRow}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Service aktiv</Text>
              <Text style={styles.mutedNote}>Kunden können diesen Service buchen</Text>
            </View>
            <Switch value={formData.isActive} onValueChange={(v: boolean) => setFormData({ ...formData, isActive: v })} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Online-Buchung erlauben</Text>
              <Text style={styles.mutedNote}>Kunden können direkt online buchen</Text>
            </View>
            <Switch value={formData.allowOnlineBooking} onValueChange={(v: boolean) => setFormData({ ...formData, allowOnlineBooking: v })} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Beratung erforderlich</Text>
              <Text style={styles.mutedNote}>Kunden müssen zuerst eine Beratung buchen</Text>
            </View>
            <Switch value={formData.requiresConsultation} onValueChange={(v: boolean) => setFormData({ ...formData, requiresConsultation: v })} />
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} style={styles.infoIcon} />
            <View style={styles.flex1}>
              <Text style={styles.infoText}>Stelle sicher, dass deine Preise wettbewerbsfähig sind und deine tatsächlichen Kosten decken.</Text>
              <Text style={styles.infoText}>Die angegebene Dauer sollte realistisch sein, inkl. Vorbereitung und Nachbereitung.</Text>
            </View>
          </View>
        </Card>

        {/* Feedback message */}
        {message && <Text style={styles.feedbackMessage}>{message}</Text>}
        {error && <Text style={styles.feedbackError}>{error}</Text>}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button title="Abbrechen" variant="ghost" onPress={onBack} style={styles.flex1} />
          <View style={styles.spacerSm} />
          <Button title={isEditing ? 'Speichern' : 'Service erstellen'} onPress={handleSubmit} style={styles.submitBtn} disabled={loading} />
        </View>
        {loading && <ActivityIndicator />}
      </ScrollView>

      {/* Category Modal removed in favor of Picker */}

      {/* Duration Modal */}
      <Modal visible={durationOpen} transparent animationType="fade" onRequestClose={() => setDurationOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.sectionTitle, styles.mbSm]}>Dauer wählen</Text>
            <ScrollView style={styles.modalScroll}>
              {durationOptions.map((opt) => (
                <Pressable key={opt.value} style={styles.modalItem} onPress={() => { setFormData({ ...formData, duration: opt.value }); setDurationOpen(false); }}>
                  <Text style={styles.modalItemText}>{opt.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title="Abbrechen" variant="ghost" onPress={() => setDurationOpen(false)} style={styles.mtSm} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  cardSection: {
    marginBottom: spacing.md,
  },
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  depositRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  feedbackError: {
    color: colors.error,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  feedbackMessage: {
    color: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerSpacer: {
    width: 24,
  },
  headerSubtitle: {
    color: colors.gray600,
    fontSize: 12,
  },
  headerTitle: {
    color: colors.black,
    marginBottom: 2,
  },
  iconBtn: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconRight: {
    marginRight: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
  },
  infoIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoText: {
    color: colors.infoText,
    fontSize: 13,
    marginBottom: 4,
  },
  inputMarginTop: {
    marginTop: 6,
  },
  inputWithIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  label: {
    color: colors.gray700,
    fontSize: 14,
    fontWeight: '500',
  },
  mbSm: {
    marginBottom: spacing.sm,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    maxWidth: 420,
    padding: spacing.md,
    width: '100%',
  },
  modalItem: {
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  modalItemText: {
    color: colors.black,
  },
  modalScroll: {
    maxHeight: 300,
  },
  mtMd: {
    marginTop: spacing.md,
  },
  mtSm: {
    marginTop: spacing.sm,
  },
  mutedNote: {
    color: colors.gray600,
    fontSize: 12,
    marginTop: 4,
  },
  mxMd: {
    marginHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  selectPlaceholderText: {
    color: colors.gray500,
  },
  selectText: {
    color: colors.black,
  },
  selectTrigger: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  spacerSm: {
    width: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  textarea: {
    marginTop: 6,
    minHeight: 100,
  },
  totalText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
