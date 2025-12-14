import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radii } from '@/theme/tokens';
import { useNavigation } from '@react-navigation/native';

export default function BecomeProviderScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Anbieter werden</Text>
          <Text style={styles.headerSubtitle}>Biete deine Services an und erreiche neue Kunden</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warum Anbieter werden?</Text>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>💼</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Neue Kunden gewinnen</Text>
              <Text style={styles.benefitDescription}>Erreiche mehr Kundschaft mit deinem Angebot</Text>
            </View>
          </View>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>📅</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Kalender & Buchungen</Text>
              <Text style={styles.benefitDescription}>Verwalte Termine und Verfügbarkeit</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was wird benötigt?</Text>
          <View style={styles.requirementCard}>
            <Text style={styles.requirementNumber}>1</Text>
            <Text style={styles.requirementText}>Profilinformationen und Studioangaben</Text>
          </View>
          <View style={styles.requirementCard}>
            <Text style={styles.requirementNumber}>2</Text>
            <Text style={styles.requirementText}>Portfolio-Fotos und Dokumente</Text>
          </View>
          <View style={styles.requirementCard}>
            <Text style={styles.requirementNumber}>3</Text>
            <Text style={styles.requirementText}>Bankverbindung für Auszahlungen</Text>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>Bereit loszulegen? Starte jetzt deine Anmeldung als Anbieter.</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('ProviderRegistration' as never)}>
            <Text style={styles.startButtonText}>Jetzt starten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Später</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.xl,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.black,
    marginBottom: spacing.lg,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    fontSize: typography.small.fontSize,
    color: colors.gray600,
  },
  requirementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  requirementNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: spacing.md,
  },
  requirementText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.gray700,
  },
  ctaSection: {
    padding: spacing.xl,
    backgroundColor: colors.gray50,
  },
  ctaText: {
    fontSize: typography.body.fontSize,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  startButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.gray600,
  },
});
