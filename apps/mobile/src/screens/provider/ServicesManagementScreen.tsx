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
import { clientBraiderApi } from '@/api/clientBraider';
import { useServices } from '@/presentation/hooks/useServices';
import { showError, showSuccess } from '@/presentation/utils/errorHandler';
import { MESSAGES, HAIR_CATEGORIES } from '@/constants';
import type { Service } from '@/domain/entities/Service';

export function ServicesManagementScreen() {
  const navigation = useNavigation();
  const { services, loading, error, toggleServiceActive, deleteService, createService, loadServices } = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    clientBraiderApi.getCategories().then(setCategories).catch(err => console.error('Failed to load categories', err));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('[ServicesManagementScreen] Screen focused, loading services...');
      loadServices();
    }, [loadServices]) // loadServices comes from useServices and should be stable
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  }, [loadServices]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Legacy inline-add state removed/simplified
  // All addition happens via navigation to AddEditScreen now


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

  const isValidUuid = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const handleToggleService = async (service: Service) => {
    if (!isValidUuid(service.id)) {
      Alert.alert('Ungültige Service-ID', `Dieser Service hat eine ungültige ID (${service.id}) und kann nicht aktualisiert werden.`);
      return;
    }
    try {
      await toggleServiceActive(service.id, !service.isActive);
      showSuccess(MESSAGES.SUCCESS.SAVE);
    } catch (err: unknown) {
      showError(err);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!isValidUuid(service.id)) {
      Alert.alert('Ungültige Service-ID', `Dieser Service hat eine ungültige ID (${service.id}) und kann nicht gelöscht werden.`);
      return;
    }
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
    // Navigate strictly to new screen
    rootNavigationRef.current?.navigate('Mehr', { screen: 'AddEditServiceScreen', params: { serviceId: null } });
  };

  const onEditService = (id: string) => {
    if (!isValidUuid(id)) {
      Alert.alert('Ungültige Service-ID', `Dieser Service hat eine ungültige ID (${id}) und kann nicht bearbeitet werden.`);
      return;
    }
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

          {/* Legacy inline 'adding' form removed */}
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
                          {service.categoryId ? (
                            <Badge variant="outline" style={{ marginLeft: spacing.sm }}>
                              {categories.find(c => c.id === service.categoryId)?.name ?? HAIR_CATEGORIES.find(c => c.id === service.categoryId)?.name ?? service.categoryId}
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
                          {service.categoryId ? (
                            <Badge variant="outline" style={{ marginLeft: spacing.sm }}>
                              {categories.find(c => c.id === service.categoryId)?.name ?? HAIR_CATEGORIES.find(c => c.id === service.categoryId)?.name ?? service.categoryId}
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
