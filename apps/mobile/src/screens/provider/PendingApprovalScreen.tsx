import React from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing, radii, typography } from '../../theme/tokens';

export function PendingApprovalScreen() {
  const goHome = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/home'; } catch {}
    } else {
      console.log('Navigate to /home');
    }
  };

  const goDashboard = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider/dashboard'; } catch {}
    } else {
      console.log('Navigate to /provider/dashboard');
    }
  };

  const openMail = () => Linking.openURL('mailto:support@hairconnekt.de');
  const openPhone = () => Linking.openURL('tel:+4930123456');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg }}>
        <View style={{ alignItems: 'center' }}>
          {/* Success Icon */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: 'rgba(139,69,19,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name={'time-outline'} size={48} color={colors.primary} />
          </View>

          {/* Main Message */}
          <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <Text style={[typography.h2, { marginBottom: spacing.sm }]}>Deine Anmeldung wird geprüft</Text>
            <Text style={{ color: colors.gray600, marginBottom: spacing.xs, textAlign: 'center' }}>
              Vielen Dank für deine Registrierung bei HairConnekt!
            </Text>
            <Text style={{ color: colors.gray600, textAlign: 'center' }}>
              Unser Team prüft deine Angaben und Dokumente. Dies dauert in der Regel 24-48 Stunden.
            </Text>
          </View>

          {/* Timeline */}
          <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
            <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Was passiert als Nächstes?</Text>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={'checkmark'} size={16} color={colors.white} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, marginBottom: 2 }}>Antrag eingereicht</Text>
                  <Text style={{ fontSize: 12, color: colors.gray600 }}>Deine Daten wurden erfolgreich übermittelt</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, marginBottom: 2 }}>Überprüfung läuft</Text>
                  <Text style={{ fontSize: 12, color: colors.gray600 }}>Verifizierung deiner Dokumente und Angaben</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray400 }} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, marginBottom: 2 }}>E-Mail Bestätigung</Text>
                  <Text style={{ fontSize: 12, color: colors.gray600 }}>Du erhältst eine Nachricht über die Entscheidung</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray400 }} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, marginBottom: 2 }}>Profil aktivieren</Text>
                  <Text style={{ fontSize: 12, color: colors.gray600 }}>Beginne, Kunden zu erreichen</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Contact Info */}
          <Card style={{ padding: spacing.md, backgroundColor: colors.gray50, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 14, marginBottom: spacing.sm }}>Fragen zur Prüfung?</Text>
            <View>
              <Pressable onPress={openMail} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }} {...(Platform.OS === 'web' ? { accessibilityRole: 'link' } : {})}>
                <Ionicons name={'mail-outline'} size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 14, marginLeft: spacing.xs }}>support@hairconnekt.de</Text>
              </Pressable>
              <Pressable onPress={openPhone} style={{ flexDirection: 'row', alignItems: 'center' }} {...(Platform.OS === 'web' ? { accessibilityRole: 'link' } : {})}>
                <Ionicons name={'call-outline'} size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 14, marginLeft: spacing.xs }}>+49 30 123 456</Text>
              </Pressable>
            </View>
          </Card>

          {/* CTA */}
          <View style={{ width: '100%' }}>
            <Button title="Zurück zur Startseite" onPress={goHome} style={{ height: 48, marginBottom: spacing.sm }} />
            <Button title="Vorschau: Dashboard ansehen" onPress={goDashboard} variant="ghost" style={{ height: 48 }} />
          </View>

          {/* Info Note */}
          <Text style={{ fontSize: 12, color: colors.gray500, textAlign: 'center', marginTop: spacing.md }}>
            Du kannst diese Seite schließen. Wir informieren dich per E-Mail über den Status.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
