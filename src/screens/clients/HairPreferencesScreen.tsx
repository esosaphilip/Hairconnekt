import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "@/theme/tokens";
import Icon from "../../components/Icon";
import { Picker } from "@react-native-picker/picker"; // Standard RN Picker for dropdowns
import { showMessage } from "react-native-flash-message"; // Replacement for 'sonner' toast

// Assuming you have these custom RN components
import { Card, Button } from "../../ui";
import { Checkbox } from "../../components/checkbox";
import type { StyleProp, ViewStyle } from "react-native";

// --- Data Definitions (Remain the same) ---
const hairTypes = [
  { id: "1a", label: "1A - Glattes Haar" },
  { id: "1b", label: "1B - Glattes Haar mit Volumen" },
  { id: "1c", label: "1C - Glattes Haar mit leichten Wellen" },
  { id: "2a", label: "2A - Leichte Wellen" },
  { id: "2b", label: "2B - Definierte Wellen" },
  { id: "2c", label: "2C - Starke Wellen" },
  { id: "3a", label: "3A - Lockere Locken" },
  { id: "3b", label: "3B - Definierte Locken" },
  { id: "3c", label: "3C - Enge Locken" },
  { id: "4a", label: "4A - Weiche Coils" },
  { id: "4b", label: "4B - Z-förmige Coils" },
  { id: "4c", label: "4C - Sehr enge Coils" },
];

const hairLengths = [
  { id: "short", label: "Kurz (bis Kinn)" },
  { id: "medium", label: "Mittel (bis Schulter)" },
  { id: "long", label: "Lang (über Schulter)" },
  { id: "very-long", label: "Sehr lang (bis Taille+)" },
];

const preferredStyles = [
  { id: "box-braids", label: "Box Braids" },
  { id: "knotless", label: "Knotless Braids" },
  { id: "cornrows", label: "Cornrows" },
  { id: "senegalese", label: "Senegalese Twists" },
  { id: "faux-locs", label: "Faux Locs" },
  { id: "passion-twists", label: "Passion Twists" },
  { id: "goddess-braids", label: "Goddess Braids" },
  { id: "fulani-braids", label: "Fulani Braids" },
];

const allergies = [
  { id: "latex", label: "Latex" },
  { id: "synthetic", label: "Synthetisches Haar" },
  { id: "certain-oils", label: "Bestimmte Öle" },
  { id: "fragrances", label: "Duftstoffe" },
];

// --- Custom Components for Reusability in RN ---

// NOTE: Use native <Text> for section labels.

  const RadioOption: React.FC<{ label: string; selected: boolean; onPress: () => void }> = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.radioOption, selected && styles.radioOptionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.radioContainer}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

