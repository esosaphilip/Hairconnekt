import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// Use React Native Linking API to avoid dependency on expo-linking

// --- Constants & Theme ---
const THEME_COLOR = '#8B4513'; // Main accent color
const SPACING = 16;
const CARD_RADIUS = 8;
const LIGHT_GRAY = '#F9FAFB'; // bg-gray-50
const TEXT_COLOR_DARK = '#1F2937';
const TEXT_COLOR_MUTED = '#6B7280'; // text-gray-600

// --- Mock Data ---
const faqs = [
  {
    question: 'Wie buche ich einen Termin?',
    answer:
      'Suche nach einem Braider in deiner Nähe, wähle einen Service und ein verfügbares Zeitfenster aus. Bestätige die Buchung und bezahle sicher über die App.',
  },
  {
    question: 'Kann ich einen Termin stornieren?',
    answer:
      'Ja, du kannst Termine bis zu 24 Stunden vor dem geplanten Zeitpunkt kostenlos stornieren. Bei späterer Stornierung können Gebühren anfallen.',
  },
  {
    question: 'Wie funktioniert die Bezahlung?',
    answer:
      'Zahlungen werden sicher über die App abgewickelt. Du kannst mit Kreditkarte, Debitkarte oder PayPal bezahlen. Die Zahlung erfolgt nach Bestätigung der Buchung.',
  },
  {
    question: 'Was ist, wenn ich mit dem Service unzufrieden bin?',
    answer:
      'Kontaktiere uns innerhalb von 24 Stunden nach dem Termin. Wir werden die Situation prüfen und eine angemessene Lösung finden.',
  },
  {
    question: 'Wie kann ich meine Daten ändern?',
    answer:
      'Gehe zu Profil > Persönliche Informationen, um deine Daten zu aktualisieren. Für Änderungen an E-Mail oder Telefonnummer ist eine Verifizierung erforderlich.',
  },
];

// --- Utility Components ---

type CustomCardProps = { children?: React.ReactNode; style?: any };
const CustomCard = ({ children, style }: CustomCardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

type CustomButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
  variant?: 'primary' | 'outline';
  loading?: boolean;
};
const CustomButton = ({ title, onPress, disabled, style, textStyle, variant = 'primary', loading = false }: CustomButtonProps) => {
  const isPrimary = variant === 'primary';
  const buttonStyle = [
    styles.buttonBase,
    isPrimary ? styles.buttonPrimary : styles.buttonOutline,
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];
  const textStyles = [
    styles.buttonText,
    isPrimary ? styles.buttonTextPrimary : styles.buttonTextOutline,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? 'white' : THEME_COLOR} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// --- Quick Contact Item ---
type ContactOptionProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  onPress?: () => void;
};
const ContactOption = ({ iconName, iconColor, bgColor, title, onPress }: ContactOptionProps) => (
  <TouchableOpacity onPress={onPress} style={styles.contactOptionButton}>
    <View style={[styles.contactIconWrapper, { backgroundColor: bgColor }]}>
      <Ionicons name={iconName} size={24} color={iconColor} />
    </View>
    <Text style={styles.contactOptionTitle}>{title}</Text>
  </TouchableOpacity>
);

