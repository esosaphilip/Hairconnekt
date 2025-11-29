import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Platform,
  // 💡 FIX: Import missing type definitions here
  StyleProp, 
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, shadows } from '@/theme/tokens';

// --- Icon Mocking (Needed because the modules are not defined) ---
type IconProps = { size: number; color: string; style?: object };

const ArrowLeft = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'<'}</Text>;
const Building2 = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'🏢'}</Text>;
const Mail = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'✉️'}</Text>;
const Phone = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'📞'}</Text>;
const Scale = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'⚖️'}</Text>;
const FileText = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'📄'}</Text>;

// --- Constants ---
const COLORS = {
  primary: colors.primary,
  white: colors.white,
  grayBackground: colors.gray50,
  text: colors.gray800,
  textSecondary: colors.gray600,
  separator: colors.gray200,
  shadow: colors.black,
};
const SPACING = spacing;

// --- Reusable Components ---

// CardProps now correctly references the imported types
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

const Separator = () => <View style={styles.separator} />;

// Helper to render legal paragraphs
const renderParagraphs = (texts: string[]) => (
    <View style={styles.paragraphContainer}>
      {texts.map((text, index) => (
        <Text key={index} style={[styles.bodyText, index > 0 && { marginTop: SPACING.md }]}>
          {text}
        </Text>
      ))}
    </View>
);


// --- Main Screen Component ---

