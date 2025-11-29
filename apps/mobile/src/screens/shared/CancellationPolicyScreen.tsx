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

// --- Reusing Placeholder Components from previous refactors ---

type IconPlaceholderProps = {
  name: 'ArrowLeft' | 'FileText' | 'Calendar' | 'CheckCircle' | 'XCircle' | 'AlertCircle' | 'Clock' | 'Euro' | string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const IconPlaceholder: React.FC<IconPlaceholderProps> = ({ name, size = 20, color = 'black', style = undefined }) => {
  let displayChar;
  switch (name) {
    case 'ArrowLeft': displayChar = '←'; break;
    case 'FileText': displayChar = '📄'; break;
    case 'Calendar': displayChar = '🗓️'; break;
    case 'CheckCircle': displayChar = '✔️'; break;
    case 'XCircle': displayChar = '✖️'; break;
    case 'AlertCircle': displayChar = '❗'; break;
    case 'Clock': displayChar = '⏱️'; break;
    case 'Euro': displayChar = '💶'; break;
    default: displayChar = '•';
  }
  return <Text style={[{ fontSize: size, color: color }, style]}>{displayChar}</Text>;
};

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

const useNavigationMock = () => ({
  goBack: () => console.log('Go Back Pressed (Navigating back)'),
  navigate: (screen: string) => console.log(`Maps to ${screen}`),
});

// --- CancellationPolicyScreen Component ---

export function CancellationPolicyScreen() {
  // const navigation = useNavigation(); // Actual hook to use
  const navigation = useNavigationMock(); // Mocked for demonstration

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
  };

  const sections = [
    {
      title: 'Widerrufsrecht für Verbraucher',
      iconName: 'FileText',
      content: [
        'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.',
        'Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses (Buchung eines Termins).'
      ]
    },
    {
      title: 'Ausübung des Widerrufsrechts',
      iconName: 'Calendar',
      content: [
        'Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung (z.B. per E-Mail oder über die App) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.',
        'Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.'
      ]
    },
    {
      title: 'Folgen des Widerrufs',
      iconName: 'CheckCircle',
      content: [
        'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.',
        'Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben.'
      ]
    }
  ];

  const cancellationPolicies = [
    {
      iconName: 'CheckCircle',
      title: 'Kostenlose Stornierung',
      time: 'Mehr als 48h vorher',
      color: 'green',
      description: 'Volle Rückerstattung aller Zahlungen',
      refund: '100%',
      iconColor: '#10B981', // green-600
      bgColor: '#D1FAE5', // green-100
      badgeTextColor: '#065F46', // green-700
    },
    {
      iconName: 'AlertCircle',
      title: 'Teilweise Gebühr',
      time: '24-48h vorher',
      color: 'orange',
      description: 'Stornierungsgebühr von 25% des Buchungsbetrags',
      refund: '75%',
      iconColor: '#F97316', // orange-600
      bgColor: '#FFEDD5', // orange-100
      badgeTextColor: '#9A3412', // orange-700
    },
    {
      iconName: 'AlertCircle',
      title: 'Erhöhte Gebühr',
      time: '12-24h vorher',
      color: 'red',
      description: 'Stornierungsgebühr von 50% des Buchungsbetrags',
      refund: '50%',
      iconColor: '#EF4444', // red-600
      bgColor: '#FEE2E2', // red-100
      badgeTextColor: '#B91C1C', // red-700
    },
    {
      iconName: 'XCircle',
      title: 'Keine Rückerstattung',
      time: 'Weniger als 12h vorher',
      color: 'red',
      description: 'Voller Buchungsbetrag wird berechnet',
      refund: '0%',
      iconColor: '#EF4444',
      bgColor: '#FEE2E2',
      badgeTextColor: '#B91C1C',
    }
  ];

  const exceptions = [
    'Nachgewiesene medizinische Notfälle (ärztliches Attest erforderlich)',
    'Außergewöhnliche Umstände (z.B. höhere Gewalt, extreme Wetterbedingungen)',
    'Stornierung durch den Anbieter (volle Rückerstattung garantiert)',
    'Technische Probleme auf Seiten von HairConnekt'
  ];

  const HAIR_CONNECT_BROWN = '#8B4513'; // Define the primary color

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <IconPlaceholder name="ArrowLeft" size={24} color={colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <IconPlaceholder name="FileText" size={24} color={HAIR_CONNECT_BROWN} />
          <Text style={styles.headerTitle}>Stornierungs- & Widerrufsrecht</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Last Updated */}
        <Card style={styles.lastUpdatedCard}>
          <Text style={styles.lastUpdatedText}>
            <Text style={styles.textBold}>Letzte Aktualisierung:</Text> 18. November 2025
          </Text>
          <Text style={styles.lastUpdatedSubText}>
            Diese Richtlinie gilt gemäß deutschem Recht (BGB § 355 ff.) für alle Buchungen über HairConnekt.
          </Text>
        </Card>

        {/* Introduction */}
        <Card style={styles.introCard}>
          <Text style={styles.sectionTitle}>Wichtig zu wissen</Text>
          <Text style={styles.textSmall}>
            Als Verbraucher haben Sie nach deutschem Recht ein gesetzliches Widerrufsrecht.
            Zusätzlich gelten unsere Stornierungsbedingungen, die faire Regelungen für beide
            Seiten – Kunden und Dienstleister – schaffen.
          </Text>
        </Card>

        {/* Legal Withdrawal Right */}
        {sections.map((section, index) => (
          <Card key={index} style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <IconPlaceholder name={section.iconName} size={20} color={HAIR_CONNECT_BROWN} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.contentContainer}>
              {section.content.map((text, i) => (
                <Text key={i} style={styles.textSmall}>
                  {text}
                </Text>
              ))}
            </View>
          </Card>
        ))}

        {/* Cancellation Timeline */}
        <View style={styles.policySection}>
          <Text style={styles.sectionTitle}>Stornierungsbedingungen</Text>
          <View style={styles.policyListContainer}>
            {cancellationPolicies.map((policy, index) => (
              <Card key={index} style={styles.policyCard}>
                <View style={styles.policyRow}>
                  <View style={[styles.policyIconContainer, { backgroundColor: policy.bgColor }]}>
                    <IconPlaceholder name={policy.iconName} size={20} color={policy.iconColor} />
                  </View>
                  <View style={styles.policyContent}>
                    <View style={styles.policyTitleRow}>
                      <Text style={styles.policyTitle}>{policy.title}</Text>
                      <View style={[styles.refundBadge, { backgroundColor: policy.bgColor }]}>
                        <Text style={[styles.refundBadgeText, { color: policy.badgeTextColor }]}>
                          {policy.refund}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.policyTimeRow}>
                      <IconPlaceholder name="Clock" size={14} color={colors.gray400} style={styles.clockIcon} />
                      <Text style={styles.policyTimeText}>{policy.time}</Text>
                    </View>
                    <Text style={styles.policyDescription}>{policy.description}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Important Notice */}
        <Card style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <IconPlaceholder name="AlertCircle" size={20} color="#D97706" style={styles.noticeIcon} />
            <View style={styles.noticeTextContainer}>
              <Text style={styles.noticeTitle}>
                Vorzeitiger Verlust des Widerrufsrechts
              </Text>
              <Text style={styles.noticeDescription}>
                Das Widerrufsrecht erlischt vorzeitig, wenn die Dienstleistung vollständig
                erbracht wurde und Sie ausdrücklich zugestimmt haben, dass mit der Ausführung
                vor Ablauf der Widerrufsfrist begonnen wird.
              </Text>
            </View>
          </View>
        </Card>

        {/* Exceptions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ausnahmen & Sonderfälle</Text>
          <Text style={styles.textSmallMarginBottom}>
            In folgenden Fällen können abweichende Regelungen gelten:
          </Text>
          <View style={styles.exceptionList}>
            {exceptions.map((exception, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.textSmall}>{exception}</Text>
              </View>
            ))}
          </View>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              <Text style={styles.textBold}>Hinweis:</Text> Für Ausnahmefälle kontaktieren Sie
              bitte unseren Kundenservice mit entsprechenden Nachweisen.
            </Text>
          </View>
        </Card>

        {/* Refund Process */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <IconPlaceholder name="Euro" size={20} color={HAIR_CONNECT_BROWN} />
            </View>
            <Text style={styles.sectionTitle}>Rückerstattungsprozess</Text>
          </View>
          <View style={styles.refundProcessContainer}>
            {[
              'Stornierung über die App oder per E-Mail an support@hairconnekt.de',
              'Automatische Berechnung der Rückerstattung basierend auf Stornierungszeitpunkt',
              'Rückerstattung innerhalb von 5-10 Werktagen auf die ursprüngliche Zahlungsmethode',
              'E-Mail-Bestätigung mit Transaktionsdetails'
            ].map((text, index) => (
              <View key={index} style={styles.refundStepItem}>
                <Text style={styles.refundStepNumber}>{index + 1}</Text>
                <Text style={styles.textSmall}>{text}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Withdrawal Form (Text Block) */}
        <Card style={styles.withdrawalFormCard}>
          <Text style={styles.sectionTitle}>Muster-Widerrufsformular</Text>
          <View style={styles.formContentBox}>
            <Text style={styles.formLine}>An HairConnekt GmbH</Text>
            <Text style={styles.formLine}>Musterstraße 123, 10115 Berlin</Text>
            <Text style={styles.formLine}>E-Mail: widerruf@hairconnekt.de</Text>
            <Text style={[styles.formLine, styles.formSpacer]}>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:</Text>
            <Text style={styles.formLine}>Buchungs-ID: _________________</Text>
            <Text style={styles.formLine}>Bestellt am (*): _____________</Text>
            <Text style={styles.formLine}>Name des/der Verbraucher(s): _________________</Text>
            <Text style={styles.formLine}>Anschrift des/der Verbraucher(s): _________________</Text>
            <Text style={[styles.formLine, styles.formSpacer]}>Datum: _________</Text>
            <Text style={styles.formHint}>(*) Unzutreffendes streichen</Text>
          </View>
        </Card>

        {/* Contact */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Kontakt & Unterstützung</Text>
          <Text style={styles.textSmallMarginBottom}>
            Bei Fragen zur Stornierung oder zum Widerrufsrecht:
          </Text>
          <View style={styles.contactContainer}>
            <Text style={styles.contactText}>
              <Text style={styles.textBold}>Kundenservice:</Text>{' '}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL('mailto:support@hairconnekt.de')}
              >
                support@hairconnekt.de
              </Text>
            </Text>
            <Text style={styles.contactText}>
              <Text style={styles.textBold}>Widerruf:</Text>{' '}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL('mailto:widerruf@hairconnekt.de')}
              >
                widerruf@hairconnekt.de
              </Text>
            </Text>
            <Text style={styles.contactText}>
              <Text style={styles.textBold}>Telefon:</Text>{' '}
              <Text style={styles.linkText} onPress={() => Linking.openURL('tel:+493012345678')}>
                +49 30 1234 5678
              </Text>
            </Text>
            <Text style={styles.contactText}>
              <Text style={styles.textBold}>Öffnungszeiten:</Text> Mo-Fr 9:00-18:00 Uhr
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <CustomButton
            title="Meine Termine ansehen"
            onPress={() => handleNavigate('AppointmentsScreen')}
          />
          <CustomButton
            title="Kundenservice kontaktieren"
            onPress={() => handleNavigate('SupportScreen')}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- StyleSheet for React Native Styles ---

const HAIR_CONNECT_BROWN = colors.primary;
/* eslint-disable react-native/sort-styles */
const styles = StyleSheet.create({
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  // Buttons (sorted)
  buttonBase: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  buttonGroup: {
    gap: 12,
    marginTop: 12,
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderColor: HAIR_CONNECT_BROWN,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: HAIR_CONNECT_BROWN,
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
  // Section Header
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  clockIcon: {
    marginTop: 2,
  },
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentContainer: {
    gap: 12,
  },
  // Exceptions
  exceptionList: {
    gap: 8,
  },
  formContentBox: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  formHint: {
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
    color: colors.gray500,
    fontSize: 12,
    marginTop: 4,
    paddingTop: 8,
  },
  formLine: {
    color: colors.gray600,
    fontSize: 14,
    lineHeight: 20,
  },
  formSpacer: {
    marginTop: 4,
    paddingTop: 8,
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
      ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: {
    color: colors.gray800,
    flexShrink: 1,
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
  // Contact (sorted)
  contactContainer: {
    gap: 8,
  },
  contactText: {
    color: colors.gray600,
    fontSize: 14,
  },
  // Introduction Card
  introCard: {
    backgroundColor: colors.amber50,
    borderColor: colors.amber200,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
  },
  // Last Updated Card
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
    color: HAIR_CONNECT_BROWN,
    textDecorationLine: 'underline',
  },
  // Lists
  listBullet: {
    color: HAIR_CONNECT_BROWN,
    fontSize: 16,
    marginTop: 2,
  },
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  // Notice
  noticeCard: {
    backgroundColor: colors.amber50,
    borderColor: colors.amber300,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
  },
  noticeDescription: {
    color: colors.amber900,
    fontSize: 14,
    lineHeight: 20,
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    color: colors.amber900,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
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
  // Policy Timeline
  policyCard: {
    elevation: 0.5,
    marginBottom: 0,
    padding: 16,
  },
  policyContent: {
    flex: 1,
  },
  policyDescription: {
    color: colors.gray600,
    fontSize: 14,
  },
  policyIconContainer: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    padding: 8,
  },
  policyListContainer: {
    gap: 12,
  },
  policyRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  policySection: {
    marginBottom: 24,
  },
  policyTimeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  policyTimeText: {
    color: colors.gray600,
    fontSize: 14,
  },
  policyTitle: {
    color: colors.gray800,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  policyTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  // Refund
  refundBadge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refundBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  refundProcessContainer: {
    gap: 12,
    marginTop: 8,
  },
  refundStepItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  refundStepNumber: {
    backgroundColor: colors.amber50,
    borderRadius: 12,
    color: HAIR_CONNECT_BROWN,
    fontSize: 12,
    fontWeight: '500',
    height: 24,
    marginTop: 2,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 24,
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
  textBold: {
    fontWeight: '600',
  },
  textPrimary: {
    color: HAIR_CONNECT_BROWN,
  },
  textSmall: {
    color: colors.gray600,
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
  // Withdrawal Form (Text Block)
  withdrawalFormCard: {
    backgroundColor: colors.gray50,
    marginBottom: 24,
  },
});
/* eslint-enable react-native/sort-styles */
