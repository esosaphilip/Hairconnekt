import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Badge } from '@/components/badge';
import { Switch } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';
import { useServices } from '@/presentation/hooks/useServices';
import { showError, showSuccess } from '@/presentation/utils/errorHandler';
import { MESSAGES } from '@/constants';
import type { Service } from '@/domain/entities/Service';

export function ServicesManagementScreen() {
  const navigation = useNavigation();
  const { services, loading, error, toggleServiceActive, deleteService } = useServices();

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
    rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderServicesScreen', params: { mode: 'add' } });
  };

  const onEditService = (id: string) => {
    rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderServicesScreen', params: { mode: 'edit', serviceId: id } });
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
          <Button title="Neu" onPress={onAddService} style={{ backgroundColor: colors.primary }} />
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

      <View style={styles.content}>
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
                            {service.category.nameDe || service.category.nameEn}
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
                            {service.category.nameDe || service.category.nameEn}
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
            <Button title="Service hinzufügen" onPress={onAddService} style={{ backgroundColor: colors.primary }} />
          </View>
        )}

        {!!error && (
          <Card style={{ padding: spacing.md }}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </Card>
        )}
        {loading && (
          <Card style={{ padding: spacing.md }}>
            <Text style={{ color: colors.gray600 }}>Lade Services...</Text>
          </Card>
        )}
      </View>
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
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
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
