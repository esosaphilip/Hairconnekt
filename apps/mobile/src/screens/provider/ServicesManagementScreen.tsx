import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Alert, ScrollView, KeyboardAvoidingView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Picker from '@/components/Picker';
import Textarea from '@/components/textarea';
import { Badge } from '@/components/badge';
import { Switch } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';
import { http } from '@/api/http';
import { useServices } from '@/presentation/hooks/useServices';
import { showError, showSuccess } from '@/presentation/utils/errorHandler';
import { MESSAGES } from '@/constants';
import type { Service } from '@/domain/entities/Service';

export function ServicesManagementScreen() {
  const navigation = useNavigation();
  const { services, loading, error, toggleServiceActive, deleteService, createService, loadServices } = useServices();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadServices();
    }, [loadServices])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  }, [loadServices]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [manualCategoryId, setManualCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ id: string; nameDe?: string; name_de?: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const defaultCategoryNames = [
    'Box Braids',
    'Knotless Braids',
    'Cornrows',
    'Senegalese Twists',
    'Passion Twists',
    'Locs',
    'Natural Hair Care',
    'Barber Services',
    'Other',
  ];

  useEffect(() => {
    const normalize = (raw: any): Array<{ id: string; nameDe?: string; name_de?: string }> => {
      const arr = Array.isArray(raw) ? raw : (raw?.items ?? []);
      return (arr as any[]).map((c) => ({ id: String(c.id), nameDe: c.nameDe ?? c.name_de ?? c.name }));
    };
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        // Single dedicated call as per Master Solution Contract
        // Path: /providers/me/services/categories (http client adds base URL /api/v1)
        const res = await http.get('/providers/me/services/categories', { params: { locale: 'de' } });
        const items = normalize(res?.data);
        if (items.length) {
          setCategories(items);
        } else {
          // Fallback only if array is empty but call succeeded? Or just show error?
          // Contract says "Replace it with exactly one call". I will respect that.
          if (items.length === 0) setCategoriesError('Keine Kategorien gefunden.');
        }
      } catch (err) {
        console.log('[ServicesManagement] Category Fetch Error:', err);
        setCategoriesError('Kategorien konnten nicht geladen werden.');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const activeServices = useMemo(() => services.filter(s => s.isActive), [services]);
  const inactiveServices = useMemo(() => services.filter(s => !s.isActive), [services]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} Min.`;
    if (mins === 0) return `${hours} Std.`;
    return `${hours} Std. ${mins} Min.`;
  };

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  const handleToggleService = async (service: Service) => {
    try {
      await toggleServiceActive(service.id, !service.isActive);
      showSuccess(MESSAGES.SUCCESS.SAVE);
    } catch (err: unknown) {
      showError(err);
    }
  };

  const handleDeleteService = async (service: Service) => {
    Alert.alert(
      'Service löschen',
      `Möchtest du "${service.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(service.id);
              showSuccess(MESSAGES.SUCCESS.SERVICE_DELETE);
            } catch (err: unknown) {
              showError(err);
            }
          },
        },
      ]
    );
  };

  const onBack = () => {
    navigation.goBack();
  };

  const onAddService = () => {
    setAdding(true);
  };

  const onEditService = (id: string) => {
    rootNavigationRef.current?.navigate('Mehr', { screen: 'AddEditServiceScreen', params: { serviceId: id } });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onPress={onBack} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.black} />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>Services verwalten</Text>
              <Text style={styles.headerSubtitle}>{activeServices.length} aktive Services</Text>
            </View>
          </View>
          <Button title="Neu" onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'AddEditServiceScreen', params: { serviceId: null } })} style={{ backgroundColor: colors.primary }} />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statBlock}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{services.length}</Text>
          <Text style={styles.statCaption}>Gesamt</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{activeServices.length}</Text>
          <Text style={styles.statCaption}>Aktiv</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statNumber, { color: colors.gray400 }]}>{inactiveServices.length}</Text>
          <Text style={styles.statCaption}>Inaktiv</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
        <ScrollView
          contentContainerStyle={styles.contentScrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {adding && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Neuen Service hinzufügen</Text>
              <View style={{ gap: spacing.sm }}>
                <View>
                  <Text style={styles.label}>Service-Kategorie *</Text>
                  {categoriesLoading ? (
                    <Text style={{ color: colors.gray600 }}>Kategorien werden geladen…</Text>
                  ) : (
                    <Picker
                      selectedValue={categories.length ? selectedCategoryId : selectedCategoryName}
                      onValueChange={(v: string) => {
                        if (categories.length) setSelectedCategoryId(v);
                        else setSelectedCategoryName(v);
                      }}
                      items={
                        [{ label: 'Kategorie wählen...', value: '' }].concat(
                          categories.length
                            ? categories.map((cat) => ({ label: cat.nameDe ?? cat.name_de ?? 'Kategorie', value: cat.id }))
                            : defaultCategoryNames.map((name) => ({ label: name, value: name }))
                        )
                      }
                    />
                  )}
                  {categoriesError && (
                    <View style={{ marginTop: spacing.xs }}>
                      <Text style={{ color: colors.error }}>{categoriesError}</Text>
                      <View style={{ flexDirection: 'row', marginTop: spacing.xs }}>
                        <Button title="Neu laden" variant="outline" onPress={() => {
                          setCategoriesError(null);
                          setCategoriesLoading(true);
                          // trigger reload by calling the same effect logic
                          (async () => {
                            try {
                              const res = await http.get('/providers/me/services/categories', { params: { locale: 'de' } });
                              const arr = Array.isArray(res?.data) ? res.data : (res?.data?.items ?? []);
                              const items = (arr as any[]).map((c) => ({ id: String(c.id), nameDe: c.nameDe ?? c.name_de ?? c.name }));
                              setCategories(items);
                            } catch { }
                            setCategoriesLoading(false);
                          })();
                        }} />
                      </View>
                    </View>
                  )}
                  {/* Fallback ID input removed to keep flow simple */}
                </View>
                <View>
                  <Text style={styles.label}>Name *</Text>
                  <Input value={name} onChangeText={setName} placeholder="z. B. Box Braids" />
                </View>
                <View>
                  <Text style={styles.label}>Preis (in €) *</Text>
                  <Input keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'} value={price} onChangeText={setPrice} placeholder="z. B. 55" />
                </View>
                <View>
                  <Text style={styles.label}>Dauer (Minuten) *</Text>
                  <Input keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'} value={duration} onChangeText={setDuration} placeholder="z. B. 60" />
                </View>
                <View>
                  <Text style={styles.label}>Beschreibung (optional)</Text>
                  <Textarea value={description} onChangeText={setDescription} placeholder="Kurzbeschreibung" numberOfLines={3} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.label}>Aktiv</Text>
                  <Switch value={active} onValueChange={setActive} />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button
                    title="Speichern"
                    onPress={async () => {
                      if (!name.trim()) {
                        Alert.alert('Fehler', 'Bitte einen Namen eingeben');
                        return;
                      }
                      const finalCategoryId = selectedCategoryId;
                      if (categories.length > 0 && !finalCategoryId) {
                        Alert.alert('Fehler', 'Bitte wähle eine Kategorie');
                        return;
                      }
                      const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100) || 0;
                      const durationMinutes = parseInt(duration, 10) || 60;
                      if (priceCents <= 0) {
                        Alert.alert('Fehler', 'Bitte einen gültigen Preis eingeben');
                        return;
                      }
                      if (durationMinutes <= 0) {
                        Alert.alert('Fehler', 'Bitte eine gültige Dauer eingeben');
                        return;
                      }
                      try {
                        setSaving(true);
                        await createService({ name: name.trim(), description: description.trim() || undefined, priceCents, durationMinutes, isActive: active, categoryId: finalCategoryId || undefined });
                        setAdding(false);
                        setName('');
                        setPrice('');
                        setDuration('60');
                        setDescription('');
                        setActive(true);
                        setSelectedCategoryId('');
                        setManualCategoryId('');
                        showSuccess(MESSAGES.SUCCESS.SAVE);
                      } catch (err: unknown) {
                        const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : 'Fehler beim Speichern');
                        if (typeof msg === 'string' && msg.includes('must be a number')) {
                          // Suppress technical validation errors with user friendly one
                          Alert.alert('Fehler', 'Bitte überprüfe deine Eingaben (Preis und Dauer müssen Zahlen sein)');
                        } else if (typeof msg === 'string' && msg.includes('priceCents must not be less than')) {
                          Alert.alert('Fehler', 'Ungültiger Preis oder Dauer');
                        } else {
                          // Only show if not a 500 error
                          if ((err as any)?.response?.status !== 500) {
                            Alert.alert('Fehler', typeof msg === 'string' ? msg : 'Service konnte nicht gespeichert werden');
                          } else {
                            Alert.alert('Fehler', 'Service konnte nicht gespeichert werden. Bitte versuche es später erneut.');
                          }
                        }
                      } finally {
                        setSaving(false);
                      }
                    }}
                    style={{ backgroundColor: colors.primary, flex: 1 }}
                  />
                  <Button title="Abbrechen" variant="outline" onPress={() => setAdding(false)} style={{ flex: 1 }} />
                </View>
                {saving ? <Text style={{ color: colors.gray600 }}>Speichern...</Text> : null}
              </View>
            </Card>
          )}
          {/* Active Services */}
          {activeServices.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={styles.sectionTitle}>Aktive Services</Text>
              <View>
                {activeServices.map((service) => (
                  <Card key={service.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleRow}>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          {service.category ? (
                            <Badge variant="outline" style={{ marginLeft: spacing.sm }}>
                              {service.category?.nameDe ?? 'Allgemein'}
                            </Badge>
                          ) : null}
                        </View>
                        {!!service.description && (
                          <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                        )}
                      </View>
                      <Switch value={service.isActive} onValueChange={() => handleToggleService(service)} />
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="logo-euro" size={16} color={colors.black} />
                        <Text style={styles.metaText}>{service.priceCents != null ? formatPrice(service.priceCents) : '-'}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={16} color={colors.black} />
                        <Text style={styles.metaText}>{formatDuration(service.durationMinutes || 0)}</Text>
                      </View>
                    </View>

                    <View style={styles.actionsRow}>
                      <Button title="Bearbeiten" variant="ghost" onPress={() => onEditService(service.id)} style={{ flex: 1 }} />
                      <Button title="Löschen" variant="ghost" onPress={() => handleDeleteService(service)} style={{ marginLeft: spacing.sm }} />
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )}

          {/* Inactive Services */}
          {inactiveServices.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[styles.sectionTitle, { color: colors.gray600 }]}>Inaktive Services</Text>
              <View>
                {inactiveServices.map((service) => (
                  <Card key={service.id} style={[styles.card, { opacity: 0.6 }]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleRow}>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          {service.category ? (
                            <Badge variant="outline" style={{ marginLeft: spacing.sm }}>
                              {service.category?.nameDe ?? 'Allgemein'}
                            </Badge>
                          ) : null}
                        </View>
                        {!!service.description && (
                          <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                        )}
                      </View>
                      <Switch value={service.isActive} onValueChange={() => handleToggleService(service)} />
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="logo-euro" size={16} color={colors.black} />
                        <Text style={styles.metaText}>{service.priceCents != null ? formatPrice(service.priceCents) : '-'}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={16} color={colors.black} />
                        <Text style={styles.metaText}>{formatDuration(service.durationMinutes || 0)}</Text>
                      </View>
                    </View>

                    <View style={styles.actionsRow}>
                      <Button title="Bearbeiten" variant="ghost" onPress={() => onEditService(service.id)} style={{ flex: 1 }} />
                      <Button title="Löschen" variant="ghost" onPress={() => handleDeleteService(service)} style={{ marginLeft: spacing.sm }} />
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {services.length === 0 && !loading && !error && (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="add" size={48} color={colors.gray400} />
              </View>
              <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Noch keine Services</Text>
              <Text style={{ color: colors.gray600, textAlign: 'center', marginBottom: spacing.md }}>
                Füge deine ersten Services hinzu, damit Kunden dich buchen können
              </Text>
              <Button title="Service hinzufügen" onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'AddEditServiceScreen', params: { serviceId: null } })} style={{ backgroundColor: colors.primary }} />
            </View>
          )}

          {!!error && (
            <Card style={{ padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.error, marginBottom: spacing.md, textAlign: 'center' }}>{error}</Text>
              <Button title="Erneut versuchen" onPress={onRefresh} style={{ backgroundColor: colors.primary, minWidth: 120 }} />
            </Card>
          )}
          {loading && (
            <Card style={{ padding: spacing.md }}>
              <Text style={{ color: colors.gray600 }}>Lade Services...</Text>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    paddingBottom: spacing.xl,
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
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.gray600,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  statCaption: {
    fontSize: 12,
    color: colors.gray600,
  },
  contentScrollContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  flex1: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.black,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.black,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  serviceDesc: {
    fontSize: 13,
    color: colors.gray600,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    marginLeft: 4,
    color: colors.black,
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg * 2,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});
