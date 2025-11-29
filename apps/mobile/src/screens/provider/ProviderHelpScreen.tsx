import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, TextInput, Platform, Linking } from 'react-native';
import Icon from '../../components/Icon';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const faqs = [
  {
    question: "Wie funktioniert die Auszahlung?",
    answer:
      "Auszahlungen werden innerhalb von 2-3 Werktagen nach Antragstellung auf dein hinterlegtes Bankkonto überwiesen. Du kannst eine Auszahlung beantragen, sobald dein Guthaben mindestens €50 beträgt.",
  },
  {
    question: "Wie kann ich meine Verfügbarkeit anpassen?",
    answer:
      'Gehe zu "Mehr" > "Verfügbarkeitszeiten" oder nutze die Schnellaktion "Verfügbarkeit" auf dem Dashboard. Dort kannst du deine regulären Öffnungszeiten sowie spezifische Blockierzeiten festlegen.',
  },
  {
    question: "Wie bearbeite ich mein Profil?",
    answer:
      'Tippe auf "Mehr" > "Mein Profil". Dort kannst du alle deine Profilinformationen, Fotos, Services und Preise bearbeiten.',
  },
  {
    question: "Welche Servicegebühren fallen an?",
    answer:
      "Die Servicegebühr hängt von deinem Abonnement ab: Basic 15%, Pro 10%, Premium 8%. Die Gebühr wird automatisch bei jeder Buchung berechnet.",
  },
  {
    question: "Wie antworte ich auf Bewertungen?",
    answer:
      'Gehe zu "Bewertungen" und tippe auf die Schaltfläche "Antworten" unter der jeweiligen Bewertung. Eine schnelle und professionelle Antwort zeigt Wertschätzung für das Feedback.',
  },
  {
    question: "Kann ich Buchungen ablehnen?",
    answer:
      "Ja, du kannst Buchungsanfragen ablehnen. Beachte jedoch, dass eine hohe Ablehnungsrate deine Sichtbarkeit in den Suchergebnissen beeinträchtigen kann.",
  },
  {
    question: "Wie füge ich neue Services hinzu?",
    answer:
      'Gehe zu "Mehr" > "Services & Preise" und tippe auf das "+"-Symbol. Dort kannst du Service-Name, Beschreibung, Dauer und Preis festlegen.',
  },
  {
    question: "Was ist ein Portfolio und wie lade ich Bilder hoch?",
    answer:
      'Dein Portfolio zeigt deine besten Arbeiten. Gehe zu "Mehr" > "Portfolio verwalten" und lade Fotos deiner Frisuren hoch. Hochqualitative Bilder erhöhen deine Buchungsrate deutlich.',
  },
];

const quickLinks = [
  {
    iconName: 'book-outline',
    title: "Leitfaden für Anbieter",
    description: "Erste Schritte und Best Practices",
  },
  {
    iconName: 'document-text-outline',
    title: "Nutzungsbedingungen",
    description: "Rechtliche Informationen",
  },
  {
    iconName: 'help-circle-outline',
    title: "Häufig gestellte Fragen",
    description: "Antworten auf häufige Fragen",
  },
];

