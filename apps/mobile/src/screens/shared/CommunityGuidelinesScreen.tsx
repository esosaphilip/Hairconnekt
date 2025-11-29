import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import type { StyleProp } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/tokens';
// Assuming React Navigation is used
// import { useNavigation } from '@react-navigation/native';

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'outline';
};

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, style, textStyle, variant = 'primary' }) => {
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
      <Text style={[styles.buttonText, isOutline ? styles.textPrimary : styles.textWhite, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

type CardProps = { children: React.ReactNode; style?: StyleProp<ViewStyle> };
const Card: React.FC<CardProps> = ({ children, style }) => (
  <View style={[styles.cardBase, style]}>{children}</View>
);

type IconPlaceholderProps = {
  name:
    | 'ArrowLeft'
    | 'Users'
    | 'Heart'
    | 'Shield'
    | 'Star'
    | 'CheckCircle'
    | 'XCircle'
    | 'AlertTriangle'
    | 'Flag'
    | 'MessageCircle'
    | string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const IconPlaceholder: React.FC<IconPlaceholderProps> = ({ name, size = 20, color = 'black', style = undefined }) => {
  // Mapping placeholder names to the original intent for clarity
  let displayChar;
  switch (name) {
    case 'ArrowLeft': displayChar = '<'; break;
    case 'Users': displayChar = '👥'; break;
    case 'Heart': displayChar = '❤️'; break;
    case 'Shield': displayChar = '🛡️'; break;
    case 'Star': displayChar = '⭐'; break;
    case 'CheckCircle': displayChar = '✅'; break;
    case 'XCircle': displayChar = '❌'; break;
    case 'AlertTriangle': displayChar = '⚠️'; break;
    case 'Flag': displayChar = '🚩'; break;
    case 'MessageCircle': displayChar = '💬'; break;
    default: displayChar = '•';
  }
  return <Text style={[{ fontSize: size, color: color }, style]}>{displayChar}</Text>;
};

// --- End Placeholder Components ---

const useNavigationMock = () => ({
  goBack: () => console.log('Go Back Pressed (Navigating back)'),
  navigate: (screen: string, params?: unknown) =>
    console.log(`Maps to ${screen} with params: ${JSON.stringify(params)}`),
});


export function CommunityGuidelinesScreen() {
  // const navigation = useNavigation(); // Actual hook to use
  const navigation = useNavigationMock(); // Mocked for demonstration

  // Helper function to handle back navigation
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Helper function to handle internal navigation (e.g., to support)
  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
  };

  const coreValues = [
    {
      iconName: 'Heart',
      title: 'Respekt & Wertschätzung',
      description: 'Behandeln Sie alle Mitglieder unserer Community mit Respekt und Höflichkeit.',
      bgColor: '#FEE2E2', // red-100
      iconColor: '#DC2626', // red-600
    },
    {
      iconName: 'Shield',
      title: 'Sicherheit & Vertrauen',
      description: 'Schaffen Sie eine sichere Umgebung für alle Nutzer durch ehrliches und verantwortungsvolles Handeln.',
      bgColor: '#DBEAFE', // blue-100
      iconColor: '#2563EB', // blue-600
    },
    {
      iconName: 'Users',
      title: 'Inklusivität & Vielfalt',
      description: 'Feiern Sie die Vielfalt und fördern Sie ein inklusives Umfeld für alle.',
      bgColor: '#EDE9FE', // purple-100
      iconColor: '#7C3AED', // purple-600
    },
    {
      iconName: 'Star',
      title: 'Qualität & Professionalität',
      description: 'Streben Sie nach höchster Qualität in Service und Kommunikation.',
      bgColor: '#FFEDD5', // orange-100
      iconColor: '#8B4513', // The theme color
    },
  ];

  const dosList = [
    'Seien Sie pünktlich zu Terminen',
    'Kommunizieren Sie klar und professionell',
    'Respektieren Sie Absagen und Stornierungen',
    'Geben Sie ehrliches, konstruktives Feedback',
    'Halten Sie persönliche Daten vertraulich',
    'Melden Sie unangemessenes Verhalten',
    'Lösen Sie Konflikte respektvoll',
    'Halten Sie sich an vereinbarte Preise',
  ];

  const dontsList = [
    'Diskriminierung jeglicher Art',
    'Belästigung oder bedrohliches Verhalten',
    'Unangemessene oder obszöne Inhalte',
    'Spam oder irreführende Werbung',
    'Falsche oder betrügerische Informationen',
    'Weitergabe von persönlichen Daten Dritter',
    'Manipulation von Bewertungen',
    'Zahlungen außerhalb der Plattform',
  ];

  const forClients = [
    {
      title: 'Termine respektieren',
      points: [
        'Erscheinen Sie pünktlich oder sagen Sie rechtzeitig ab',
        'Halten Sie sich an die Stornierungsfristen (siehe Stornierungsrichtlinie)',
        'Informieren Sie den Anbieter bei Verspätungen',
      ],
    },
    {
      title: 'Ehrliche Bewertungen',
      points: [
        'Geben Sie konstruktives Feedback',
        'Basieren Sie Bewertungen auf tatsächlichen Erfahrungen',
        'Vermeiden Sie beleidigende oder unsachliche Kommentare',
      ],
    },
    {
      title: 'Respektvolle Kommunikation',
      points: [
        'Behandeln Sie Anbieter professionell',
        'Stellen Sie klare Fragen zu Services',
        'Respektieren Sie Arbeitszeiten und Grenzen',
      ],
    },
  ];

  const forProviders = [
    {
      title: 'Servicequalität',
      points: [
        'Halten Sie hohe professionelle Standards ein',
        'Verwenden Sie qualitativ hochwertige Produkte',
        'Seien Sie pünktlich und zuverlässig',
        'Halten Sie Hygiene- und Sicherheitsstandards ein',
      ],
    },
    {
      title: 'Transparenz',
      points: [
        'Geben Sie klare, genaue Preise an',
        'Beschreiben Sie Services detailliert',
        'Zeigen Sie authentische Portfolio-Bilder',
        'Informieren Sie über Verfügbarkeit',
      ],
    },
    {
      title: 'Professionalität',
      points: [
        'Reagieren Sie zeitnah auf Anfragen',
        'Behandeln Sie Kunden respektvoll',
        'Halten Sie vereinbarte Termine ein',
        'Kommunizieren Sie Änderungen proaktiv',
      ],
    },
  ];

  const prohibitedContent = [
    {
      category: 'Diskriminierung',
      examples: [
        'Diskriminierung aufgrund von Hautfarbe, Ethnizität, Religion',
        'Geschlechts- oder altersbezogene Diskriminierung',
        'Diskriminierung aufgrund sexueller Orientierung',
        'Diskriminierung aufgrund von Behinderung',
      ],
    },
    {
      category: 'Unangemessene Inhalte',
      examples: [
        'Sexuell explizite Inhalte',
        'Gewaltdarstellungen',
        'Hassreden oder extremistische Inhalte',
        'Illegale Aktivitäten oder Produkte',
      ],
    },
    {
      category: 'Betrug & Manipulation',
      examples: [
        'Gefälschte Bewertungen oder Ratings',
        'Identitätsdiebstahl',
        'Phishing oder Scam-Versuche',
        'Preismanipulation',
      ],
    },
  ];

  const reportingSteps = [
    {
      step: '1',
      title: 'Vorfall dokumentieren',
      description: 'Machen Sie Screenshots und notieren Sie relevante Details',
    },
    {
      step: '2',
      title: 'Meldung einreichen',
      description: 'Nutzen Sie die "Melden"-Funktion in der App oder kontaktieren Sie uns',
    },
    {
      step: '3',
      title: 'Überprüfung',
      description: 'Unser Team überprüft den Fall innerhalb von 24-48 Stunden',
    },
    {
      step: '4',
      title: 'Maßnahmen',
      description: 'Wir ergreifen angemessene Maßnahmen und informieren Sie über das Ergebnis',
    },
  ];

  const consequences = [
    { severity: 'Leicht', action: 'Verwarnung', bgColor: '#FFFBEB', borderColor: '#FDE68A', textColor: '#92400E' }, // yellow
    { severity: 'Mittel', action: 'Temporäre Sperrung (7-30 Tage)', bgColor: '#FFEDD5', borderColor: '#FED7AA', textColor: '#9A3412' }, // orange
    { severity: 'Schwer', action: 'Permanente Sperrung', bgColor: '#FEE2E2', borderColor: '#FCA5A5', textColor: '#991B1B' }, // red
    { severity: 'Illegal', action: 'Weitergabe an Behörden', bgColor: '#FEE2E2', borderColor: '#FCA5A5', textColor: '#991B1B' }, // red
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <IconPlaceholder name="ArrowLeft" size={24} color={colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <IconPlaceholder name="Users" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Gemeinschaftsrichtlinien</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Last Updated */}
        <Card style={styles.lastUpdatedCard}>
          <Text style={styles.lastUpdatedText}>
            <Text style={styles.textBold}>Letzte Aktualisierung:</Text> 18. November 2025
          </Text>
          <Text style={styles.lastUpdatedSubText}>
            Diese Richtlinien gelten für alle Nutzer der HairConnekt-Plattform.
          </Text>
        </Card>

        {/* Introduction */}
        <Card style={styles.introCard}>
          <Text style={styles.sectionTitle}>Willkommen bei HairConnekt</Text>
          <Text style={styles.textBase}>
            Unsere Community-Richtlinien schaffen einen sicheren, respektvollen und inklusiven
            Raum für alle Nutzer. Durch die Nutzung von HairConnekt verpflichten Sie sich,
            diese Richtlinien einzuhalten.
          </Text>
        </Card>

        {/* Core Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unsere Grundwerte</Text>
          {coreValues.map((value, index) => (
            <Card key={index} style={styles.valueCard}>
              <View style={styles.valueRow}>
                <View style={[styles.iconContainer, { backgroundColor: value.bgColor }]}>
                  <IconPlaceholder name={value.iconName} size={20} color={value.iconColor} />
                </View>
                <View style={styles.valueTextContainer}>
                  <Text style={styles.valueTitle}>{value.title}</Text>
                  <Text style={styles.textSmall}>{value.description}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Do's and Don'ts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Do’s & Don’ts</Text>
          <Card style={styles.dosCard}>
            <View style={styles.listHeader}>
              <IconPlaceholder name="CheckCircle" size={20} color={colors.green600} />
              <Text style={styles.dosHeaderTitle}>Bitte tun Sie</Text>
            </View>
            {dosList.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.dosBullet}>✓</Text>
                <Text style={styles.textSmallGreen}>{item}</Text>
              </View>
            ))}
          </Card>
          <Card style={styles.dontsCard}>
            <View style={styles.listHeader}>
              <IconPlaceholder name="XCircle" size={20} color={colors.red} />
              <Text style={styles.dontsHeaderTitle}>Bitte unterlassen Sie</Text>
            </View>
            {dontsList.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.dontsBullet}>✗</Text>
                <Text style={styles.textSmallRed}>{item}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* For Clients */}
        <View style={styles.section}>
          <Card style={styles.cardBase}>
            <Text style={styles.sectionTitle}>Richtlinien für Kunden</Text>
            {forClients.map((section, index) => (
              <View key={index} style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{section.title}</Text>
                {section.points.map((point, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.textSmall}>{point}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        </View>

        {/* For Providers */}
        <View style={styles.section}>
          <Card style={styles.cardBase}>
            <Text style={styles.sectionTitle}>Richtlinien für Anbieter</Text>
            {forProviders.map((section, index) => (
              <View key={index} style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{section.title}</Text>
                {section.points.map((point, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.textSmall}>{point}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        </View>

        {/* Prohibited Content */}
        <View style={styles.section}>
          <Card style={styles.cardBase}>
            <View style={styles.listHeader}>
              <View style={[styles.iconContainer, styles.prohibitedIcon]}>
                <IconPlaceholder name="AlertTriangle" size={20} color={colors.red} />
              </View>
              <Text style={styles.sectionTitleNoMargin}>Verbotene Inhalte & Verhaltensweisen</Text>
            </View>
            {prohibitedContent.map((section, index) => (
              <View key={index} style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{section.category}</Text>
                {section.examples.map((example, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.prohibitedBullet}>✗</Text>
                    <Text style={styles.textSmall}>{example}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        </View>

        {/* Reporting */}
        <View style={styles.section}>
          <Card style={styles.cardBase}>
            <View style={styles.listHeader}>
              <View style={[styles.iconContainer, styles.reportingIcon]}>
                <IconPlaceholder name="Flag" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitleNoMargin}>Verstöße melden</Text>
            </View>
            <Text style={styles.textSmallMarginBottom}>
              Wenn Sie einen Verstoß gegen unsere Richtlinien beobachten, folgen Sie bitte diesen Schritten:
            </Text>
            <View style={styles.reportingStepsContainer}>
              {reportingSteps.map((item, index) => (
                <View key={index} style={styles.reportingStepItem}>
                  <Text style={styles.reportingStepNumber}>{item.step}</Text>
                  <View>
                    <Text style={styles.subSectionTitle}>{item.title}</Text>
                    <Text style={styles.reportingStepDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Consequences */}
        <View style={styles.section}>
          <Card style={styles.cardBase}>
            <Text style={styles.sectionTitle}>Konsequenzen bei Verstößen</Text>
            <Text style={styles.textSmallMarginBottom}>
              Abhängig von der Schwere des Verstoßes ergreifen wir folgende Maßnahmen:
            </Text>
            <View style={styles.consequencesContainer}>
              {consequences.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.consequenceItem,
                    { backgroundColor: item.bgColor, borderColor: item.borderColor },
                  ]}
                >
                  <Text style={[styles.consequenceSeverity, { color: item.textColor }]}>
                    {item.severity}
                  </Text>
                  <Text style={[styles.consequenceAction, { color: item.textColor }]}>
                    {item.action}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                <Text style={styles.textBold}>Hinweis:</Text> Bei wiederholten oder schwerwiegenden
                Verstößen behalten wir uns das Recht vor, rechtliche Schritte einzuleiten.
              </Text>
            </View>
          </Card>
        </View>

        {/* Dispute Resolution */}
        <View style={styles.section}>
          <Card style={styles.disputeCard}>
            <View style={styles.listHeader}>
              <IconPlaceholder name="MessageCircle" size={20} color={colors.blue600} />
              <Text style={styles.sectionTitleNoMargin}>Konfliktlösung</Text>
            </View>
            <Text style={styles.textSmallMarginBottom}>
              Bei Meinungsverschiedenheiten empfehlen wir:
            </Text>
            <View style={styles.disputeList}>
              <View style={styles.listItem}>
                <Text style={styles.disputeBullet}>1.</Text>
                <Text style={styles.textSmall}>Direkte, respektvolle Kommunikation mit der anderen Partei</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.disputeBullet}>2.</Text>
                <Text style={styles.textSmall}>Nutzung unseres In-App-Nachrichtensystems zur Dokumentation</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.disputeBullet}>3.</Text>
                <Text style={styles.textSmall}>Kontaktieren Sie unseren Kundenservice für Mediation</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Card style={styles.cardBase}>
            <Text style={styles.sectionTitle}>Fragen zu den Richtlinien?</Text>
            <Text style={styles.textSmallMarginBottom}>
              Kontaktieren Sie uns bei Fragen oder Anliegen:
            </Text>
            <View style={styles.contactContainer}>
              <Text style={styles.contactText}>
                <Text style={styles.textBold}>E-Mail:</Text>{' '}
                <Text style={styles.linkText} onPress={() => console.log('Mail to community')}>
                  community@hairconnekt.de
                </Text>
              </Text>
              <Text style={styles.contactText}>
                <Text style={styles.textBold}>Support:</Text>{' '}
                <Text style={styles.linkText} onPress={() => console.log('Mail to support')}>
                  support@hairconnekt.de
                </Text>
              </Text>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <CustomButton
            title="Verstoß melden"
            onPress={() => handleNavigate('SupportScreen')}
            style={styles.actionButtonPrimary}
          />
          <CustomButton
            title="Zurück"
            onPress={handleGoBack}
            variant="outline"
            style={styles.actionButtonOutline}
            textStyle={styles.actionButtonOutlineText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- StyleSheet for React Native Styles ---
/* eslint-disable react-native/sort-styles */
const styles = StyleSheet.create({
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  cardBase: {
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 12,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
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
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
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
  iconContainer: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    padding: 8,
  },
  introCard: {
    backgroundColor: colors.amber50,
    borderColor: colors.amber200,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
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
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitleNoMargin: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: '600',
  },
  subSection: {
    marginTop: 16,
  },
  subSectionTitle: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textBase: {
    color: colors.gray600,
    fontSize: 14,
    lineHeight: 22,
  },
  textBold: {
    fontWeight: '600',
  },
  textSmall: {
    color: colors.gray600,
    flexShrink: 1,
    fontSize: 14,
  },
  // Do's section styles
  dosCard: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.green600,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  dosHeaderTitle: {
    color: colors.green600,
    fontSize: 16,
    fontWeight: '500',
  },
  textSmallGreen: {
    color: colors.green600,
    flexShrink: 1,
    fontSize: 14,
  },
  dosBullet: {
    color: colors.green600,
    fontSize: 16,
    marginRight: 4,
    marginTop: 2,
  },
  textSmallMarginBottom: {
    color: colors.gray600,
    fontSize: 14,
    marginBottom: 16,
  },
  // Values section styles
  valueCard: {
    elevation: 0.5,
    marginBottom: 8,
    padding: 16,
  },
  valueRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  // (Removed duplicate dos* styles)
  dontsCard: {
    backgroundColor: colors.red50,
    borderColor: colors.red200,
    borderWidth: 1,
    padding: 16,
  },
  dontsHeaderTitle: {
    color: colors.red900,
    fontSize: 16,
    fontWeight: '500',
  },
  textSmallRed: {
    color: colors.red900,
    flexShrink: 1,
    fontSize: 14,
  },
  dontsBullet: {
    color: colors.red,
    fontSize: 16,
    marginRight: 4,
    marginTop: 2,
  },
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    marginLeft: 4,
  },
  listBullet: {
    color: colors.secondary,
    fontSize: 16,
    marginTop: 2,
  },
  prohibitedIcon: {
    backgroundColor: colors.red200,
  },
  prohibitedBullet: {
    color: colors.red,
    fontSize: 16,
    marginTop: 2,
  },
  // Reporting Steps
  reportingIcon: {
    backgroundColor: colors.amber50,
  },
  reportingStepsContainer: {
    gap: 12,
  },
  reportingStepItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  reportingStepNumber: {
    backgroundColor: colors.amber50,
    borderRadius: 16,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    height: 32,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        lineHeight: 32,
      },
    }),
  },
  reportingStepDescription: {
    color: colors.gray600,
    fontSize: 14,
    marginTop: 2,
  },
  // Consequences
  consequencesContainer: {
    gap: 12,
  },
  consequenceItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  consequenceSeverity: {
    fontSize: 16,
    fontWeight: '500',
  },
  consequenceAction: {
    fontSize: 14,
  },
  noteBox: {
    backgroundColor: colors.gray50,
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  noteText: {
    color: colors.gray600,
    fontSize: 14,
    lineHeight: 20,
  },
  // Dispute Resolution
  disputeCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.blue200,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
  },
  disputeList: {
    gap: 8,
    marginTop: 8,
  },
  disputeBullet: {
    color: colors.blue600,
    fontSize: 16,
    marginTop: 2,
  },
  // Contact
  contactContainer: {
    gap: 8,
  },
  contactText: {
    color: colors.gray600,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  // Buttons
  buttonGroup: {
    marginTop: 12,
  },
  buttonBase: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textWhite: {
    color: colors.white,
  },
  textPrimary: {
    color: colors.primary,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonOutline: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  actionButtonOutlineText: {
    color: colors.primary,
  },
});
/* eslint-enable react-native/sort-styles */
