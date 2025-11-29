import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform, // For platform-specific print/download messages
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// --- Constants & Theme ---
const THEME_COLOR = '#8B4513'; // Main accent color
const SPACING = 16;
const CARD_RADIUS = 8;
const TEXT_COLOR = '#374151'; // text-gray-700
const LIGHT_GRAY = '#F9FAFB'; // bg-gray-50

// --- Utility Components ---

type CustomCardProps = { children?: React.ReactNode; style?: any };
const CustomCard = ({ children, style }: CustomCardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

type CustomButtonProps = {
  title: string;
  onPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: any;
  textStyle?: any;
  variant?: 'outline' | 'primary';
};
const CustomButton = ({ title, onPress, iconName, style, textStyle, variant = 'outline' }: CustomButtonProps) => {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.buttonBase,
        isOutline ? styles.buttonOutline : styles.buttonPrimary,
        style,
      ]}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={18}
          color={isOutline ? TEXT_COLOR : 'white'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[styles.buttonText, isOutline ? styles.buttonTextOutline : styles.buttonTextPrimary, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const Separator = () => <View style={styles.separator} />;

// --- Main Screen Component ---

export function TermsScreen() {
  const navigation = useNavigation();

  const handleDownload = () => {
    Alert.alert('Download', 'Die AGB werden als PDF auf Ihr Gerät heruntergeladen...', [{ text: 'OK' }]);
  };

  const handlePrint = () => {
    // Note: window.print() is not available in React Native.
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert(
        'Drucken',
        'In einer nativen App würde hier die Druckfunktion des Betriebssystems aufgerufen.',
        [{ text: 'OK' }]
      );
    }
  };

  const navigateToScreen = (screen: string) => {
    Alert.alert('Navigation', `Navigiere zu ${screen}. (Funktion wird in einer vollständigen App-Struktur implementiert)`);
  };

  const RenderListItem = ({ text }: { text: string }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemBullet}>\u2022</Text>
      <Text style={styles.listItemText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AGB</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          {/* Last Updated Card */}
          <CustomCard style={styles.updatedCard}>
            <View style={styles.updatedCardContent}>
              <Ionicons name="document-text-outline" size={24} color="white" />
              <View>
                <Text style={styles.updatedCardTitle}>Allgemeine Geschäftsbedingungen</Text>
                <Text style={styles.updatedCardDate}>Zuletzt aktualisiert: 29. Oktober 2024</Text>
              </View>
            </View>
          </CustomCard>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <CustomButton
              title="Download PDF"
              onPress={handleDownload}
              iconName="download-outline"
              style={{ flex: 1 }}
            />
            <CustomButton
              title="Drucken"
              onPress={handlePrint}
              iconName="print-outline"
              style={{ flex: 1 }}
            />
          </View>

          {/* Terms Content */}
          <CustomCard style={styles.termsContentCard}>
            <View style={styles.termsContent}>
              <Section title="1. Geltungsbereich">
                <Text style={styles.p}>
                  Diese Allgemeinen Geschäftsbedingungen (im Folgenden "AGB") gelten für die Nutzung der HairConnekt-Plattform und aller damit verbundenen Dienste.
                </Text>
                <Text style={styles.p}>
                  HairConnekt ist eine Vermittlungsplattform, die Kunden mit unabhängigen Friseuren, Friseursalons und Barbieren (zusammen "Dienstleister") verbindet.
                </Text>
              </Section>

              <Separator />

              <Section title="2. Vertragspartner">
                <Text style={styles.p}>
                  <Text style={styles.strong}>Betreiber der Plattform:</Text>{'\n'}
                  HairConnekt GmbH{'\n'}
                  Musterstraße 123{'\n'}
                  10115 Berlin, Deutschland{'\n'}
                  E-Mail: info@hairconnekt.de{'\n'}
                  Telefon: +49 30 12345678
                </Text>
                <Text style={styles.p}>
                  Handelsregister: HRB 123456 B{'\n'}
                  Registergericht: Amtsgericht Berlin-Charlottenburg{'\n'}
                  Geschäftsführer: Max Mustermann
                </Text>
              </Section>

              <Separator />

              <Section title="3. Leistungsbeschreibung">
                <Text style={styles.p}>
                  HairConnekt stellt eine Online-Plattform bereit, über die:
                </Text>
                <View style={styles.listContainer}>
                  <RenderListItem text="Kunden Dienstleister finden und kontaktieren können" />
                  <RenderListItem text="Termine für Friseurdienstleistungen gebucht werden können" />
                  <RenderListItem text="Zahlungen sicher abgewickelt werden" />
                  <RenderListItem text="Bewertungen und Rezensionen abgegeben werden können" />
                  <RenderListItem text="Kommunikation zwischen Kunden und Dienstleistern ermöglicht wird" />
                </View>
                <Text style={[styles.p, { marginTop: 8 }]}>
                  HairConnekt ist selbst kein Dienstleister und erbringt keine Friseurdienstleistungen. Die Dienstleistungen werden ausschließlich von den unabhängigen Dienstleistern erbracht.
                </Text>
              </Section>

              <Separator />

              <Section title="4. Nutzerkonto und Registrierung">
                <Text style={styles.p}>
                  <Text style={styles.strong}>4.1 Registrierung</Text>{'\n'}
                  Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Bei der Registrierung müssen Sie wahrheitsgemäße und vollständige Angaben machen.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>4.2 Altersbeschränkung</Text>{'\n'}
                  Die Nutzung von HairConnekt ist nur Personen ab 18 Jahren gestattet. Mit der Registrierung bestätigen Sie, dass Sie mindestens 18 Jahre alt sind.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>4.3 Account-Sicherheit</Text>{'\n'}
                  Sie sind verpflichtet, Ihre Zugangsdaten geheim zu halten und uns unverzüglich zu informieren, falls Dritte unbefugt Zugang zu Ihrem Account erhalten haben.
                </Text>
              </Section>

              <Separator />

              <Section title="5. Buchungen und Zahlungen">
                <Text style={styles.p}>
                  <Text style={styles.strong}>5.1 Buchungsvorgang</Text>{'\n'}
                  Buchungen erfolgen über die Plattform. Mit der Buchungsbestätigung kommt ein Vertrag zwischen Ihnen und dem Dienstleister zustande.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>5.2 Preise</Text>{'\n'}
                  Alle Preise verstehen sich in Euro inklusive der gesetzlichen Mehrwertsteuer. Die Preise werden von den Dienstleistern festgelegt.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>5.3 Zahlung</Text>{'\n'}
                  Die Zahlung erfolgt über die von HairConnekt bereitgestellten Zahlungsmethoden (Kreditkarte, Debitkarte, PayPal). HairConnekt wickelt die Zahlungen als Zahlungsdienstleister ab.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>5.4 Servicegebühr</Text>{'\n'}
                  HairConnekt erhebt eine Servicegebühr von 10% auf den Buchungspreis. Diese wird transparent bei der Buchung ausgewiesen.
                </Text>
              </Section>

              <Separator />

              <Section title="6. Stornierung und Rücktritt">
                <Text style={styles.p}>
                  <Text style={styles.strong}>6.1 Stornierung durch den Kunden</Text>{'\n'}
                  Buchungen können bis zu 24 Stunden vor dem Termin kostenlos storniert werden. Bei späterer Stornierung oder Nichterscheinen wird der volle Betrag fällig.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>6.2 Stornierung durch den Dienstleister</Text>{'\n'}
                  Bei Stornierung durch den Dienstleister erhalten Sie eine vollständige Rückerstattung. Der Dienstleister kann für Stornierungen sanktioniert werden.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>6.3 Rückerstattung</Text>{'\n'}
                  Rückerstattungen werden innerhalb von 5-10 Werktagen auf die ursprüngliche Zahlungsmethode vorgenommen.
                </Text>
              </Section>

              <Separator />

              <Section title="7. Pflichten der Nutzer">
                <Text style={styles.p}>
                  Als Nutzer verpflichten Sie sich:
                </Text>
                <View style={styles.listContainer}>
                  <RenderListItem text="Keine rechtswidrigen, beleidigenden oder anstößigen Inhalte zu veröffentlichen" />
                  <RenderListItem text="Keine falschen oder irreführenden Informationen bereitzustellen" />
                  <RenderListItem text="Die Rechte Dritter, insbesondere Urheberrechte, zu respektieren" />
                  <RenderListItem text="Termine pünktlich wahrzunehmen oder rechtzeitig zu stornieren" />
                  <RenderListItem text="Sich respektvoll gegenüber anderen Nutzern zu verhalten" />
                </View>
              </Section>

              <Separator />

              <Section title="8. Bewertungen und Rezensionen">
                <Text style={styles.p}>
                  <Text style={styles.strong}>8.1 Veröffentlichung</Text>{'\n'}
                  Sie können nach einem Termin eine Bewertung abgeben. Bewertungen müssen ehrlich, fair und sachlich sein.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>8.2 Löschung</Text>{'\n'}
                  HairConnekt behält sich das Recht vor, unangemessene, beleidigende oder nachweislich falsche Bewertungen zu entfernen.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>8.3 Rechte</Text>{'\n'}
                  Mit der Veröffentlichung einer Bewertung räumen Sie HairConnekt das nicht-exklusive, weltweite Recht ein, diese zu nutzen und anzuzeigen.
                </Text>
              </Section>

              <Separator />

              <Section title="9. Haftung">
                <Text style={styles.p}>
                  <Text style={styles.strong}>9.1 Haftungsbeschränkung</Text>{'\n'}
                  HairConnekt haftet nur als Vermittlungsplattform. Für die Qualität der erbrachten Dienstleistungen sind ausschließlich die Dienstleister verantwortlich.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>9.2 Gewährleistung</Text>{'\n'}
                  HairConnekt übernimmt keine Gewährleistung für die ständige Verfügbarkeit der Plattform. Wartungsarbeiten können zu vorübergehenden Unterbrechungen führen.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>9.3 Schadenersatz</Text>{'\n'}
                  Die Haftung von HairConnekt ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit gesetzlich zulässig.
                </Text>
              </Section>

              <Separator />

              <Section title="10. Datenschutz">
                <Text style={styles.p}>
                  Der Schutz Ihrer persönlichen Daten ist uns wichtig. Details zur Datenverarbeitung finden Sie in unserer{' '}
                  <TouchableOpacity onPress={() => navigateToScreen('Datenschutzerklärung')}>
                    <Text style={styles.linkText}>Datenschutzerklärung</Text>
                  </TouchableOpacity>
                  .
                </Text>
              </Section>

              <Separator />

              <Section title="11. Änderungen der AGB">
                <Text style={styles.p}>
                  HairConnekt behält sich das Recht vor, diese AGB zu ändern. Änderungen werden Ihnen per E-Mail mitgeteilt. Widersprechen Sie nicht innerhalb von 14 Tagen, gelten die Änderungen als akzeptiert.
                </Text>
              </Section>

              <Separator />

              <Section title="12. Schlussbestimmungen">
                <Text style={styles.p}>
                  <Text style={styles.strong}>12.1 Anwendbares Recht</Text>{'\n'}
                  Es gilt das Recht der Bundesrepublik Deutschland.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>12.2 Gerichtsstand</Text>{'\n'}
                  Gerichtsstand ist Berlin, soweit gesetzlich zulässig.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>12.3 Salvatorische Klausel</Text>{'\n'}
                  Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                </Text>
                <Text style={styles.p}>
                  <Text style={styles.strong}>12.4 Online-Streitbeilegung</Text>{'\n'}
                  Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{' '}
                  <Text style={styles.linkText} onPress={() => Alert.alert('Externer Link', 'Öffne https://ec.europa.eu/consumers/odr')}>
                    https://ec.europa.eu/consumers/odr
                  </Text>
                </Text>
              </Section>
            </View>
          </CustomCard>

          {/* Contact Info */}
          <CustomCard style={styles.contactCard}>
            <Text style={styles.contactTitle}>Fragen zu den AGB?</Text>
            <Text style={styles.contactText}>
              Bei Fragen oder Anmerkungen zu unseren AGB kontaktieren Sie uns gerne.
            </Text>
            <CustomButton
              title="Zum Support"
              onPress={() => navigateToScreen('Support')}
              iconName="help-buoy-outline"
              style={styles.contactButton}
              textStyle={styles.contactButtonText}
            />
          </CustomCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Small helper component for terms sections
type SectionProps = { title: string; children?: React.ReactNode };
const Section = ({ title, children }: SectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: LIGHT_GRAY,
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: SPACING,
    gap: SPACING,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySpace: {
    width: 24, // To balance the back button
  },

  // Card Base Style
  card: {
    backgroundColor: 'white',
    borderRadius: CARD_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  // Updated Card
  updatedCard: {
    padding: SPACING,
    backgroundColor: THEME_COLOR,
  },
  updatedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING,
  },
  updatedCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  updatedCardDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
  },
  buttonOutline: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB', // border-gray-300
  },
  buttonPrimary: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: TEXT_COLOR,
  },
  buttonTextPrimary: {
    color: 'white',
  },

  // Terms Content
  termsContentCard: {
    padding: SPACING,
  },
  termsContent: {
    gap: SPACING,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  p: {
    fontSize: 14,
    color: TEXT_COLOR,
    lineHeight: 20,
    marginBottom: 8,
  },
  strong: {
    fontWeight: '700',
  },
  listContainer: {
    marginLeft: 8,
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 10,
  },
  listItemBullet: {
    fontSize: 14,
    color: TEXT_COLOR,
    marginRight: 8,
  },
  listItemText: {
    fontSize: 14,
    color: TEXT_COLOR,
    flexShrink: 1,
    lineHeight: 20,
  },
  linkText: {
    color: THEME_COLOR,
    textDecorationLine: 'underline',
    fontSize: 14,
  },

  // Contact Card
  contactCard: {
    padding: SPACING,
    backgroundColor: '#F3F4F6', // bg-gray-100
    elevation: 0, // No shadow for this card
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
  },
  contactButtonText: {
    color: TEXT_COLOR,
  },
});
