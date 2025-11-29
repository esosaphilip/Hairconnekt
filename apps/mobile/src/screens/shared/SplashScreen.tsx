import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // Assuming Ionicons is available

// --- Constants ---
const { width, height } = Dimensions.get('window');
const THEME_COLOR_DARK = '#8B4513';
const THEME_COLOR_MEDIUM = '#A0522D';

// --- Placeholder for Complex SVG Icon ---
// Since we cannot use react-native-svg, we simulate the icon's shape and color
const HairConnektIcon = ({ size = 80 }: { size?: number }) => {
  return (
    <View
      style={{
        width: size * 1.6,
        height: size * 1.6,
        backgroundColor: 'white',
        borderRadius: size * 0.4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}
    >
      {/* Simple representation of a hair-related icon */}
      <Ionicons name="cut-outline" size={size} color={THEME_COLOR_DARK} />
    </View>
  );
};

// --- Animated Loading Dots Component ---
const LoadingDots = () => {
  const animatedValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animateDot = (index: number, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValues[index], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValues[index], {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();
    };

    // Start animations with staggered delays
    animateDot(0, 0);
    setTimeout(() => animateDot(1, 0), 200);
    setTimeout(() => animateDot(2, 0), 400);
  }, []);

  return (
    <View style={styles.loadingDotContainer}>
      {animatedValues.map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.3],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.loadingDot,
              { transform: [{ scale }], opacity },
            ]}
          />
        );
      })}
    </View>
  );
};

// --- Main Component ---
export function SplashScreen() {
  // Cast navigation to a Native Stack navigation to access replace()
  const navigation = useNavigation<any>();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const tagLineOpacityAnim = useRef(new Animated.Value(0)).current;

  const { tokens, user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Resolve auth state
    const isLoggedIn = !!tokens?.accessToken;
    const userType = (user?.userType || '').toUpperCase();

    // 1. Initial Logo Animation (mimics motion initial/animate)
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // 2. Tagline Fade-In
    setTimeout(() => {
        Animated.timing(tagLineOpacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, 1200); // delay: 1.2s

    // 3. Navigation Logic (runs after 2500ms total splash time)
    const timer = setTimeout(() => {
      // Small additional delay to allow animation to complete (mimics the original 500ms after isLoaded)
      setTimeout(() => {
        if (authLoading) {
          // If auth still loading, stay on splash; a subsequent effect run will navigate
          return;
        }
        if (isLoggedIn) {
          if (userType === 'PROVIDER') {
            // Navigate to provider tab navigator, which defaults to Dashboard tab
            navigation.replace('ProviderTabs');
          } else {
            // Navigate to client tab navigator
            navigation.replace('Tabs');
          }
        } else {
          navigation.replace('Login'); // Entry screen for unauthenticated users
        }
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, tokens, user, authLoading]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME_COLOR_DARK} />
      {/* Background Gradient Simulation */}
      <View style={styles.background}>
        <View style={styles.contentWrapper}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            {/* Logo/Brand */}
            <HairConnektIcon />
            <Text style={styles.title}>HairConnekt</Text>
            <Text style={styles.subtitle}>Ihr Friseur, Ihre Zeit</Text>
          </Animated.View>

          {/* Loading indicator */}
          <Animated.View style={{ opacity: opacityAnim }}>
            <LoadingDots />
          </Animated.View>

        </View>
        
        {/* Bottom tagline */}
        <Animated.View style={[styles.taglineWrapper, { opacity: tagLineOpacityAnim }]}>
          <Text style={styles.tagline}>
            Verbinde dich mit den besten Friseuren in deiner Stadt
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: THEME_COLOR_MEDIUM,
    flex: 1,
  },
  // Background simulates the gradient from-[#8B4513] via-[#A0522D]
  background: {
    flex: 1,
    backgroundColor: THEME_COLOR_MEDIUM, // Base color
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    // Note: A true gradient would require expo-linear-gradient
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
  },

  // Loading Dots
  loadingDotContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  loadingDot: {
    backgroundColor: 'white',
    borderRadius: 6,
    height: 12,
    width: 12,
  },

  // Bottom Tagline
  taglineWrapper: {
    alignItems: 'center',
    bottom: 48,
    paddingHorizontal: 24,
    position: 'absolute',
    width: '100%',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
});
