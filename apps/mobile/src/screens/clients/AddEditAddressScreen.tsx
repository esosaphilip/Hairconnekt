import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  Switch as RNSwitch, // Renamed to avoid conflict with custom 'Switch' component if it exists
  TouchableOpacity,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '@/components/Button';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import Input from '@/components/Input';
import Icon from '@/components/Icon';
import Picker from '@/components/Picker';
import { COLORS, SPACING, FONT_SIZES } from '@/theme/tokens';
import type { ClientProfileStackScreenProps } from '@/navigation/types';

// Mock data (static)
const GERMAN_STATES: string[] = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

// Mock function to fetch existing address data for editing
type AddressFormData = {
  label: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  isDefault: boolean;
};

const fetchAddressById = (id: string): AddressFormData => {
    // This would be an API call in a real app
    console.log(`Fetching address for ID: ${id}`);
    return {
        label: "Zuhause",
        street: "Musterstraße 123",
        postalCode: "44139",
        city: "Dortmund",
        state: "Nordrhein-Westfalen",
        isDefault: true,
    };
};


export function AddEditAddressScreen() {
  type Nav = ClientProfileStackScreenProps<'AddAddress'>['navigation'];
  type AddRoute = ClientProfileStackScreenProps<'AddAddress'>['route'];
  type EditRoute = ClientProfileStackScreenProps<'EditAddress'>['route'];
  const navigation = useNavigation<Nav>();
  const route = useRoute<AddRoute | EditRoute>();
  const id = (route as EditRoute).params?.id;
  const isEditing = !!id;

  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    street: "",
    postalCode: "",
    city: "",
    state: "Nordrhein-Westfalen",
    isDefault: false,
  });

  // Load existing data if editing
  useEffect(() => {
    if (isEditing) {
      // In a real app, this would be an async call
      const existingData = fetchAddressById(id);
      setFormData(existingData);
    }
  }, [isEditing, id]);

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (!formData.label || !formData.street || !formData.postalCode || !formData.city) {
        // Replaced sonner toast with native Alert
        Alert.alert("Fehler", "Bitte fülle alle Pflichtfelder aus.");
        return;
    }

    // In a real app, send formData to the API (POST or PUT)
    
    const message = isEditing
      ? "Adresse erfolgreich aktualisiert!"
      : "Adresse erfolgreich hinzugefügt!";

    // Replaced sonner toast and useNavigate with Alert and navigation
    Alert.alert("Erfolg", message, [
        {
            text: "OK",
            onPress: () => navigation.navigate("AddressManagementScreen") // Navigate back to the list
        }
    ]);
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>
            {isEditing ? "Adresse bearbeiten" : "Neue Adresse"}
          </Text>
          {/* Header Save Button */}
          <TouchableOpacity onPress={handleSave} style={styles.headerSaveButton}>
            <Icon name="save" size={20} color={COLORS.white} style={{ marginRight: SPACING.xs }} />
            <Text style={styles.headerSaveText}>Speichern</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Adressinformationen</Text>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adresslabel *</Text>
              <Input
                value={formData.label}
                onChangeText={(value) => handleChange("label", value)}
                placeholder="z.B. Zuhause, Arbeit, Bei Mama"
              />
              <Text style={styles.hintText}>
                Wähle einen Namen zur einfachen Identifizierung
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Straße und Hausnummer *</Text>
              <Input
                value={formData.street}
                onChangeText={(value) => handleChange("street", value)}
                placeholder="Musterstraße 123"
              />
            </View>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>PLZ *</Text>
                <Input
                  value={formData.postalCode}
                  onChangeText={(value) => handleChange("postalCode", value)}
                  placeholder="44139"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Stadt *</Text>
                <Input
                  value={formData.city}
                  onChangeText={(value) => handleChange("city", value)}
                  placeholder="Dortmund"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bundesland *</Text>
              {/* Replaced web <select> with a custom Picker component */}
              <Picker
                selectedValue={formData.state}
                onValueChange={(value) => handleChange("state", value)}
                items={GERMAN_STATES.map(state => ({ label: state, value: state }))}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.label}>Als Standardadresse festlegen</Text>
                <Text style={styles.hintText}>
                  Diese Adresse wird automatisch bei Buchungen vorausgewählt
                </Text>
              </View>
              <RNSwitch
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
                ios_backgroundColor={COLORS.border}
                onValueChange={(checked) => handleChange("isDefault", checked)}
                value={formData.isDefault}
              />
            </View>
          </View>
        </Card>

        {/* Preview */}
        <Card style={styles.previewCard}>
          <Text style={styles.cardTitle}>Vorschau</Text>
          <View style={styles.previewContent}>
            {formData.label ? (
              <Text style={styles.previewLabel}>{formData.label}</Text>
            ) : (
              <Text style={styles.previewPlaceholder}>
                Fülle die Felder aus, um eine Vorschau zu sehen
              </Text>
            )}
            {formData.street && (
              <Text style={styles.previewText}>{formData.street}</Text>
            )}
            {(formData.postalCode || formData.city) && (
              <Text style={styles.previewText}>
                {formData.postalCode} {formData.city}
              </Text>
            )}
            {formData.state && (
              <Text style={styles.previewText}>{formData.state}</Text>
            )}
          </View>
        </Card>

        {/* Action Buttons (Footer - also needed for redundancy) */}
        <View style={styles.footerActionButtons}>
          <Button
            title="Abbrechen"
            variant="outline"
            style={styles.footerButton}
            onPress={() => navigation.goBack()}
          />
          <Button
            title="Speichern"
            style={[styles.footerButton, { backgroundColor: COLORS.primary }]}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  flexContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  footerActionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  footerButton: {
    flex: 1,
    height: 48,
  },
  formContainer: {
    gap: SPACING.md,
  },
  formGroup: {
    gap: SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  gridItem: {
    flex: 1,
    gap: SPACING.xs,
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
    justifyContent: 'space-between',
  },
  headerSaveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  headerSaveText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
  },
  hintText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
    marginTop: SPACING.xs / 2,
  },
  label: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
    marginBottom: SPACING.xs / 2,
  },
  previewCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
  },
  previewContent: {
    paddingTop: SPACING.xs,
  },
  previewLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  previewPlaceholder: {
    color: COLORS.textSecondary + '80',
    fontSize: FONT_SIZES.body,
    fontStyle: 'italic',
  },
  previewText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  switchRow: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  switchTextContainer: {
    flexShrink: 1,
    paddingRight: SPACING.md,
  },
});
