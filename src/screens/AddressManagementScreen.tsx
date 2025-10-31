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
import Button from '../components/Button';
import Card from '../components/Card';
import IconButton from '../components/IconButton';
import { Badge } from '../components/badge';
import Icon from '../components/Icon'; // Component for handling icons (e.g., using react-native-vector-icons)
import { COLORS, SPACING, FONT_SIZES } from '../theme/tokens'; // Assumed custom tokens/styles

// --- Mock Data (Remains the same) ---
type Address = {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  isDefault: boolean;
};

const mockAddresses: Address[] = [
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
  const navigation = useNavigation<any>();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);

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
  const AddressItem = ({ address }: { address: Address }) => {
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

            {/* Actions */}
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
                onPress={() => navigation.navigate('EditAddress', { id: address.id })}
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
        onPress={() => navigation.navigate('AddAddress')}
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
          addresses.map((address) => <AddressItem key={address.id} address={address} />)
        ) : (
          <EmptyState />
        )}
      </View>

      {/* FAB */}
      {addresses.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAddress')}
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
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    padding: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Content and Info Card ---
  contentContainer: {
    padding: SPACING.md || 16,
    gap: SPACING.md || 16,
    paddingBottom: SPACING.xl * 2, // Space for FAB
  },
  infoCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.infoBg || '#EFF6FF', // blue-50
    borderColor: COLORS.infoBorder || '#DBEAFE', // blue-200
    borderWidth: 1,
    borderRadius: 8,
  },
  infoText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.infoText || '#1E40AF', // blue-900
  },
  // --- Address Item Styles ---
  addressCard: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    // Add shadow/elevation style if necessary
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm || 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.border || '#F3F4F6', // gray-100
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addressDetails: {
    flex: 1,
    minWidth: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  addressLabel: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  addressText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  deleteButton: {
    borderColor: COLORS.border,
  },
  deleteButtonText: {
    color: COLORS.danger || '#DC2626', // red-600
  },
  // --- Empty State Styles ---
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary || '#8B4513',
  },
  // --- FAB Styles (Fixed Bottom) ---
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24, // Adjust for iOS home indicator
    right: SPACING.md,
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary || '#8B4513',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // Mobile-friendly shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
});