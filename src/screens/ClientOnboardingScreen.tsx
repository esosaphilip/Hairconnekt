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
import AsyncStorage from '@react-native-async-storage/async-storage'; // RN storage replacement
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated'; // Standard for performant RN animation
import { Search, Calendar, MessageCircle, Star, ChevronLeft } from 'lucide-react-native'; // Native icons

// Assuming these custom RN components exist
import Button from '../components/Button';

const onboardingSteps = [
  {
    id: 1,
    icon: Search,
    title: 'Finde deinen perfekten Friseur',
    description: 'Durchsuche Hunderte von qualifizierten Friseuren, Salons und Barbieren in deiner Nähe.',
    image: '🔍',
    color: '#FF6B6B'
  },
  {
    id: 2,
    icon: Calendar,
    title: 'Buche sofort einen Termin',
    description: 'Wähle deine bevorzugte Zeit und buche deinen Termin in Sekunden - keine Telefonate nötig.',
    image: '📅',
    color: '#8B4513'
  },
  {
    id: 3,
    icon: MessageCircle,
    title: 'Bleib in Kontakt',
    description: 'Chat direkt mit deinem Friseur und erhalte Updates zu deinem Termin in Echtzeit.',
    image: '💬',
    color: '#FF6B6B'
  },
  {
    id: 4,
    icon: Star,
    title: 'Teile deine Erfahrungen',
    description: 'Bewerte und rezensiere deine Friseure, um anderen bei der perfekten Wahl zu helfen.',
    image: '⭐',
    color: '#8B4513'
  }
];

const screenWidth = Dimensions.get('window').width;

// --- Refactored Component ---

export function ClientOnboardingScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);

  // Reanimated values for content animation
  const xOffset = useSharedValue(0);
  const iconScale = useSharedValue(1);

  const navigateToHome = async () => {
    // Replacement for localStorage.setItem
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    // Navigate to the next screen, replacing the current one in the stack
    (navigation as any).navigate('LocationAccess'); // Assuming the route is named LocationAccess
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
  const Icon = currentStepData.icon;

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
            style={[styles.backButton, { opacity: currentStep === 0 ? 0 : 1 }]}
            disabled={currentStep === 0}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#4B5563" /> {/* gray-600 */}
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
                {
                  backgroundColor: index <= currentStep ? '#8B4513' : '#E5E5E5',
                  flexGrow: 1,
                  opacity: index <= currentStep ? 1 : 0.6,
                },
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 0 : 20, // Add padding for Android
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Compensate for padding
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    fontWeight: '500',
  },
  // --- Progress Bar ---
  progressBarContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 32, // mb-8
  },
  progressBar: {
    height: 4, // h-1
    borderRadius: 2,
    // transition: 'background-color 300ms', // Removed: not a valid React Native style property
  },
  // --- Content ---
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    // RN trick for animated views: Use a fixed height/width container
    overflow: 'hidden', 
  },
  content: {
    position: 'absolute', // Allows sliding off-screen without affecting layout flow
    width: screenWidth - 48, // screenWidth - (padding*2)
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: 48, // mb-12
  },
  outerCircle: {
    width: 192, // w-48
    height: 192,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // Android shadow
  },
  innerCircle: {
    width: 128, // w-32
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // gray-900
    marginBottom: 16, // mb-4
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#4B5563', // gray-600
    lineHeight: 28, // leading-relaxed
    textAlign: 'center',
  },
  // --- Bottom Area ---
  bottomArea: {
    paddingHorizontal: 24, // p-6
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: '#8B4513',
    height: 56, // h-14
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  pagerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF', // gray-400
    marginBottom: 16,
  },
});