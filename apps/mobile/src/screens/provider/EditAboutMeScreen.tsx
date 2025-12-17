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
import { ArrowLeft, Save } from 'lucide-react-native';

// Components
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { spacing, colors } from '../../theme/tokens';

export default function EditAboutMeScreen() {
  const navigation = useNavigation();
  const [bio, setBio] = useState(
    "Hallo! Ich bin Aisha und habe über 10 Jahre Erfahrung mit afrikanischen Flechtfrisuren. Meine Leidenschaft ist es, jedem Kunden einen individuellen Look zu kreieren, der perfekt zu ihm passt. Ich verwende nur hochwertige Produkte und lege großen Wert auf die Gesundheit deiner Haare."
  );

  const handleSave = () => {
    Alert.alert("Erfolg", "Über mich erfolgreich aktualisiert");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={15}>
          <ArrowLeft size={24} color={colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Über mich bearbeiten</Text>
        <TouchableOpacity onPress={handleSave} hitSlop={15}>
          <Save size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <View style={styles.formGap}>
              <View>
                <Text style={styles.label}>Bio</Text>
                <Input
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Erzähle etwas über dich und deine Expertise..."
                  multiline
                  numberOfLines={8}
                  style={styles.textArea}
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {bio.length}/500 Zeichen
                </Text>
              </View>

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>Tipps für eine gute Bio:</Text>
                <View style={styles.tipList}>
                  <Text style={styles.tipText}>• Beschreibe deine Erfahrung und Expertise</Text>
                  <Text style={styles.tipText}>• Erwähne deine Spezialisierungen</Text>
                  <Text style={styles.tipText}>• Teile, was dich einzigartig macht</Text>
                  <Text style={styles.tipText}>• Sei authentisch und freundlich</Text>
                </View>
              </View>

              <Button
                title="Änderungen speichern"
                onPress={handleSave}
                style={styles.saveButton}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  scrollContent: {
    padding: spacing.md,
  },
  card: {
    padding: spacing.md,
  },
  formGap: {
    gap: spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: spacing.xs,
    color: colors.gray700,
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  charCount: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  tipBox: {
    backgroundColor: '#EFF6FF', // blue-50
    borderColor: '#BFDBFE', // blue-200
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.gray800,
  },
  tipList: {
    gap: 4,
  },
  tipText: {
    fontSize: 12,
    color: colors.gray600,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
});
