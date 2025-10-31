import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// Note: TextInput is used inside the custom Input component
// Note: Picker is used for the dropdown
import { Picker } from '@react-native-picker/picker'; 
import { useNavigation } from '@react-navigation/native';

// Icon imports (placeholders)
import ArrowLeft from '../icons/ArrowLeft'; 
import Camera from '../icons/Camera';
import Save from '../icons/Save';

// Custom component stubs
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input'; // Custom component wrapper for TextInput

// --- Service Stubs (Must be adapted for RN networking) ---
// Note: The usersApi must be configured for mobile networking (fetch/axios)
type UpdateMePayload = { firstName: string; lastName: string; phone: string };
type UpdatePreferencesPayload = { dateOfBirth: string | null; gender: 'MALE' | 'FEMALE' | 'OTHER' | null };
type UploadFile = { uri: string; name: string; type: string };

const usersApi = {
  getMe: async () => ({
    avatarUrl: null,
    firstName: "Max",
    lastName: "Mustermann",
    email: "max.m@example.com",
    phone: "+491234567890",
  }),
  getPreferences: async () => ({
    dateOfBirth: "1990-01-01",
    gender: "MALE",
  }),
  updateMe: async (data: UpdateMePayload) => { await new Promise(r => setTimeout(r, 500)); return data; },
  updatePreferences: async (data: UpdatePreferencesPayload) => { await new Promise(r => setTimeout(r, 500)); return data; },
  // File upload logic MUST be updated to use a mobile picker and form-data multipart
  uploadAvatar: async (file: UploadFile) => { await new Promise(r => setTimeout(r, 1000)); return { url: 'https://placehold.co/96x96' }; }, 
};

// --- Image Picker Stub (Requires a library like 'expo-image-picker') ---
const handlePickAvatar = async (setUploadingAvatar: (b: boolean) => void, setAvatarUrl: (s: string | null) => void) => {
  // 1. Use a library like ImagePicker.launchImageLibraryAsync(...) to get the file URI.
  // 2. The selected file object/URI must be converted to a FormData object for upload.
  
  Alert.alert("Aktion", "Bildauswahl-Logik benötigt 'expo-image-picker' oder ähnliches.");
  
  // Mocking successful upload process:
  setUploadingAvatar(true);
  try {
    const fileMock = { uri: 'file:///path/to/image.jpg', name: 'avatar.jpg', type: 'image/jpeg' };
    const res = await usersApi.uploadAvatar(fileMock);
    setAvatarUrl(res.url);
    Alert.alert("Erfolg", "Profilbild aktualisiert");
  } catch (err) {
    Alert.alert("Fehler", "Upload fehlgeschlagen.");
  } finally {
    setUploadingAvatar(false);
  }
};

// --- Constants ---
const COLORS = {
  primary: '#8B4513',
  white: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  background: '#F9FAFB',
  disabled: '#F3F4F6', // bg-gray-100
};
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
};

// --- Component Start ---

