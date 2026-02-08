import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Modal, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { Textarea } from '@/components/textarea';
import { Switch } from 'react-native';
import { colors, spacing, radii, typography } from '@/theme/tokens';
import { http } from '@/api/http';
import { providersApi } from '@/services/providers';
import { clientBraiderApi } from '@/api/clientBraider';
import { logger } from '@/services/logger';
import { API_CONFIG, MESSAGES, HAIR_CATEGORIES } from '@/constants';
import Picker from '@/components/Picker';
import { Slider } from '@/components/slider';

type CategoryItem = { id: string; nameDe?: string; name_en?: string; name_de?: string; name?: string; tags?: string[] };

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
  { value: 360, label: '6 Std.' },
];

import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProviderMoreStackParamList } from '@/navigation/types';

type RouteParams = NativeStackScreenProps<ProviderMoreStackParamList, 'AddEditServiceScreen'>['route']['params'];


export function AddEditServiceScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = (route?.params as RouteParams) || {};
  const serviceId = (params as any)?.serviceId as string | undefined;

  // Track if we are currently saving to prevent double-save or save-after-submit
  const isSavingRef = useRef(false);
  // Track if the form was manually submitted to skip auto-save
  const wasSubmittedRef = useRef(false);

  // Best-effort detection: if running on web and URL contains 'edit', treat as editing
  const isEditing = useMemo(() => {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' && window.location.hash.includes('/provider/services/edit');
      } catch { }
    }
    return !!serviceId;
  }, [serviceId]);

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
    tags: [] as string[],
    imageUrl: '' as string | undefined,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCategoriesLoading(true);
        // Fetch valid categories from backend
        const cats = await clientBraiderApi.getCategories();
        console.log('[AddEditService] Loaded categories:', cats.length);

        if (mounted) {
          // Map to format needed by picker and hydrate tags from local constants
          const mapped = cats.map(c => {
            // Try to find matching local category for tags (backend doesn't store tags yet)
            // Match by slug (e.g. 'braids') vs legacy ID ('cat_braids')
            const localMatch = HAIR_CATEGORIES.find(
              lc => lc.id === `cat_${c.slug}` || lc.name.toLowerCase() === c.name.toLowerCase()
            );

            return {
              id: c.id,
              name: c.name || 'Unbekannt',
              tags: localMatch?.tags || [],
              slug: c.slug
            };
          });
          setCategories(mapped);
        }
      } catch (err) {
        console.warn('Failed to load categories', err);
        setCategoriesError('Kategorien konnten nicht geladen werden');


      } finally {
        if (mounted) setCategoriesLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Keep a ref to formData for the cleanup effect
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
    wasSubmittedRef.current = false; // Reset submitted flag on any change
  }, [formData]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [durationOpen, setDurationOpen] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung fehlt', 'Wir benötigen Zugriff auf deine Fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      uploadServiceImage(selectedUri);
    }
  };

  const uploadServiceImage = async (uri: string) => {
    try {
      setUploadingImage(true);

      const { url } = await providersApi.uploadServiceImage(uri);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (e: any) {
      console.error('Service image upload failed', e);
      Alert.alert('Upload fehlgeschlagen', e.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setUploadingImage(false);
    }
  };

  const onBack = async () => {
    // 1. Check if we should save
    const currentData = formData;
    const hasName = !!currentData.name.trim();
    const hasCategory = !!currentData.category;
    const isClean = wasSubmittedRef.current;

    if (!isClean && hasName && hasCategory && !isSavingRef.current) {
      console.log('[AutoSave] Saving before exit...');
      isSavingRef.current = true;
      try {
        const body: any = {
          name: currentData.name,
          categoryId: currentData.category,
          durationMinutes: Number(currentData.duration || 0),
          priceCents: Math.round(Number(currentData.price || 0) * 100),
          description: currentData.description || undefined,
          isActive: !!currentData.isActive,
          allowOnlineBooking: !!currentData.allowOnlineBooking,
          requiresConsultation: !!currentData.requiresConsultation,
          tags: currentData.tags || [],
          imageUrl: currentData.imageUrl,
        };

        if (isEditing && serviceId) {
          await http.patch(`/providers/me/services/${serviceId}`, body);
          console.log('[AutoSave] Update successful');
        } else {
          await http.post('/providers/me/services', body);
          console.log('[AutoSave] Creation successful');
        }
      } catch (err) {
        console.warn('[AutoSave] Failed', err);
      } finally {
        isSavingRef.current = false;
      }
    }

    if (Platform.OS === 'web') {
      try { window.history.back(); } catch { }
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  useEffect(() => {
    (async () => {
      if (!serviceId) return;
      try {
        const res = await http.get('/providers/me/services');
        const data = (res?.data && (res.data as any).data) ? (res.data as any).data : res?.data;
        const items: any[] = (data?.services ?? data?.items ?? (Array.isArray(data) ? data : []));
        const found = items.find((s: any) => String(s.id) === String(serviceId));

        if (found) {
          // Extract category ID if it's an object
          let catId = '';
          if (found.category && typeof found.category === 'object') {
            catId = found.category.id || '';
          } else if (found.categoryId) {
            catId = found.categoryId;
          } else {
            catId = String(found.category || '');
          }

          // Prioritize priceCents and durationMinutes
          const priceVal = found.priceCents !== undefined
            ? found.priceCents / 100
            : (typeof found.price === 'number' ? found.price : 100);

          const durationVal = found.durationMinutes !== undefined
            ? found.durationMinutes
            : (typeof found.duration === 'number' ? found.duration : 60);

          setFormData({
            name: String(found.name || ''),
            category: catId,
            description: found.description || '',
            price: priceVal,
            duration: durationVal,
            deposit: found.deposit !== undefined ? found.deposit : 0,
            isActive: found.isActive !== undefined ? !!found.isActive : true,
            allowOnlineBooking: found.allowOnlineBooking !== undefined ? !!found.allowOnlineBooking : true,
            requiresConsultation: !!found.requiresConsultation,
            tags: Array.isArray(found.tags) ? found.tags : [],
            imageUrl: found.imageUrl || '',
          });
        }
      } catch (err) {
        console.warn('Failed to load service details', err);
      }
    })();
  }, [serviceId]);

  // Determine active category from the fetched list
  const activeCategory = categories.find(c => c.id === formData.category);

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setMessage('Bitte einen Service-Namen eingeben');
      return;
    }
    if (!formData.category) {
      setMessage('Bitte wähle eine Kategorie');
      return;
    }

    setLoading(true);
    setError(null);
    wasSubmittedRef.current = true; // Mark as submitted to prevent auto-save from running


    const body: any = {
      name: formData.name,
      categoryId: formData.category,
      durationMinutes: Number(formData.duration || 0),
      priceCents: Math.round(Number(formData.price || 0) * 100),
      description: formData.description || undefined,
      isActive: !!formData.isActive,
      allowOnlineBooking: !!formData.allowOnlineBooking,
      requiresConsultation: !!formData.requiresConsultation,
      tags: formData.tags,
      imageUrl: formData.imageUrl,
    };

    try {
      if (isEditing && serviceId) {
        await http.patch(`/providers/me/services/${serviceId}`, body);
        setMessage('Dienst aktualisiert');
        // Small delay to ensure state is settled before navigation
        setTimeout(() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('ServicesManagementScreen' as never);
        }, 500);
      } else {
        const res = await http.post('/providers/me/services', body);
        // Accept 200 or 201. Check for ID in various locations just to be safe.
        const responseData = res.data;
        const createdId = responseData?.id || responseData?.data?.id || responseData?.serviceId;

        if (res.status === 200 || res.status === 201) {
          const msg = (responseData?.message) || (responseData?.data?.message) || 'Dienst gespeichert';
          setMessage(String(msg));
          // Small delay to ensure state is settled before navigation
          setTimeout(() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('ServicesManagementScreen' as never);
          }, 500);
        } else {
          throw new Error('Unerwartete Antwort vom Server');
        }
      }

      if (Platform.OS === 'web') {
        try {
          // Optional: still keep hash for web dev, but navigation above should handle it
          // window.location.hash = '/provider/services'; 
        } catch { }
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
        <Card style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Service Bild</Text>
          <View style={[styles.mtSm, { alignItems: 'center' }]}>
            <Pressable onPress={handleImagePick} style={styles.imageUploadBox}>
              {formData.imageUrl ? (
                <Image source={{ uri: formData.imageUrl }} style={styles.uploadedImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera-outline" size={32} color={colors.gray400} />
                  <Text style={styles.placeholderText}>Bild hinzufügen</Text>
                </View>
              )}
              {uploadingImage && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
            </Pressable>
            {formData.imageUrl && (
              <Button
                title="Bild ändern"
                variant="ghost"
                onPress={handleImagePick}
                style={{ marginTop: spacing.xs }}
                disabled={uploadingImage}
              />
            )}
          </View>
        </Card>

        {/* Basic Info */}
        <Card style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Grundinformationen</Text>

          <View style={styles.mtSm}>
            <Text style={styles.label}>Service-Name *</Text>
            <Input
              testID="service-name-input"
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
                testID="category-picker"
                selectedValue={formData.category}
                onValueChange={(v: string) => {
                  console.log('[AddEditService] Category selected:', v);
                  setFormData({ ...formData, category: v, tags: [] });
                }}
                items={[
                  { label: 'Kategorie wählen', value: '' },
                  ...categories.map((c) => ({ label: c.name || 'Unbekannt', value: c.id }))
                ]}
              />
            )}
            {/* Tags Selection */}
            {activeCategory && Array.isArray(activeCategory.tags) && activeCategory.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={styles.subLabel}>Spezialisierungen (Optional)</Text>
                <View style={styles.tagsRow}>
                  {(activeCategory.tags || []).map(tag => {
                    const isSelected = formData.tags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
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
                testID="service-price-input"
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
            <Pressable testID="duration-selector" onPress={() => setDurationOpen(true)} style={styles.selectTrigger} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
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
          <Button testID="service-submit-button" title={isEditing ? 'Speichern' : 'Service erstellen'} onPress={handleSubmit} style={styles.submitBtn} disabled={loading} />
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
  tagsContainer: {
    marginTop: spacing.md,
  },
  subLabel: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: 8,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: colors.gray700,
  },
  tagTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  imageUploadBox: {
    width: '100%',
    height: 180,
    backgroundColor: colors.gray100,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