export function ProviderHelpScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const goBack = () => {
    if (Platform.OS === 'web') {
      try { window.history.back(); } catch {}
    } else {
      console.log('Navigate back');
    }
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Pressable onPress={goBack} style={{ padding: spacing.xs, marginRight: spacing.sm }} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
            <Icon name={'chevron-back'} size={24} color={colors.gray700} />
          </Pressable>
          <Text style={typography.h3}>Hilfe & Support</Text>
        </View>

        {/* Search */}
        <View style={{ position: 'relative' }}>
          <View style={{ position: 'absolute', left: spacing.md, top: 12 }}>
            <Icon name={'search-outline'} size={20} color={colors.gray400} />
          </View>
          <TextInput
            placeholder="Wie können wir dir helfen?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ paddingVertical: spacing.sm, paddingLeft: spacing.xl + spacing.xs, paddingRight: spacing.md, borderWidth: 1, borderColor: colors.gray200, borderRadius: radii.md }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
        {/* Contact Support */}
        <Card style={{ padding: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.primary }}>
          <Text style={{ color: colors.white, fontWeight: '700', marginBottom: spacing.xs }}>Brauchst du schnelle Hilfe?</Text>
          <Text style={{ color: colors.white, opacity: 0.9, marginBottom: spacing.md, fontSize: 12 }}>
            Unser Support-Team steht dir zur Verfügung
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Button title="Chat" onPress={() => alert('Chat öffnen - Funktion in Entwicklung')} style={{ backgroundColor: colors.white, height: 44 }} textStyle={{ color: colors.primary }} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Button title="E-Mail" onPress={() => Linking.openURL('mailto:support@hairconnekt.de')} style={{ backgroundColor: colors.white, height: 44 }} textStyle={{ color: colors.primary }} />
            </View>
          </View>
        </Card>

        {/* Quick Links */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Schnellzugriff</Text>
          <View>
            {quickLinks.map((link, index) => (
              <Pressable key={index} onPress={() => alert(`${link.title} - Funktion in Entwicklung`)} style={{ marginBottom: spacing.sm }}>
                <Card style={{ padding: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139,69,19,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
                      <Icon name={link.iconName} size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginRight: spacing.md }}>
                      <Text style={{ fontWeight: '600' }}>{link.title}</Text>
                      <Text style={{ fontSize: 12, color: colors.gray600 }}>{link.description}</Text>
                    </View>
                    <Icon name={'chevron-forward'} size={20} color={colors.gray400} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Häufig gestellte Fragen</Text>
          <Card>
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <View key={index} style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.gray100 }}>
                  <Pressable onPress={() => setOpenIndex(isOpen ? null : index)} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontWeight: '600' }}>{faq.question}</Text>
                      <Icon name={(isOpen ? 'chevron-up-outline' : 'chevron-down-outline')} size={18} color={colors.gray500} />
                    </View>
                  </Pressable>
                  {isOpen && (
                    <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
                      <Text style={{ fontSize: 12, color: colors.gray700 }}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </Card>

          {filteredFaqs.length === 0 && (
            <Card style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Icon name={'help-circle-outline'} size={48} color={colors.gray300} />
              <Text style={{ fontWeight: '600', marginTop: spacing.sm, marginBottom: spacing.xs }}>Keine Ergebnisse gefunden</Text>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Versuche es mit anderen Suchbegriffen</Text>
            </Card>
          )}
        </View>

        {/* Contact Info */}
        <Card style={{ padding: spacing.md }}>
          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Kontakt</Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm }}>
                <Icon name={'mail-outline'} size={18} color={colors.gray600} />
              </View>
              <View>
                <Text style={{ fontWeight: '600' }}>E-Mail</Text>
                <Pressable onPress={() => Linking.openURL('mailto:support@hairconnekt.de')} {...(Platform.OS === 'web' ? { accessibilityRole: 'link' } : {})}>
                  <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>support@hairconnekt.de</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm }}>
                <Icon name={'call-outline'} size={18} color={colors.gray600} />
              </View>
              <View>
                <Text style={{ fontWeight: '600' }}>Telefon</Text>
                <Pressable onPress={() => Linking.openURL('tel:+4930123456')} {...(Platform.OS === 'web' ? { accessibilityRole: 'link' } : {})}>
                  <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>+49 30 123456</Text>
                </Pressable>
                <Text style={{ fontSize: 10, color: colors.gray600 }}>Mo-Fr: 9:00 - 18:00</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm }}>
                <Icon name={'chatbubble-outline'} size={18} color={colors.gray600} />
              </View>
              <View>
                <Text style={{ fontWeight: '600' }}>Live-Chat</Text>
                <Text style={{ fontSize: 12, color: colors.gray600 }}>Verfügbar Mo-Fr: 9:00 - 18:00</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Feedback */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <Text style={{ fontWeight: '600', marginBottom: spacing.xs }}>Feedback geben</Text>
          <Text style={{ fontSize: 12, color: colors.gray600, marginBottom: spacing.sm }}>
            Hilf uns, HairConnekt zu verbessern. Teile deine Ideen und Vorschläge mit uns.
          </Text>
          <Button title="Feedback senden" onPress={() => alert('Feedback senden - Funktion in Entwicklung')} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