export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "", // YYYY-MM-DD format
    gender: "" as "male" | "female" | "other" | "",
  });
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [me, pref] = await Promise.all([usersApi.getMe(), usersApi.getPreferences()]);
      setAvatarUrl(me.avatarUrl || null);
      
      const genderMap = { MALE: 'male', FEMALE: 'female', OTHER: 'other' } as const;
      
      setFormData({
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        email: me.email || "",
        phone: me.phone || "",
        birthDate: (pref?.dateOfBirth as string) || "",
        gender: (pref?.gender ? genderMap[pref.gender as keyof typeof genderMap] : ""),
      });
    } catch (err) {
      console.error("Failed to load profile for edit:", err);
      Alert.alert("Fehler", "Fehler beim Laden des Profils");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      Alert.alert("Fehler", "Bitte fülle Vorname, Nachname und Telefonnummer aus");
      return;
    }
    setSaving(true);
    try {
      // 1) Update base user fields
      await usersApi.updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      // 2) Update client profile preferences (DOB, gender)
      const genderEnumMap = { male: 'MALE', female: 'FEMALE', other: 'OTHER' } as const;
      const genderEnum = formData.gender ? genderEnumMap[formData.gender as keyof typeof genderEnumMap] : null;
      
      await usersApi.updatePreferences({
        dateOfBirth: formData.birthDate || null,
        gender: genderEnum as any,
      });
      
      Alert.alert("Erfolg", "Profil erfolgreich aktualisiert!");
      navigation.goBack(); // Navigate back to profile
    } catch (err) {
      console.error("Profile update failed:", err);
      Alert.alert("Fehler", "Aktualisierung fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  // Custom component for the Gender Picker (Replaces web <select>)
  const GenderPicker = () => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={formData.gender}
        onValueChange={(itemValue) => handleChange("gender", itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Keine Angabe" value="" />
        <Picker.Item label="Männlich" value="male" />
        <Picker.Item label="Weiblich" value="female" />
        <Picker.Item label="Divers" value="other" />
      </Picker>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centeredLoading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md }}>Lade Profil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil bearbeiten</Text>
          <Button
            title={saving ? "Speichern..." : "Speichern"}
            onPress={handleSave}
            style={styles.headerButton}
            textStyle={styles.headerButtonTitle}
            disabled={saving || loading}
            icon={<Save size={16} color={COLORS.white} style={{ marginRight: SPACING.sm / 2 }} />}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.paddings}>
            {/* Profile Picture */}
            <Card style={styles.card}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                  {/* Avatar/AvatarImage */}
                  <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarFallbackText}>
                        {(formData.firstName?.[0] || "").toUpperCase()}
                        {(formData.lastName?.[0] || "").toUpperCase()}
                      </Text>
                    )}
                  </View>
                  
                  {/* Camera Button (Replaces web button and hidden input) */}
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => handlePickAvatar(setUploadingAvatar, setAvatarUrl)}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Camera size={16} color={COLORS.white} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.avatarHintText}>
                  Tippe auf das Kamera-Symbol um dein Foto zu ändern
                </Text>
              </View>
            </Card>

            {/* Personal Information */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Persönliche Informationen</Text>

              <View style={styles.formSection}>
                {/* First Name */}
                <View>
                  <Text style={styles.label}>Vorname *</Text>
                  <Input
                    value={formData.firstName}
                    onChangeText={(text) => handleChange("firstName", text)}
                  />
                </View>

                {/* Last Name */}
                <View>
                  <Text style={styles.label}>Nachname *</Text>
                  <Input
                    value={formData.lastName}
                    onChangeText={(text) => handleChange("lastName", text)}
                  />
                </View>

                {/* Email (Read-only) */}
                <View>
                  <Text style={styles.label}>E-Mail</Text>
                  <Input
                    value={formData.email}
                    keyboardType="email-address"
                    readOnly
                    editable={false}
                    style={styles.disabledInput}
                  />
                  <Text style={styles.hintText}>
                    Die E-Mail-Adresse wird zur Anmeldung verwendet und kann hier
                    nicht geändert werden.
                  </Text>
                </View>

                {/* Phone */}
                <View>
                  <Text style={styles.label}>Telefonnummer *</Text>
                  <Input
                    value={formData.phone}
                    onChangeText={(text) => handleChange("phone", text)}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Birth Date (Placeholder for DatePicker) */}
                <View>
                  <Text style={styles.label}>Geburtsdatum</Text>
                  <TouchableOpacity
                    onPress={() => Alert.alert("DatePicker", "Hier wird ein Native Date Picker geöffnet.")}
                    style={styles.datePickerPlaceholder}
                  >
                    <Text style={styles.datePickerText}>
                      {formData.birthDate || "TT.MM.JJJJ"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Gender (Picker) */}
                <View>
                  <Text style={styles.label}>Geschlecht</Text>
                  <GenderPicker />
                </View>
              </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Abbrechen"
                variant="outline"
                onPress={() => navigation.goBack()}
                style={styles.actionButton}
              />
              <Button
                title={saving ? "Speichern..." : "Speichern"}
                onPress={handleSave}
                style={[styles.actionButton, styles.saveButton]}
                disabled={saving || loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// NOTE: React Native StyleSheet doesn't support the `gap` property. We keep it for layout intent,
// and cast the styles object to `any` to satisfy TypeScript in this project.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centeredLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.lg * 2,
  },
  paddings: {
    padding: SPACING.md,
    gap: SPACING.md, // Not supported by RN StyleSheet
  },
  // Header
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: SPACING.sm,
    height: 36, // size="sm" equivalent
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
  },
  headerButtonTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
  },
  // Cards
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallbackText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHintText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Form Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  formSection: {
    gap: SPACING.md, // Not supported by RN StyleSheet, space-y-4 equivalent
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.sm / 2,
    color: COLORS.text,
  },
  disabledInput: {
    backgroundColor: COLORS.disabled,
    color: COLORS.textSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm / 2,
  },
  // Date Picker Placeholder
  datePickerPlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginTop: SPACING.sm / 2,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.text,
  },
  // Gender Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: SPACING.sm / 2,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md, // Not supported by RN StyleSheet
  },
  actionButton: {
    flex: 1,
    height: 44,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
}) as any;