export function ImprintScreen() {
  const navigation = useNavigation();
  
  const phoneNumber = '+493012345678';
  const infoEmail = 'info@hairconnekt.de';
  const supportEmail = 'support@hairconnekt.de';
  const dataEmail = 'datenschutz@hairconnekt.de';
  const odrLink = 'https://ec.europa.eu/consumers/odr';

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open link:', err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header logic is kept separate for clean structure */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Impressum</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Impressum Notice */}
        <Card style={styles.imprintNoticeCard}>
          <View style={styles.imprintNoticeContent}>
            <Scale size={24} color={COLORS.white} style={{ marginRight: SPACING.md }} />
            <View>
              <Text style={styles.imprintNoticeTitle}>Impressum</Text>
              <Text style={styles.imprintNoticeSubtitle}>Angaben gemäß § 5 TMG</Text>
            </View>
          </View>
        </Card>

        {/* Company Information */}
        <Card style={styles.mainCard}>
          <View style={styles.sectionContainer}>
            <View>
              <View style={styles.sectionHeader}>
                <Building2 size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                <Text style={styles.sectionTitle}>Unternehmensangaben</Text>
              </View>
              <Text style={styles.bodyText}>
                {'HairConnekt GmbH\nMusterstraße 123\n10115 Berlin\nDeutschland'}
              </Text>
            </View>

            <Separator />
            <View>
              <Text style={styles.sectionSubtitle}>Handelsregister</Text>
              <Text style={styles.bodyText}>
                {'Registergericht: Amtsgericht Berlin-Charlottenburg\nRegisternummer: HRB 123456 B'}
              </Text>
            </View>

            <Separator />
            <View>
              <Text style={styles.sectionSubtitle}>Vertreten durch</Text>
              <Text style={styles.bodyText}>
                Geschäftsführer: Max Mustermann, Lisa Schneider
              </Text>
            </View>

            <Separator />
            <View>
              <Text style={styles.sectionSubtitle}>Umsatzsteuer-ID</Text>
              <Text style={styles.bodyText}>
                {'Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:\nDE123456789'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.mainCard}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Mail size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.sectionTitle}>Kontaktdaten</Text>
            </View>

            <View style={styles.contactDetails}>
              
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Telefon</Text>
                <TouchableOpacity 
                  onPress={() => handleLinkPress(`tel:${phoneNumber}`)}
                  style={styles.contactLink}
                >
                  <Phone size={16} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
                  <Text style={styles.contactLinkText}>{phoneNumber.replace('+493012345678', '+49 30 12345678')}</Text>
                </TouchableOpacity>
              </View>

              <Separator />

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>E-Mail</Text>
                <TouchableOpacity 
                  onPress={() => handleLinkPress(`mailto:${infoEmail}`)}
                  style={styles.contactLink}
                >
                  <Mail size={16} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
                  <Text style={styles.contactLinkText}>{infoEmail}</Text>
                </TouchableOpacity>
              </View>

              <Separator />

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Support-E-Mail</Text>
                <TouchableOpacity 
                  onPress={() => handleLinkPress(`mailto:${supportEmail}`)}
                  style={styles.contactLink}
                >
                  <Mail size={16} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
                  <Text style={styles.contactLinkText}>{supportEmail}</Text>
                </TouchableOpacity>
              </View>

              <Separator />

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Datenschutz-E-Mail</Text>
                <TouchableOpacity 
                  onPress={() => handleLinkPress(`mailto:${dataEmail}`)}
                  style={styles.contactLink}
                >
                  <Mail size={16} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
                  <Text style={styles.contactLinkText}>{dataEmail}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Responsible for Content */}
        <Card style={styles.mainCard}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>Verantwortlich für den Inhalt</Text>
          <Text style={styles.bodyText}>
            {'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:\nMax Mustermann\nHairConnekt GmbH\nMusterstraße 123\n10115 Berlin'}
          </Text>
        </Card>

        {/* Online Dispute Resolution */}
        <Card style={styles.mainCard}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>Online-Streitbeilegung</Text>
          <Text style={styles.bodyText}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          </Text>
          <TouchableOpacity 
            onPress={() => handleLinkPress(odrLink)}
            style={{ marginTop: SPACING.sm }}
          >
            <Text style={styles.externalLink}>{odrLink}</Text>
          </TouchableOpacity>
          <Text style={[styles.bodyText, { marginTop: SPACING.sm }]}>
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </Text>
        </Card>

        {/* Consumer Dispute Resolution */}
        <Card style={styles.mainCard}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>Verbraucherstreitbeilegung</Text>
          <Text style={styles.bodyText}>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </Text>
        </Card>

        {/* Liability for Content */}
        <Card style={styles.mainCard}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.sectionTitle}>Haftung für Inhalte</Text>
          </View>
          {renderParagraphs([
            `Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.`,
            `Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.`,
          ])}
        </Card>

        {/* Liability for Links */}
        <Card style={styles.mainCard}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>Haftung für Links</Text>
          {renderParagraphs([
            `Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.`,
            `Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.`,
          ])}
        </Card>

        {/* Copyright */}
        <Card style={styles.mainCard}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>Urheberrecht</Text>
          {renderParagraphs([
            `Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.`,
            `Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.`,
          ])}
        </Card>

        {/* Image Credits */}
        <Card style={styles.mainCard}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>Bildnachweise</Text>
          <Text style={styles.bodyText}>
            Die auf dieser Website verwendeten Bilder stammen von:
          </Text>
          <View style={styles.imageCreditsList}>
            <Text style={styles.listItem}>• Unsplash (unsplash.com) - Lizenzfrei</Text>
            <Text style={styles.listItem}>• Eigene Fotografien</Text>
            <Text style={styles.listItem}>• Mit Genehmigung der Dienstleister bereitgestellte Portfolio-Bilder</Text>
          </View>
        </Card>

        {/* Legal Links (Grid) */}
        <View style={styles.legalLinksGrid}>
          <TouchableOpacity
            onPress={() => (navigation as unknown as { navigate: (route: string, params?: unknown) => void }).navigate("Terms")}
            style={[styles.legalLinkButton, { marginRight: SPACING.sm / 2 }]}
          >
            <FileText size={24} color={COLORS.primary} style={{ marginBottom: SPACING.xs }} />
            <Text style={styles.legalLinkText}>AGB</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (navigation as unknown as { navigate: (route: string, params?: unknown) => void }).navigate("PrivacyPolicy")}
            style={[styles.legalLinkButton, { marginLeft: SPACING.sm / 2 }]}
          >
            <Scale size={24} color={COLORS.primary} style={{ marginBottom: SPACING.xs }} />
            <Text style={styles.legalLinkText}>Datenschutz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contactDetails: {
    marginTop: SPACING.sm, 
  },
  contactItem: {
    marginBottom: SPACING.xs,
  },
  contactLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  contactLink: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  contactLinkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  externalLink: {
    color: COLORS.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 3,
      },
    }),
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? SPACING.xs : 0,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  imageCreditsList: {
    marginTop: SPACING.sm,
    paddingLeft: SPACING.md,
  }, 
  imprintNoticeCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
  },
  imprintNoticeContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  imprintNoticeSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  imprintNoticeTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  
  legalLinkButton: {
    flex: 1,
    ...shadows.sm,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.separator,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  legalLinkText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  legalLinksGrid: {
    flexDirection: 'row',
  },
  listItem: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  mainCard: {
    padding: SPACING.lg,
  },
  paragraphContainer: {
    marginBottom: -SPACING.md, // Adjust for the spacing added by renderParagraphs
    marginTop: SPACING.sm,
  },
  placeholderView: {
    width: 24,
  },
  safeArea: {
    backgroundColor: COLORS.grayBackground,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  sectionContainer: {},
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  separator: {
    backgroundColor: COLORS.separator,
    height: 1,
    marginVertical: SPACING.sm,
  },
});
