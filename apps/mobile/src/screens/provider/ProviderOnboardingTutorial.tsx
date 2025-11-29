import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const tutorialSteps = [
  {
    id: 1,
    iconName: 'calendar-outline',
    title: 'Verwalten Sie Ihren Kalender',
    description:
      'Legen Sie Ihre Verfügbarkeit fest, akzeptieren Sie Buchungen und blockieren Sie Zeiten für Pausen oder persönliche Termine.',
    emoji: '📅',
    color: '#8B4513',
  },
  {
    id: 2,
    iconName: 'people-outline',
    title: 'Verbinden Sie sich mit Kunden',
    description:
      'Chatten Sie direkt mit Ihren Kunden, bestätigen Sie Termine und bauen Sie langfristige Beziehungen auf.',
    emoji: '👥',
    color: '#FF6B6B',
  },
  {
    id: 3,
    iconName: 'cash-outline',
    title: 'Verfolgen Sie Ihre Einnahmen',
    description:
      'Sehen Sie Ihre täglichen, wöchentlichen und monatlichen Einnahmen. Fordern Sie Auszahlungen direkt in der App an.',
    emoji: '💰',
    color: '#8B4513',
  },
  {
    id: 4,
    iconName: 'stats-chart-outline',
    title: 'Wachsen Sie Ihr Geschäft',
    description:
      'Nutzen Sie detaillierte Analysen, um Ihr Geschäft zu verstehen und neue Kunden zu gewinnen.',
    emoji: '📊',
    color: '#FF6B6B',
  },
];

export function ProviderOnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  const completeTutorial = () => {
    // Persist completion on web; on native we leave as a placeholder
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem('hasCompletedProviderTutorial', 'true');
        window.location.hash = '/provider/dashboard';
      } catch {}
    } else {
      console.log('Provider tutorial completed (placeholder navigation)');
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ flex: 1 }}>
        {/* Header with Skip */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          }}
        >
          <Pressable
            onPress={handleBack}
            disabled={currentStep === 0}
            style={{ padding: spacing.sm, opacity: currentStep === 0 ? 0 : 1 }}
            {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}
          >
            {/* Cast to any to satisfy Ionicons name typing in TSX */}
            <Ionicons name={"chevron-back-outline" as any} size={24} color={colors.gray600} />
          </Pressable>
          <Pressable onPress={handleSkip} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
            <Text style={{ color: colors.gray600, fontSize: 16 }}>Überspringen</Text>
          </Pressable>
        </View>

        {/* Progress indicators */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          {tutorialSteps.map((step, index) => (
            <View
              key={step.id}
              style={{
                flex: 1,
                height: 4,
                borderRadius: radii.full,
                backgroundColor: index <= currentStep ? colors.primary : colors.gray200,
              }}
            />
          ))}
        </View>

        {/* Welcome Badge (only on first step) */}
        {currentStep === 0 && (
          <View
            style={{
              marginHorizontal: spacing.md,
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: colors.primary,
              borderRadius: radii.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 22 }}>🎉</Text>
              </View>
              <View>
                <Text style={{ color: colors.white, fontWeight: '600' }}>Willkommen bei HairConnekt!</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Ihr Geschäft wurde genehmigt</Text>
              </View>
            </View>
          </View>
        )}

        {/* Content */}
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
          <View style={{ alignItems: 'center' }}>
            {/* Icon/Illustration */}
            <View style={{ marginBottom: spacing.xl }}>
              <View
                style={{
                  width: 192,
                  height: 192,
                  borderRadius: 96,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.gray100,
                }}
              >
                <View
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: 64,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.gray200,
                  }}
                >
                  {/* Cast dynamic icon name to any to align with Ionicons glyphMap typing */}
                  <Ionicons name={currentStepData.iconName as any} size={56} color={currentStepData.color} />
                </View>
              </View>
            </View>

            {/* Title */}
            {/* Use array style and cast token to any to satisfy RN TextStyle typing */}
            <Text style={[typography.h2, { color: colors.gray800, textAlign: 'center', marginBottom: spacing.sm }]}>
              {currentStepData.title}
            </Text>

            {/* Description */}
            <Text style={{ fontSize: 16, color: colors.gray600, textAlign: 'center', lineHeight: 22 }}>
              {currentStepData.description}
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={{ padding: spacing.lg }}>
          <Button
            title={currentStep === tutorialSteps.length - 1 ? 'Zum Dashboard' : 'Weiter'}
            onPress={handleNext}
            style={{ height: 56 }}
          />
          {/* Step indicator text */}
          <Text style={{ textAlign: 'center', color: colors.gray400, fontSize: 12, marginTop: spacing.sm }}>
            {currentStep + 1} von {tutorialSteps.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
