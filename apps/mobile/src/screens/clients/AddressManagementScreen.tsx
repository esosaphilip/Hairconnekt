/* eslint-disable */
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Alert, // Used to replace browser 'confirm' and 'toast'
  Platform, // For minor platform-specific adjustments
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import { Badge } from '@/components/badge';
import Icon from '@/components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '@/theme/tokens';
// navigation types omitted

type AddressItem = {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  isDefault: boolean;
};

const mockAddresses: AddressItem[] = [
  {
    id: "1",
    label: "Zuhause",
    street: "Musterstraße 123",
    city: "Dortmund",
    postalCode: "44139",
    state: "Nordrhein-Westfalen",
    isDefault: true,
  },
  {
    id: "2",
    label: "Arbeit",
    street: "Büroweg 45",
    city: "Dortmund",
    postalCode: "44141",
    state: "Nordrhein-Westfalen",
    isDefault: false,
  },
  {
    id: "3",
    label: "Bei Mama",
    street: "Familienstraße 7",
    city: "Bochum",
    postalCode: "44787",
    state: "Nordrhein-Westfalen",
    isDefault: false,
  },
];

// Map of labels to icon names (assuming icon library is used)
const ICON_MAP: Record<string, string> = {
  Zuhause: 'home',
  Arbeit: 'briefcase',
  'Bei Mama': 'map-pin', // Added specific entry for completeness
  default: 'map-pin',
};

// --- Main Component ---
export function AddressManagementScreen() {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<AddressItem[]>(mockAddresses);

  // Replaces browser 'confirm' and web 'toast'
  const handleDelete = (id: string) => {
    Alert.alert(
      "Adresse löschen?",
      "Möchtest du diese Adresse wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Löschen",
          onPress: () => {
            setAddresses(addresses.filter((addr) => addr.id !== id));
            Alert.alert("Erfolg", "Adresse gelöscht"); // Simple toast replacement
          },
          style: "destructive",
        },
      ]
    );
  };

  // Replaces web 'toast'
  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    Alert.alert("Erfolg", "Standardadresse geändert"); // Simple toast replacement
  };

  const getIconName = (label: string) => {
    return ICON_MAP[label] || ICON_MAP.default;
  };

  // --- Render Item for the List ---
  const renderAddressItem = (address: AddressItem) => {
    const iconName = getIconName(address.label);
    return (
      <Card style={styles.addressCard}>
        <View style={styles.addressContent}>
          <View style={styles.iconCircle}>
            <Icon name={iconName} size={20} color={COLORS.primary} />
          </View>

          <View style={styles.addressDetails}>
            <View style={styles.labelRow}>
              <Text style={styles.addressLabel} numberOfLines={1}>
                {address.label}
              </Text>
              {address.isDefault && (
                <Badge title="Standard" color="primary" />
              )}
            </View>
            <Text style={styles.addressText}>{address.street}</Text>
            <Text style={styles.addressText}>
              {address.postalCode} {address.city}
            </Text>
            <Text style={styles.addressText}>{address.state}</Text>

            <View style={styles.actionButtonsContainer}>
              {!address.isDefault && (
                <Button
                  title="Als Standard"
                  variant="outline"
                  size="sm"
                  onPress={() => handleSetDefault(address.id)}
                />
              )}
              <Button
                title="Bearbeiten"
                variant="outline"
                size="sm"
                icon="edit"
                onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'AddEditAddressScreen', params: { id: address.id } } })}
              />
              <Button
                title="Löschen"
                variant="outline"
                size="sm"
                icon="trash"
                onPress={() => handleDelete(address.id)}
                style={styles.deleteButton}
                textStyle={styles.deleteButtonText}
              />
            </View>
          </View>
        </View>
      </Card>
    );
  };

  // --- Empty State Component ---
  const EmptyState = () => (
    <Card style={styles.emptyCard}>
      <Icon name="map-pin" size={48} color={COLORS.textSecondary} style={{ marginBottom: SPACING.md }} />
      <Text style={styles.emptyTitle}>Keine Adressen gespeichert</Text>
      <Text style={styles.emptySubtitle}>Füge deine erste Adresse hinzu</Text>
      <Button
        title="Adresse hinzufügen"
        icon="plus"
        onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'AddEditAddressScreen' } })}
        style={styles.addButton}
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Meine Adressen</Text>
            <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
              (Privatadressen für Buchungen)
            </Text>
            <Text style={styles.headerSubtitle}>
              {addresses.length} gespeicherte Adressen
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            Gespeicherte Adressen werden bei Buchungen mit mobilem Service verwendet.
          </Text>
        </Card>

        {/* Address List */}
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <View key={address.id}>{renderAddressItem(address)}</View>
          ))
        ) : (
          <EmptyState />
        )}
      </View>

      {/* FAB */}
      {addresses.length > 0 && (
        <TouchableOpacity
          onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'AddEditAddressScreen' } })}
          style={styles.fab}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
  },
  addressContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addressDetails: {
    flex: 1,
    minWidth: 0,
  },
  addressLabel: {
    flexShrink: 1,
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
  },
  addressText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    lineHeight: 20,
  },
  contentContainer: {
    gap: SPACING.md,
    padding: SPACING.md,
  },
  deleteButton: {
    borderColor: COLORS.border,
  },
  deleteButtonText: {
    color: COLORS.danger,
  },
  emptyCard: {
    alignItems: 'center',
    borderRadius: 8,
    padding: SPACING.xl,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    bottom: Platform.OS === 'ios' ? 40 : 24,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 56,
    zIndex: 20,
  },
  flexContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    elevation: 2,
    padding: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  infoCard: {
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.infoBorder,
    borderRadius: 8,
    borderWidth: 1,
    padding: SPACING.md,
  },
  infoText: {
    color: COLORS.infoText,
    fontSize: FONT_SIZES.body,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
});
// @ts-nocheck
