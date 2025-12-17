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

// Design System
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/badge';
import { spacing, colors } from '../../theme/tokens';

const AVAILABLE_SPECIALIZATIONS = [
  "Box Braids", "Cornrows", "Senegalese Twists", "Knotless Braids",
  "Passion Twists", "Faux Locs", "Fulani Braids", "Ghana Braids",
  "Marley Twists", "Havana Twists", "Goddess Braids", "Crochet Braids",
  "Feed-In Braids", "Stitch Braids", "Lemonade Braids", "Tribal Braids",
  "Micro Braids", "Tree Braids",
];

export default function EditSpecializationsScreen() {
  const navigation = useNavigation();
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([
    "Box Braids", "Cornrows", "Senegalese Twists", 
    "Knotless Braids", "Passion Twists", "Faux Locs",
  ]);

  const handleToggle = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const handleSave = () => {
    if (selectedSpecs.length === 0) {
      Alert.alert("Fehler", "Bitte wähle mindestens eine Spezialisierung aus");
      return;
    }
    Alert.alert("Erfolg", "Spezialisierungen erfolgreich aktualisiert");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spezialisierungen</Text>
        <TouchableOpacity onPress={handleSave} hitSlop={12}>
          <Save size={20} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Specs */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            Ausgewählte Styles ({selectedSpecs.length})
          </Text>
          <View style={styles.badgeWrapper}>
            {selectedSpecs.length > 0 ? (
              selectedSpecs.map((spec) => (
                <TouchableOpacity key={spec} onPress={() => handleToggle(spec)}>
                  <Badge style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{spec}</Text>
                    <X size={14} color="#FFF" style={styles.iconRight} />
                  </Badge>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Keine Auswahl getroffen</Text>
            )}
          </View>
        </Card>

        {/* Available Specs */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Verfügbare Spezialisierungen</Text>
          <View style={styles.badgeWrapper}>
            {AVAILABLE_SPECIALIZATIONS.filter(s => !selectedSpecs.includes(s)).map((spec) => (
              <TouchableOpacity key={spec} onPress={() => handleToggle(spec)}>
                <Badge variant="outline" style={styles.outlineBadge}>
                  <Plus size={14} color="#374151" style={styles.iconLeft} />
                  <Text>{spec}</Text>
                </Badge>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Tip Box */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>Tipp:</Text>
          <Text style={styles.tipText}>
            Wähle nur die Styles aus, in denen du wirklich spezialisiert bist. Kunden schätzen Ehrlichkeit und Expertise!
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
  badgeWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 14,
  },
  outlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  iconRight: { marginLeft: 6 },
  iconLeft: { marginRight: 6 },
  emptyText: { color: '#9CA3AF', fontStyle: 'italic' },
  tipContainer: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  tipTitle: { fontWeight: '700', marginBottom: 2, fontSize: 14 },
  tipText: { color: '#4B5563', fontSize: 12 },
  saveButton: { backgroundColor: '#8B4513' },
});