const CheckboxOption: React.FC<{ label: string; checked: boolean; onPress: () => void; style?: StyleProp<ViewStyle> }>
  = ({ label, checked, onPress, style }) => (
  <TouchableOpacity
    style={[styles.checkboxOption, checked && styles.checkboxOptionSelected, style]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {/* Assuming your custom Checkbox component looks something like this */}
    <Checkbox checked={checked} onCheckedChange={onPress} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// --- Refactored Component ---

export function HairPreferencesScreen() {
  const navigation = useNavigation();
  type HairPreferencesFormData = {
    hairType: string;
    hairLength: string;
    preferredStyles: string[];
    allergies: string[];
    sensitivScalp: boolean;
    additionalNotes: string;
  };

  const [formData, setFormData] = useState<HairPreferencesFormData>({
    hairType: "4a",
    hairLength: "medium",
    preferredStyles: ["box-braids", "knotless"],
    allergies: [],
    sensitivScalp: false,
    additionalNotes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleStyleToggle = (styleId: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredStyles: prev.preferredStyles.includes(styleId)
        ? prev.preferredStyles.filter((id) => id !== styleId)
        : [...prev.preferredStyles, styleId],
    }));
  };

  const handleAllergyToggle = (allergyId: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergyId)
        ? prev.allergies.filter((id) => id !== allergyId)
        : [...prev.allergies, allergyId],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Replacement for toast.success
      showMessage({
        message: "Gespeichert",
        description: "Haartyp & Präferenzen erfolgreich aktualisiert!",
        type: "success",
      });
      navigation.goBack();
    } catch (error) {
       showMessage({
        message: "Fehler",
        description: "Speichern fehlgeschlagen. Bitte versuche es erneut.",
        type: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haartyp & Präferenzen</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          {/* Hair Type */}
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Haartyp</Text>
            {/* RN Picker is used for select/dropdown */}
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.hairType}
                onValueChange={(itemValue: string) =>
                  setFormData((prev) => ({ ...prev, hairType: itemValue }))
                }
                style={styles.picker}
              >
                {hairTypes.map((type) => (
                  <Picker.Item key={type.id} label={type.label} value={type.id} />
                ))}
              </Picker>
            </View>
            <Text style={styles.hairTypeInfo}>
              Wähle deinen Haartyp nach dem Andre Walker System
            </Text>
          </Card>

          {/* Hair Length */}
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Haarlänge</Text>
            <View style={styles.radioGroup}>
              {hairLengths.map((length) => (
                <RadioOption
                  key={length.id}
                  label={length.label}
                  selected={formData.hairLength === length.id}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, hairLength: length.id }))
                  }
                />
              ))}
            </View>
          </Card>

          {/* Preferred Styles */}
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Bevorzugte Styles</Text>
            <View style={styles.gridContainer}>
              {preferredStyles.map((style) => (
                <View key={style.id} style={styles.gridItem}>
                  <CheckboxOption
                    label={style.label}
                    checked={formData.preferredStyles.includes(style.id)}
                    onPress={() => handleStyleToggle(style.id)}
                  />
                </View>
              ))}
            </View>
          </Card>

          {/* Allergies */}
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Allergien & Empfindlichkeiten</Text>
            <View style={styles.radioGroup}>
              {allergies.map((allergy) => (
                <CheckboxOption
                  key={allergy.id}
                  label={allergy.label}
                  checked={formData.allergies.includes(allergy.id)}
                  onPress={() => handleAllergyToggle(allergy.id)}
                />
              ))}
            </View>
            {/* Sensitive Scalp Checkbox */}
            <CheckboxOption
              label="Ich habe eine empfindliche Kopfhaut"
              checked={formData.sensitivScalp}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  sensitivScalp: !prev.sensitivScalp,
                }))
              }
              style={styles.sensitiveScalpOption}
            />
          </Card>

          {/* Additional Notes */}
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Zusätzliche Hinweise (optional)</Text>
            <TextInput
              value={formData.additionalNotes}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, additionalNotes: text }))
              }
              placeholder="Weitere Informationen über deine Haarbedürfnisse..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </Card>

          {/* Info */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Warum ist das wichtig?</Text>
            <Text style={styles.infoText}>
              Diese Informationen helfen Braidern, den besten Service für dich zu
              bieten und Styles vorzuschlagen, die zu deinem Haartyp passen.
            </Text>
          </Card>

          {/* Save Button */}
          <Button
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <View style={styles.saveButtonContent}>
                <Icon name="check" size={20} color={colors.white} style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Änderungen speichern</Text>
              </View>
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

// NOTE: React Native StyleSheet doesn't support the `gap` property. We keep it for layout intent,
// and cast the styles object to `any` to satisfy TypeScript in this project.
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
  },
  checkboxLabel: {
    color: colors.gray800,
    flexShrink: 1,
    fontSize: 14,
  },
  checkboxOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  checkboxOptionSelected: {
    borderColor: colors.primary,
  },
  formContainer: {
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  hairTypeInfo: {
    color: colors.gray500,
    fontSize: 12,
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  headerTitle: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    padding: 16,
  },
  infoText: {
    color: colors.blue900,
    fontSize: 14,
  },
  infoTitle: {
    color: colors.blue900,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  picker: {
    width: '100%',
  },
  pickerWrapper: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: 6,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radio: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
    height: 12,
    justifyContent: 'center',
    width: 12,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioContainer: {
    alignItems: 'center',
    borderColor: colors.gray300,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioDot: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  radioGroup: {
    gap: 8,
  },
  radioLabel: {
    color: colors.gray800,
    fontSize: 14,
  },
  radioOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  radioOptionSelected: {
    backgroundColor: colors.gray50,
    borderColor: colors.primary,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  saveButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveIcon: {
    marginRight: 8,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  sectionLabel: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sensitiveScalpOption: {
    backgroundColor: colors.gray50,
    borderColor: colors.gray50,
    marginTop: 8,
  },
  spacer: {
    width: 24,
  },
  textArea: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: 6,
    borderWidth: 1,
    color: colors.gray800,
    fontSize: 14,
    minHeight: 100,
    padding: 12,
    textAlignVertical: 'top',
  },
});
