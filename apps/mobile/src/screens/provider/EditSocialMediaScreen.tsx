import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin 
} from 'lucide-react-native';

// Design System
import Text from '../../components/Text';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { spacing, colors } from '../../theme/tokens';

// API
import { providerProfileApi } from '../../api/providerProfile';

export default function EditSocialMediaScreen() {
  const navigation = useNavigation();
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await providerProfileApi.getMe();
      if (profile?.socialMedia) {
        setSocialLinks({
          website: profile.socialMedia.website || "",
          instagram: profile.socialMedia.instagram || "",
          facebook: profile.socialMedia.facebook || "",
          twitter: profile.socialMedia.twitter || "",
          youtube: profile.socialMedia.youtube || "",
          linkedin: profile.socialMedia.linkedin || "",
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Fehler", "Profil konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (platform: string, value: string) => {
    setSocialLinks({ ...socialLinks, [platform]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await providerProfileApi.updateSocialMedia(socialLinks);
      Alert.alert("Erfolg", "Social Media Links erfolgreich aktualisiert", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Fehler", "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  const socialFields = [
    { id: 'website', label: 'Website', icon: Globe, placeholder: 'www.deine-website.de' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@dein_username' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'Deine Facebook Seite' },
    { id: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: '@dein_username' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Dein YouTube Kanal' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'Dein LinkedIn Profil' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={15}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Media</Text>
        <TouchableOpacity onPress={handleSave} hitSlop={15} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Save size={20} color="#8B4513" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <View style={styles.formContainer}>
              {socialFields.map((field) => {
                const IconComponent = field.icon;
                return (
                  <View key={field.id} style={styles.inputWrapper}>
                    <View style={styles.labelRow}>
                      <IconComponent size={16} color="#6B7280" />
                      <Text style={styles.label}>{field.label}</Text>
                    </View>
                    <Input
                      value={socialLinks[field.id as keyof typeof socialLinks]}
                      onChangeText={(val: string) => handleChange(field.id, val)}
                      placeholder={field.placeholder}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                );
              })}
            </View>

            {/* Tip Box */}
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Tipp:</Text>
              <Text style={styles.tipText}>
                Social Media Profile helfen Kunden, mehr über deine Arbeit zu erfahren und Vertrauen aufzubauen. Zeige dein Portfolio!
              </Text>
            </View>

            <Button
              title={saving ? "Speichert..." : "Änderungen speichern"}
              onPress={handleSave}
              style={styles.saveButton}
              disabled={saving}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 16,
  },
  formContainer: {
    gap: 16,
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
  tipBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  tipTitle: {
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 14,
  },
  tipText: {
    color: '#4B5563',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#8B4513',
  },
});
