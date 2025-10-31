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
import { ArrowLeft, Check } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker"; // Standard RN Picker for dropdowns
import { showMessage } from "react-native-flash-message"; // Replacement for 'sonner' toast

// Assuming you have these custom RN components
import { Card, Button } from "../ui";
import { Checkbox } from "../ui/Checkbox"; 
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

// NOTE: Since RN doesn't have a <Label> primitive, we just use <Text> for labels.
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.sectionLabel}>{children}</Text>
);

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
  const navigation = useNavigation<any>(); // Use useNavigation from @react-navigation/native
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
          <ArrowLeft size={24} color="#4B5563" /> {/* gray-700 */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haartyp & Präferenzen</Text>
        <View style={styles.spacer} /> {/* Spacer for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          {/* Hair Type */}
          <Card style={styles.card}>
            <SectionLabel>Haartyp</SectionLabel>
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
            <SectionLabel>Haarlänge</SectionLabel>
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
            <SectionLabel>Bevorzugte Styles</SectionLabel>
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
            <SectionLabel>Allergien & Empfindlichkeiten</SectionLabel>
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
            <SectionLabel>Zusätzliche Hinweise (optional)</SectionLabel>
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
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.saveButtonContent}>
                <Check size={20} color="#fff" style={{ marginRight: 8 }} />
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // Title h3 equivalent
  },
  spacer: {
    width: 24, // Matches the back arrow size for centered title
  },
  // --- Form Content ---
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16, // Not supported by RN StyleSheet; space-y-4
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937', // Black
  },
  // --- Hair Type Picker ---
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-input
    borderRadius: 6, // rounded-md
    overflow: 'hidden', // Ensures picker content stays within bounds
    backgroundColor: '#fff',
    height: 48, // Standard input height
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    // iOS and Android styling for picker can be complex; these are defaults
  },
  hairTypeInfo: {
    fontSize: 12,
    color: '#6B7280', // gray-500
    marginTop: 8,
  },
  // --- Hair Length Radio Group ---
  radioGroup: {
    gap: 8, // Not supported by RN StyleSheet; space-y-2
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Not supported by RN StyleSheet
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // border
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  radioOptionSelected: {
    borderColor: '#8B4513', // Optional: Highlight selected border
    backgroundColor: '#F9FAFB', // Optional: Light background on hover/selected
  },
  radioContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB', // Default border color
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#8B4513',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B4513',
  },
  radioLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  // --- Preferred Styles Grid ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Not supported by RN StyleSheet
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // Approx. half width for grid-cols-2
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Not supported by RN StyleSheet
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#fff',
    flex: 1,
  },
  checkboxOptionSelected: {
    borderColor: '#8B4513',
  },
  checkboxLabel: {
    fontSize: 14,
    flexShrink: 1,
    color: '#1F2937',
  },
  sensitiveScalpOption: {
    marginTop: 8,
    backgroundColor: '#F9FAFB', // gray-50 background
    borderColor: '#F9FAFB',
  },

  // --- Additional Notes ---
  textArea: {
    minHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    fontSize: 14,
    textAlignVertical: 'top', // Important for multiline input on Android
    backgroundColor: '#fff',
    color: '#1F2937',
  },

  // --- Info Card ---
  infoCard: {
    padding: 16,
    backgroundColor: '#EFF6FF', // blue-50
    borderColor: '#DBEAFE', // blue-100
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0B4E8C', // blue-900
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF', // blue-800
  },

  // --- Save Button ---
  saveButton: {
    backgroundColor: '#8B4513',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}) as any;