// --- FAQ Accordion Item (Manual Implementation) ---
type FAQItemProps = {
  faq: { question: string; answer: string };
  index: number;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
};
const FAQItem = ({ faq, index, activeIndex, setActiveIndex }: FAQItemProps) => {
  const isActive = activeIndex === index;

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        onPress={() => setActiveIndex(isActive ? null : index)}
        style={styles.faqTrigger}
      >
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons
          name={isActive ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color={TEXT_COLOR_DARK}
        />
      </TouchableOpacity>
      {isActive && (
        <View style={styles.faqContent}>
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );
};

// --- Main Screen Component ---

export function SupportScreen() {
  const navigation = useNavigation();
  const [contactForm, setContactForm] = useState<{ subject: string; message: string }>({
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  const handleSendMessage = async () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }

    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    Alert.alert('Erfolg', 'Nachricht wurde gesendet! Wir melden uns in Kürze.');
    setContactForm({ subject: '', message: '' });
  };

  const handleDeepLink = (type: 'whatsapp' | 'mailto' | 'tel', value: string) => {
    switch (type) {
      case 'whatsapp':
        Linking.openURL(`whatsapp://send?phone=${value}`).catch(() => {
          Alert.alert('Fehler', 'WhatsApp ist auf diesem Gerät nicht installiert oder der Link konnte nicht geöffnet werden.');
        });
        break;
      case 'mailto':
        Linking.openURL(`mailto:${value}`).catch(() => {
          Alert.alert('Fehler', 'E-Mail-Anwendung konnte nicht geöffnet werden.');
        });
        break;
      case 'tel':
        Linking.openURL(`tel:${value}`).catch(() => {
          Alert.alert('Fehler', 'Telefonfunktion konnte nicht geöffnet werden.');
        });
        break;
      default:
        break;
    }
  };

  const navigateToResource = (path: string) => {
    // In a real app, this would use navigation.navigate(path)
    Alert.alert('Navigation', `Navigiere zu: ${path} (Diese Seite wird in einem vollständigen App-Setup geladen)`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hilfe & Support</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          {/* Quick Contact Options */}
          <View style={styles.contactOptionsGrid}>
            <ContactOption
              iconName="logo-whatsapp"
              iconColor="#10B981" // text-green-600
              bgColor="#D1FAE5" // bg-green-100
              title="WhatsApp"
              onPress={() => handleDeepLink('whatsapp', '+491511234567')}
            />

            <ContactOption
              iconName="mail-outline"
              iconColor="#3B82F6" // text-blue-600
              bgColor="#DBEAFE" // bg-blue-100
              title="E-Mail"
              onPress={() => handleDeepLink('mailto', 'support@hairconnekt.de')}
            />

            <ContactOption
              iconName="call-outline"
              iconColor="#9333EA" // text-purple-600
              bgColor="#EDE9FE" // bg-purple-100
              title="Anrufen"
              onPress={() => handleDeepLink('tel', '+491511234567')}
            />
          </View>

          {/* FAQ Section */}
          <CustomCard style={styles.faqCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-circle-outline" size={20} color={THEME_COLOR} />
              <Text style={styles.sectionTitle}>Häufig gestellte Fragen</Text>
            </View>
            <View style={styles.accordionContainer}>
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  index={index}
                  activeIndex={activeFAQIndex}
                  setActiveIndex={setActiveFAQIndex}
                />
              ))}
            </View>
          </CustomCard>

          {/* Contact Form */}
          <CustomCard style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="send-outline" size={20} color={THEME_COLOR} />
              <Text style={styles.sectionTitle}>Nachricht senden</Text>
            </View>
            <View style={styles.formContent}>
              <View>
                <Text style={styles.label}>Betreff</Text>
                <TextInput
                  style={styles.input}
                  value={contactForm.subject}
                  onChangeText={(text) =>
                    setContactForm({ ...contactForm, subject: text })
                  }
                  placeholder="Worum geht es?"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View>
                <Text style={styles.label}>Nachricht</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={contactForm.message}
                  onChangeText={(text) =>
                    setContactForm({ ...contactForm, message: text })
                  }
                  placeholder="Beschreibe dein Anliegen..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={5}
                />
              </View>
              <CustomButton
                title={isSending ? 'Wird gesendet...' : 'Nachricht senden'}
                onPress={handleSendMessage}
                loading={isSending}
                disabled={isSending || !contactForm.subject || !contactForm.message}
                style={styles.submitButton}
                textStyle={styles.submitButtonText}
              />
            </View>
          </CustomCard>

          {/* Help Resources */}
          <CustomCard style={styles.resourcesCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={THEME_COLOR} />
              <Text style={styles.sectionTitle}>Weitere Ressourcen</Text>
            </View>
            <View style={styles.resourceList}>
              <TouchableOpacity
                onPress={() => navigateToResource('/terms')}
                style={styles.resourceItem}
              >
                <Text style={styles.resourceItemText}>Allgemeine Geschäftsbedingungen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigateToResource('/privacy-policy')}
                style={styles.resourceItem}
              >
                <Text style={styles.resourceItemText}>Datenschutzerklärung</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigateToResource('/user-manual')}
                style={styles.resourceItem}
              >
                <Text style={styles.resourceItemText}>Benutzerhandbuch</Text>
              </TouchableOpacity>
            </View>
          </CustomCard>

          {/* Support Hours */}
          <CustomCard style={styles.hoursCard}>
            <Text style={styles.hoursTitle}>Support-Zeiten</Text>
            <Text style={styles.hoursDescription}>
              Unser Support-Team ist für dich da:
            </Text>
            <View style={styles.hoursList}>
              <Text style={styles.hoursListItem}>• Montag - Freitag: 9:00 - 18:00 Uhr</Text>
              <Text style={styles.hoursListItem}>• Samstag: 10:00 - 16:00 Uhr</Text>
              <Text style={styles.hoursListItem}>• Sonntag: Geschlossen</Text>
            </View>
            <Text style={styles.hoursFooter}>
              E-Mail-Anfragen werden innerhalb von 24 Stunden beantwortet.
            </Text>
          </CustomCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: LIGHT_GRAY,
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    gap: SPACING,
    padding: SPACING,
  },

  // Header
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 10,
  },
  backButton: {
    paddingRight: 8,
  },
  headerTitle: {
    color: TEXT_COLOR_DARK,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySpace: {
    width: 24,
  },

  // Card Base Style
  card: {
    backgroundColor: 'white',
    borderRadius: CARD_RADIUS,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // Quick Contact Options
  contactOptionsGrid: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  contactOptionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    elevation: 1,
    flex: 1,
    padding: SPACING / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contactIconWrapper: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  contactOptionTitle: {
    color: TEXT_COLOR_DARK,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // General Section Styles
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING,
  },
  sectionTitle: {
    color: TEXT_COLOR_DARK,
    fontSize: 16,
    fontWeight: '600',
  },

  // FAQ Section
  faqCard: {
    padding: SPACING,
  },
  accordionContainer: {
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
  },
  faqItem: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  faqTrigger: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  faqQuestion: {
    color: TEXT_COLOR_DARK,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingRight: 10,
  },
  faqContent: {
    paddingVertical: 8,
  },
  faqAnswer: {
    color: TEXT_COLOR_MUTED,
    fontSize: 14,
    lineHeight: 20,
  },

  // Contact Form
  formCard: {
    padding: SPACING,
  },
  formContent: {
    gap: SPACING,
  },
  label: {
    color: TEXT_COLOR_DARK,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F3F4F6', // Lighter background for input
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: TEXT_COLOR_DARK,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonBase: {
    alignItems: 'center',
    borderRadius: CARD_RADIUS,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: THEME_COLOR,
  },
  // Outline button style used when variant === 'outline'
  buttonOutline: {
    backgroundColor: 'white',
    borderColor: THEME_COLOR,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: 'white',
  },
  // Text color for outline variant
  buttonTextOutline: {
    color: THEME_COLOR,
  },
  submitButton: {
    // Overrides default button styles if needed
  },
  submitButtonText: {
    // Overrides default text styles if needed
  },

  // Help Resources
  resourcesCard: {
    padding: SPACING,
  },
  resourceList: {
    gap: 8,
  },
  resourceItem: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: 12,
    width: '100%',
  },
  resourceItemText: {
    color: TEXT_COLOR_DARK,
    fontSize: 14,
    fontWeight: '500',
  },

  // Support Hours
  hoursCard: {
    padding: SPACING,
    backgroundColor: '#EFF6FF', // bg-blue-50
    borderColor: '#BFDBFE', // border-blue-100
    borderWidth: 1,
    elevation: 0,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A', // text-blue-900
    marginBottom: 4,
  },
  hoursDescription: {
    fontSize: 14,
    color: '#1E40AF', // text-blue-800
    marginBottom: 8,
  },
  hoursList: {
    gap: 2,
    marginBottom: 8,
  },
  hoursListItem: {
    color: '#1E40AF',
    fontSize: 14, // text-blue-800
  },
  hoursFooter: {
    fontSize: 12,
    color: '#1D4ED8', // text-blue-700
    marginTop: 8,
  },
});
