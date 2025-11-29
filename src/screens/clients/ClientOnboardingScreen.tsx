/* @ts-nocheck */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { setOnboardingComplete } from '@/auth/tokenStorage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated'; // Standard for performant RN animation
import Icon from '@/components/Icon';
import { colors } from '@/theme/tokens';
import type { RootStackScreenProps } from '@/navigation/types';

// Assuming these custom RN components exist
import Button from '@/components/Button';

const onboardingSteps = [
  {
    id: 1,
    iconName: 'search',
    title: 'Finde deinen perfekten Friseur',
    description: 'Durchsuche Hunderte von qualifizierten Friseuren, Salons und Barbieren in deiner Nähe.',
    image: '🔍',
    color: colors.secondary
  },
  {
    id: 2,
    iconName: 'calendar',
    title: 'Buche sofort einen Termin',
    description: 'Wähle deine bevorzugte Zeit und buche deinen Termin in Sekunden - keine Telefonate nötig.',
    image: '📅',
    color: colors.primary
  },
  {
    id: 3,
    iconName: 'message-circle',
    title: 'Bleib in Kontakt',
    description: 'Chat direkt mit deinem Friseur und erhalte Updates zu deinem Termin in Echtzeit.',
    image: '💬',
    color: colors.secondary
  },
  {
    id: 4,
    iconName: 'star',
    title: 'Teile deine Erfahrungen',
    description: 'Bewerte und rezensiere deine Friseure, um anderen bei der perfekten Wahl zu helfen.',
    image: '⭐',
    color: colors.primary
  }
];

const screenWidth = Dimensions.get('window').width;

// --- Refactored Component ---

export function ClientOnboardingScreen() {
  type RootNav = RootStackScreenProps<'ClientOnboarding'>['navigation'];
  const navigation = useNavigation<RootNav>();
  const [currentStep, setCurrentStep] = useState(0);

  // Reanimated values for content animation
  const xOffset = useSharedValue(0);
  const iconScale = useSharedValue(1);

  const navigateToHome = async () => {
    // Replacement for localStorage.setItem
    await setOnboardingComplete();
    // Navigate to the next screen, replacing the current one in the stack
    navigation.navigate('LocationAccess');
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      // 1. Animate out (slide left and slightly fade)
      xOffset.value = withSequence(
        withTiming(-screenWidth, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(screenWidth, { duration: 0 }) // Instant jump to right for next step
      );
      
      // 2. Update state to render next slide
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300); // Wait for the 'out' animation to finish

      // 3. Animate in (slide back to center)
      setTimeout(() => {
        xOffset.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
      }, 350); // Small delay to ensure the state update renders the new slide at +screenWidth

      // 4. Icon scale animation
      iconScale.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) })
      );

    } else {
      // Complete onboarding
      navigateToHome();
    }
  };

  const handleSkip = navigateToHome;

  const handleBack = () => {
    if (currentStep > 0) {
      // 1. Animate out (slide right and slightly fade)
      xOffset.value = withSequence(
        withTiming(screenWidth, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(-screenWidth, { duration: 0 }) // Instant jump to left for previous step
      );
      
      // 2. Update state to render previous slide
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 300); // Wait for the 'out' animation to finish

      // 3. Animate in (slide back to center)
      setTimeout(() => {
        xOffset.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
      }, 350); 
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const StepIconName = currentStepData.iconName;

  // Animated styles using reanimated
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: xOffset.value }],
      opacity: xOffset.value === 0 ? withTiming(1, { duration: 150 }) : withTiming(0, { duration: 150 }),
    };
  }, [currentStep]); // Re-run style when currentStep changes

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  }, [currentStep]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header with Back and Skip */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, currentStep === 0 ? styles.opacity0 : styles.opacity1]}
            disabled={currentStep === 0}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={24} color={colors.gray600} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Überspringen</Text>
          </TouchableOpacity>
        </View>

        {/* Progress indicators */}
        <View style={styles.progressBarContainer}>
          {onboardingSteps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressBar,
                styles.progressBarFlex,
                index <= currentStep ? styles.progressBarActive : styles.progressBarInactive,
              ]}
            />
          ))}
        </View>

        {/* Content - Wrapped in Animated.View for screen transitions */}
        <View style={styles.contentWrapper}>
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            
            {/* Icon/Illustration */}
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <View 
                style={[
                  styles.outerCircle,
                  { backgroundColor: `${currentStepData.color}15` }
                ]}
              >
                <View 
                  style={[
                    styles.innerCircle,
                    { backgroundColor: `${currentStepData.color}25` }
                  ]}
                >
                  <Icon 
                    name={StepIconName}
                    size={64} // w-16 h-16
                    color={currentStepData.color}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>
              {currentStepData.title}
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              {currentStepData.description}
            </Text>
            
          </Animated.View>
        </View>

        {/* Bottom Button and Pager */}
        <View style={styles.bottomArea}>
          <Button
            title={currentStep === onboardingSteps.length - 1 ? 'Loslegen' : 'Weiter'}
            onPress={handleNext}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
          />
          
          {/* Step indicator text */}
          <Text style={styles.pagerText}>
            {currentStep + 1} von {onboardingSteps.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
export default ClientOnboardingScreen;

// --- Stylesheet for React Native ---

  const styles = StyleSheet.create({
  backButton: {
    marginLeft: -8,
    padding: 8,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  content: {
    alignItems: 'center',
    position: 'absolute',
    textAlign: 'center',
    width: screenWidth - 48,
  },
  contentWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  description: {
    color: colors.gray600,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconContainer: {
    marginBottom: 48,
  },
  innerCircle: {
    alignItems: 'center',
    borderRadius: 64,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    marginBottom: 8,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  opacity0: { opacity: 0 },
  opacity1: { opacity: 1 },
  outerCircle: {
    alignItems: 'center',
    borderRadius: 96,
    elevation: 4,
    height: 192,
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: 192,
  },
  pagerText: {
    color: colors.gray400,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    borderRadius: 2,
    height: 4,
  },
  progressBarActive: { backgroundColor: colors.primary, opacity: 1 },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  progressBarFlex: { flexGrow: 1 },
  progressBarInactive: { backgroundColor: colors.gray200, opacity: 0.6 },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: colors.gray500,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: colors.gray800,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});
