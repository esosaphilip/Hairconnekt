import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import { Switch } from '../../components/switch';
import { colors, spacing, typography } from '../../theme/tokens';

// Mock services data
const mockServices = [
  {
    id: "1",
    name: "Box Braids - Medium Length",
    category: "Box Braids",
    price: 120,
    duration: 240,
    isActive: true,
    description: "Klassische Box Braids in mittlerer Länge",
  },
  {
    id: "2",
    name: "Knotless Braids - Long",
    category: "Knotless Braids",
    price: 180,
    duration: 300,
    isActive: true,
    description: "Schonende Knotless Braids in langer Länge",
  },
  {
    id: "3",
    name: "Cornrows - Simple Pattern",
    category: "Cornrows",
    price: 60,
    duration: 120,
    isActive: true,
    description: "Einfache Cornrows in verschiedenen Mustern",
  },
  {
    id: "4",
    name: "Senegalese Twists - Shoulder Length",
    category: "Twists",
    price: 140,
    duration: 270,
    isActive: true,
    description: "Elegante Senegalese Twists",
  },
  {
    id: "5",
    name: "Passion Twists",
    category: "Passion Twists",
    price: 150,
    duration: 240,
    isActive: false,
    description: "Moderne Passion Twists mit natürlichem Look",
  },
  {
    id: "6",
    name: "Starter Locs",
    category: "Locs",
    price: 100,
    duration: 180,
    isActive: true,
    description: "Starter Locs für natürliches Haar",
  },
];

export function ServicesManagementScreen() {

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} Min.`;
    if (mins === 0) return `${hours} Std.`;
    return `${hours} Std. ${mins} Min.`;
  };

  const toggleServiceStatus = (id: string) => {
    console.log('Service status toggled (placeholder):', id);
  };

  const handleDelete = (id: string) => {
    console.log('Service deleted (placeholder):', id);
  };

  const activeServices = mockServices.filter(s => s.isActive);
  const inactiveServices = mockServices.filter(s => !s.isActive);

  const onBack = () => {
    if (Platform.OS === 'web') {
      try { window.history.back(); } catch {}
    }
  };

  const onAddService = () => {
    console.log('Navigate to /provider/services/add (placeholder)');
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider/services/add'; } catch {}
    }
  };

  const onEditService = (id: string) => {
    console.log('Navigate to /provider/services/edit/' + id + ' (placeholder)');
    if (Platform.OS === 'web') {
      try { window.location.hash = `/provider/services/edit/${id}`; } catch {}
    }
  };

  const onDeleteServicePress = (service: { id: string; name: string }) => {
    if (Platform.OS === 'web') {
      // Simple confirmation on web preview
      if (confirm(`Service löschen?\n\nMöchtest du "${service.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
        handleDelete(service.id);
      }
      return;
    }
    handleDelete(service.id);
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
          <Text style={[styles.statNumber, { color: colors.primary }]}>{mockServices.length}</Text>
          <Text style={styles.statCaption}>Gesamt</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statNumber, { color: '#16A34A' }]}>{activeServices.length}</Text>
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
                        <Badge variant="outline" style={{ marginLeft: spacing.sm }}>{service.category}</Badge>
                      </View>
                      <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                    </View>
                    <Switch value={service.isActive} onValueChange={() => toggleServiceStatus(service.id)} />
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="logo-euro" size={16} color={colors.black} />
                      <Text style={styles.metaText}>{service.price}€</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={colors.black} />
                      <Text style={styles.metaText}>{formatDuration(service.duration)}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <Button title="Bearbeiten" variant="ghost" onPress={() => onEditService(service.id)} style={{ flex: 1 }} />
                    <Button title="Löschen" variant="ghost" onPress={() => onDeleteServicePress(service)} style={{ marginLeft: spacing.sm }} />
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
                        <Badge variant="outline" style={{ marginLeft: spacing.sm }}>{service.category}</Badge>
                      </View>
                      <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                    </View>
                    <Switch value={service.isActive} onValueChange={() => toggleServiceStatus(service.id)} />
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="logo-euro" size={16} color={colors.black} />
                      <Text style={styles.metaText}>{service.price}€</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={colors.black} />
                      <Text style={styles.metaText}>{formatDuration(service.duration)}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <Button title="Bearbeiten" variant="ghost" onPress={() => onEditService(service.id)} style={{ flex: 1 }} />
                    <Button title="Löschen" variant="ghost" onPress={() => onDeleteServicePress(service)} style={{ marginLeft: spacing.sm }} />
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {mockServices.length === 0 && (
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
