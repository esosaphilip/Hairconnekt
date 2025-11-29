import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import type { StyleProp } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/tokens';

// --- Reusing Placeholder Components from the previous refactor ---

type IconPlaceholderProps = {
  name: 'ArrowLeft' | 'Cookie' | 'Info' | 'Settings' | 'Shield' | string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const IconPlaceholder: React.FC<IconPlaceholderProps> = ({ name, size = 20, color = 'black', style = undefined }) => {
  let displayChar;
  switch (name) {
    case 'ArrowLeft': displayChar = '←'; break;
    case 'Cookie': displayChar = '🍪'; break;
    case 'Info': displayChar = 'ⓘ'; break;
    case 'Settings': displayChar = '⚙️'; break;
    case 'Shield': displayChar = '🛡️'; break;
    default: displayChar = '•';
  }
  return <Text style={[{ fontSize: size, color: color }, style]}>{displayChar}</Text>;
};

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.buttonBase, styles.buttonPrimary, style]}
    >
      <Text style={[styles.buttonText, styles.textWhite, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

type CardProps = { children: React.ReactNode; style?: StyleProp<ViewStyle> };
const Card: React.FC<CardProps> = ({ children, style }) => (
  <View style={[styles.cardBase, style]}>{children}</View>
);

const useNavigationMock = () => ({
  goBack: () => console.log('Go Back Pressed (Navigating back)'),
  navigate: (screen: string) => console.log(`Maps to ${screen}`),
});

// --- CookiePolicyScreen Component ---

export function CookiePolicyScreen() {
  // const navigation = useNavigation(); // Actual hook to use
  const navigation = useNavigationMock(); // Mocked for demonstration

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleManageSettings = () => {
    navigation.navigate('SettingsScreen'); // Assuming a route '/settings' maps to 'SettingsScreen'
  };

  const sections = [
    {
      title: 'Was sind Cookies?',
      iconName: 'Info',
      content: [
        'Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere App verwenden. Sie helfen uns, Ihre Präferenzen zu speichern und Ihre Nutzererfahrung zu verbessern.',
        'Cookies können von uns (Erstanbieter-Cookies) oder von Drittanbietern (Drittanbieter-Cookies) gesetzt werden.'
      ]
    },
    {
      title: 'Welche Cookies verwenden wir?',
      iconName: 'Cookie',
      subsections: [
        {
          subtitle: 'Notwendige Cookies',
          items: [
            'Session-Cookies: Ermöglichen die grundlegende Funktionalität der App',
            'Authentifizierungs-Cookies: Halten Sie angemeldet',
            'Sicherheits-Cookies: Schützen vor betrügerischen Aktivitäten',
            'Gültigkeit: Session-basiert oder bis zu 30 Tage'
          ]
        },
        {
          subtitle: 'Funktionale Cookies',
          items: [
            'Präferenz-Cookies: Speichern Ihre Sprachauswahl',
            'Standort-Cookies: Merken sich Ihre ausgewählte Stadt',
            'UI-Präferenzen: Speichern Anzeigeeinstellungen',
            'Gültigkeit: Bis zu 12 Monate'
          ]
        },
        {
          subtitle: 'Analytische Cookies (Optional)',
          items: [
            'Nutzungsstatistiken: Helfen uns zu verstehen, wie die App genutzt wird',
            'Performance-Monitoring: Identifizieren technische Probleme',
            'Anonymisierte Daten: Keine persönliche Identifikation',
            'Gültigkeit: Bis zu 24 Monate'
          ]
        },
        {
          subtitle: 'Marketing-Cookies (Optional)',
          items: [
            'Personalisierte Werbung: Zeigen relevante Angebote',
            'Conversion-Tracking: Messen Kampagnenerfolg',
            'Social Media Integration: Teilen von Inhalten',
            'Gültigkeit: Bis zu 12 Monate'
          ]
        }
      ]
    },
    {
      title: 'Cookies verwalten',
      iconName: 'Settings',
      content: [
        'Sie können Ihre Cookie-Einstellungen jederzeit in den App-Einstellungen anpassen. Notwendige Cookies können nicht deaktiviert werden, da sie für die grundlegende Funktionalität erforderlich sind.',
        'Browser-Einstellungen: Sie können Cookies auch über Ihre Browser-Einstellungen verwalten oder löschen. Beachten Sie, dass dies die Funktionalität der App beeinträchtigen kann.'
      ]
    },
    {
      title: 'Drittanbieter-Cookies',
      iconName: 'Shield',
      content: [
        'Einige Cookies werden von vertrauenswürdigen Drittanbietern gesetzt, um bestimmte Funktionen bereitzustellen:',
      ],
      list: [
        'Google Maps: Für Standortdienste und Kartenanzeige',
        'Stripe: Für sichere Zahlungsabwicklung',
        'Firebase: Für Push-Benachrichtigungen und Authentifizierung',
        'Sentry: Für Fehlerüberwachung und Performance-Analyse'
      ]
    }
  ];

  const cookieTable = [
    { name: 'session_id', zweck: 'Sitzungsverwaltung', typ: 'Notwendig', dauer: 'Session' },
    { name: 'auth_token', zweck: 'Authentifizierung', typ: 'Notwendig', dauer: '30 Tage' },
    { name: 'csrf_token', zweck: 'Sicherheit', typ: 'Notwendig', dauer: 'Session' },
    { name: 'language', zweck: 'Sprachpräferenz', typ: 'Funktional', dauer: '12 Monate' },
    { name: 'city_preference', zweck: 'Standortwahl', typ: 'Funktional', dauer: '6 Monate' },
    { name: '_ga', zweck: 'Google Analytics', typ: 'Analytisch', dauer: '24 Monate' },
    { name: '_fbp', zweck: 'Facebook Pixel', typ: 'Marketing', dauer: '90 Tage' },
  ];

  // Helper to determine badge style
  const getBadgeStyle = (typ: 'Notwendig' | 'Funktional' | 'Analytisch' | 'Marketing' | string) => {
    switch (typ) {
      case 'Notwendig': return { bg: styles.badgeRed, text: styles.textRed };
      case 'Funktional': return { bg: styles.badgeBlue, text: styles.textBlue };
      case 'Analytisch': return { bg: styles.badgeGreen, text: styles.textGreen };
      case 'Marketing': return { bg: styles.badgePurple, text: styles.textPurple };
      default: return { bg: styles.badgeDefault, text: styles.textDefault };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <IconPlaceholder name="ArrowLeft" size={24} color={colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <IconPlaceholder name="Cookie" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Cookie-Richtlinie</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Last Updated */}
        <Card style={styles.lastUpdatedCard}>
          <Text style={styles.lastUpdatedText}>
            <Text style={styles.textBold}>Letzte Aktualisierung:</Text> 18. November 2025
          </Text>
          <Text style={styles.lastUpdatedSubText}>
            Diese Cookie-Richtlinie gilt für die HairConnekt App und alle zugehörigen Dienste.
          </Text>
        </Card>

        {/* Introduction */}
        <View style={styles.introTextContainer}>
          <Text style={styles.textBase}>
            Bei HairConnekt respektieren wir Ihre Privatsphäre und sind transparent darüber, wie wir Cookies verwenden. Diese Richtlinie erklärt, welche Cookies wir nutzen und warum.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <Card key={index} style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <IconPlaceholder name={section.iconName} size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.content && (
              <View style={styles.contentContainer}>
                {section.content.map((text, i) => (
                  <Text key={i} style={styles.textSmall}>
                    {text}
                  </Text>
                ))}
              </View>
            )}

            {section.list && (
              <View style={styles.listContainer}>
                {section.list.map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.textSmall}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {section.subsections && (
              <View style={styles.subsectionsContainer}>
                {section.subsections.map((subsection, i) => (
                  <View key={i} style={styles.subsectionItem}>
                    <Text style={styles.subsectionTitle}>
                      {subsection.subtitle}
                    </Text>
                    <View style={styles.sublistItemContainer}>
                      {subsection.items.map((item, j) => (
                        <View key={j} style={styles.sublistItem}>
                          <Text style={styles.sublistBullet}>•</Text>
                          <Text style={styles.textSmallGray}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))}

        {/* Cookie Table (Implemented using Views) */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cookie-Übersicht</Text>
          <ScrollView horizontal style={styles.tableScroll}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableCell, styles.headerText, styles.flex15]}>Name</Text>
                <Text style={[styles.tableCell, styles.headerText, styles.flex25]}>Zweck</Text>
                <Text style={[styles.tableCell, styles.headerText, styles.flex15]}>Typ</Text>
                <Text style={[styles.tableCell, styles.headerText, styles.flex15]}>Dauer</Text>
              </View>
              {/* Table Body */}
              {cookieTable.map((cookie, i) => {
                const badge = getBadgeStyle(cookie.typ);
                return (
                  <View key={i} style={[styles.tableRow, styles.tableBodyRow]}>
                    <View style={[styles.tableCell, styles.flex15]}>
                      <Text style={styles.cookieCode}>{cookie.name}</Text>
                    </View>
                    <Text style={[styles.tableCell, styles.tableBodyText, styles.flex25]}>{cookie.zweck}</Text>
                    <View style={[styles.tableCell, styles.flex15]}>
                      <View style={[styles.badge, badge.bg]}>
                        <Text style={[styles.badgeText, badge.text]}>{cookie.typ}</Text>
                      </View>
                    </View>
                    <Text style={[styles.tableCell, styles.tableBodyText, styles.flex15]}>{cookie.dauer}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Card>

        {/* Your Rights */}
        <Card style={styles.rightsCard}>
          <Text style={styles.sectionTitle}>Ihre Rechte</Text>
          <Text style={styles.textSmallMarginBottom}>
            Gemäß DSGVO haben Sie folgende Rechte bezüglich Cookies:
          </Text>
          <View style={styles.rightsList}>
            {[
              'Recht auf Information über verwendete Cookies',
              'Recht auf Ablehnung nicht-notwendiger Cookies',
              'Recht auf Löschung gespeicherter Cookies',
              'Recht auf Widerruf der Cookie-Einwilligung',
              'Recht auf Beschwerde bei der Datenschutzbehörde'
            ].map((right, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.rightBullet}>✓</Text>
                <Text style={styles.textSmall}>{right}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Contact */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Fragen?</Text>
          <Text style={styles.textSmallMarginBottom}>
            Bei Fragen zu unserer Cookie-Nutzung kontaktieren Sie uns bitte:
          </Text>
          <View style={styles.contactContainer}>
            <Text style={styles.contactText}>
              <Text style={styles.textBold}>E-Mail:</Text>{' '}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL('mailto:datenschutz@hairconnekt.de')}
              >
                datenschutz@hairconnekt.de
              </Text>
            </Text>
            <Text style={styles.contactText}>
              <Text style={styles.textBold}>Datenschutzbeauftragter:</Text>{' '}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL('mailto:dsb@hairconnekt.de')}
              >
                dsb@hairconnekt.de
              </Text>
            </Text>
          </View>
        </Card>

        {/* Action Button */}
        <View style={styles.actionButtonContainer}>
          <CustomButton
            title="Cookie-Einstellungen verwalten"
            onPress={handleManageSettings}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- StyleSheet for React Native Styles ---

const styles = StyleSheet.create({
  actionButtonContainer: {
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeBlue: { backgroundColor: colors.blue200 },
  badgeDefault: { backgroundColor: colors.gray100 },
  badgeGreen: { backgroundColor: colors.lightGreen },
  badgePurple: { backgroundColor: colors.lightBlue },
  badgeRed: { backgroundColor: colors.red200 },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonBase: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardBase: {
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 1,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  contactContainer: {
    gap: 8,
  },
  contactText: {
    color: colors.gray600,
    fontSize: 14,
  },
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentContainer: {
    gap: 12,
  },
  cookieCode: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray100,
    borderRadius: 4,
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  flex15: { flex: 1.5 },
  flex25: { flex: 2.5 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
    ...Platform.select({
      ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  headerText: {
    color: colors.gray600,
    fontWeight: '600',
  },
  headerTitle: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconBox: {
    alignSelf: 'flex-start',
    backgroundColor: colors.amber50,
    borderRadius: 8,
    padding: 8,
  },
  introTextContainer: {
    marginBottom: 24,
  },
  lastUpdatedCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.blue200,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  lastUpdatedSubText: {
    color: colors.blue600,
    fontSize: 14,
    marginTop: 4,
  },
  lastUpdatedText: {
    color: colors.blue900,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  listBullet: {
    color: colors.secondary,
    fontSize: 16,
    marginTop: 2,
  },
  listContainer: {
    gap: 8,
    marginTop: 12,
  },
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  rightBullet: {
    color: colors.primary,
    fontSize: 16,
    marginTop: 2,
  },
  rightsCard: {
    backgroundColor: colors.amber50,
    borderColor: colors.amber200,
    borderWidth: 1,
    marginBottom: 24,
  },
  rightsList: {
    gap: 8,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.gray800,
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  sublistBullet: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 1,
  },
  sublistItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  sublistItemContainer: {
    gap: 6,
  },
  subsectionItem: {
    borderLeftColor: colors.amber200,
    borderLeftWidth: 2,
    paddingLeft: 16,
  },
  subsectionTitle: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  subsectionsContainer: {
    gap: 16,
    marginTop: 16,
  },
  table: {
    borderColor: colors.gray200,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 400,
    overflow: 'hidden',
    width: '100%',
  },
  tableBodyRow: {
    backgroundColor: colors.white,
  },
  tableBodyText: {
    color: colors.gray600,
  },
  tableCell: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  tableHeaderRow: {
    backgroundColor: colors.gray50,
    borderBottomColor: colors.gray200,
  },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: colors.gray100,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tableScroll: {
    maxHeight: 400,
  },

  textBase: {
    color: colors.gray600,
    fontSize: 16,
    lineHeight: 24,
  },
  textBlue: { color: colors.blue600 },
  textBold: {
    fontWeight: '600',
  },
  textDefault: { color: colors.gray600 },
  textGreen: { color: colors.green600 },
  textPurple: { color: colors.purple600 },
  textRed: { color: colors.red900 },
  textSmall: {
    color: colors.gray600,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  textSmallGray: {
    color: colors.gray600,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  textSmallMarginBottom: {
    color: colors.gray600,
    fontSize: 14,
    marginBottom: 16,
  },
  textWhite: {
    color: colors.white,
  },
});
