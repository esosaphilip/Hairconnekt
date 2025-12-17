import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save, Plus, Trash2, Award } from 'lucide-react-native';

// Design System Imports
import Text from '../../components/Text';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { spacing, colors } from '../../theme/tokens';

interface Certification {
  id: string;
  title: string;
  institution: string;
  year: string;
}

export default function EditCertificationsScreen() {
  const navigation = useNavigation();
  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: "1",
      title: "Professionelle Flechtfrisuren Ausbildung",
      institution: "Braiding Academy Berlin",
      year: "2019",
    },
    {
      id: "2",
      title: "Natürliche Haarpflege Spezialist",
      institution: "Natural Hair Institute",
      year: "2020",
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newCert, setNewCert] = useState({ title: "", institution: "", year: "" });

  const handleAdd = () => {
    if (!newCert.title || !newCert.institution || !newCert.year) {
      Alert.alert("Fehler", "Bitte fülle alle Felder aus");
      return;
    }

    setCertifications([
      ...certifications,
      { id: Date.now().toString(), ...newCert },
    ]);

    setNewCert({ title: "", institution: "", year: "" });
    setIsAdding(false);
    Alert.alert("Erfolg", "Zertifikat hinzugefügt");
  };

  const handleDelete = (id: string) => {
    setCertifications(certifications.filter((cert) => cert.id !== id));
    Alert.alert("Erfolg", "Zertifikat entfernt");
  };

  const handleSave = () => {
    Alert.alert("Erfolg", "Erfolgreich aktualisiert");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zertifikate bearbeiten</Text>
        <TouchableOpacity onPress={handleSave}>
          <Save size={20} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Existing Certifications List */}
          <View style={styles.listContainer}>
            {certifications.map((cert) => (
              <Card key={cert.id} style={styles.certCard}>
                <View style={styles.certRow}>
                  <Award size={20} color="#8B4513" style={styles.certIcon} />
                  <View style={styles.certTextContainer}>
                    <Text>{cert.title}</Text>
                    <Text style={styles.institutionText}>
                      {cert.institution}, {cert.year}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(cert.id)}>
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>

          {/* Add New Certification UI */}
          {isAdding ? (
            <Card style={styles.addCard}>
              <Text style={styles.addTitle}>Neues Zertifikat hinzufügen</Text>
              <View style={styles.formGap}>
                <Input
                  label="Titel"
                  value={newCert.title}
                  onChangeText={(val: string) => setNewCert({ ...newCert, title: val })}
                  placeholder="z.B. Professionelle Flechtfrisuren"
                />
                <Input
                  label="Institution"
                  value={newCert.institution}
                  onChangeText={(val: string) => setNewCert({ ...newCert, institution: val })}
                  placeholder="z.B. Braiding Academy"
                />
                <Input
                  label="Jahr"
                  value={newCert.year}
                  keyboardType="numeric"
                  onChangeText={(val: string) => setNewCert({ ...newCert, year: val })}
                  placeholder="z.B. 2023"
                />
                <View style={styles.buttonRow}>
                  <Button title="Hinzufügen" onPress={handleAdd} style={styles.flex1} />
                  <Button 
                    title="Abbrechen" 
                    variant="outline" 
                    onPress={() => setIsAdding(false)} 
                    style={styles.flex1} 
                  />
                </View>
              </View>
            </Card>
          ) : (
            <Button
              variant="outline"
              onPress={() => setIsAdding(true)}
              style={styles.addButton}
            >
              <View style={styles.inlineButtonContent}>
                <Plus size={18} color="#374151" style={styles.plusIcon} />
                <Text>Zertifikat hinzufügen</Text>
              </View>
            </Button>
          )}

          {/* Tip Box */}
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Tipp:</Text>
            <Text style={styles.tipText}>
              Zertifikate und Ausbildungen zeigen deine Professionalität und helfen, das Vertrauen deiner Kunden zu gewinnen.
            </Text>
          </View>

          <Button
            title="Änderungen speichern"
            onPress={handleSave}
            style={styles.mainSaveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 16 },
  listContainer: { marginBottom: 12 },
  certCard: { padding: 16, marginBottom: 12 },
  certRow: { flexDirection: 'row', alignItems: 'flex-start' },
  certIcon: { marginTop: 2, marginRight: 12 },
  certTextContainer: { flex: 1 },
  institutionText: { color: '#4B5563', marginTop: 4, fontSize: 12 },
  addCard: { padding: 16, marginBottom: 16 },
  addTitle: { marginBottom: 12, fontSize: 16, fontWeight: '600' },
  formGap: { gap: 12 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  flex1: { flex: 1 },
  addButton: { marginBottom: 16 },
  inlineButtonContent: { flexDirection: 'row', alignItems: 'center' },
  plusIcon: { marginRight: 8 },
  tipBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  tipTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  tipText: { color: '#4B5563', fontSize: 12 },
  mainSaveButton: { backgroundColor: '#8B4513' },
});
