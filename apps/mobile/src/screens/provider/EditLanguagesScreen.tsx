import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save, X, Plus } from 'lucide-react-native';

// Assuming your design system components
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/badge';
import { spacing, colors } from '../../theme/tokens';

const AVAILABLE_LANGUAGES = [
  "Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch",
  "Portugiesisch", "Russisch", "Türkisch", "Arabisch", "Twi",
  "Yoruba", "Igbo", "Swahili", "Amharisch", "Somali", "Wolof",
  "Hausa", "Zulu",
];

export default function EditLanguagesScreen() {
  const navigation = useNavigation();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "Deutsch", "Englisch", "Französisch", "Twi",
  ]);

  const handleToggle = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const handleSave = () => {
    if (selectedLanguages.length === 0) {
      Alert.alert("Fehler", "Bitte wähle mindestens eine Sprache aus");
      return;
    }
    Alert.alert("Erfolg", "Sprachen erfolgreich aktualisiert");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sprachen bearbeiten</Text>
        <TouchableOpacity onPress={handleSave} hitSlop={10}>
          <Save size={20} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Selected Languages Section */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            Deine Sprachen ({selectedLanguages.length})
          </Text>
          {selectedLanguages.length > 0 ? (
            <View style={styles.badgeContainer}>
              {selectedLanguages.map((language) => (
                <TouchableOpacity 
                  key={language} 
                  onPress={() => handleToggle(language)}
                  activeOpacity={0.7}
                >
                  <Badge style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>{language}</Text>
                    <X size={14} color="#FFF" style={styles.iconRight} />
                  </Badge>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Keine Sprachen ausgewählt</Text>
          )}
        </Card>

        {/* Available Languages Section */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Verfügbare Sprachen</Text>
          <View style={styles.badgeContainer}>
            {AVAILABLE_LANGUAGES.filter(
              (lang) => !selectedLanguages.includes(lang)
            ).map((language) => (
              <TouchableOpacity 
                key={language} 
                onPress={() => handleToggle(language)}
                activeOpacity={0.7}
              >
                <Badge variant="outline" style={styles.outlineBadge}>
                  <Plus size={14} color="#374151" style={styles.iconLeft} />
                  <Text>{language}</Text>
                </Badge>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Info Tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Tipp:</Text>
          <Text style={styles.tipText}>
            Das Anbieten mehrerer Sprachen hilft dir, mehr Kunden zu erreichen und sie sich wohler fühlen zu lassen!
          </Text>
        </View>

        <Button
          title="Änderungen speichern"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Requires RN 0.71+
  },
  selectedBadge: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  selectedBadgeText: {
    color: '#FFF',
    fontSize: 14,
  },
  outlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  iconRight: {
    marginLeft: 4,
  },
  iconLeft: {
    marginRight: 4,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
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
