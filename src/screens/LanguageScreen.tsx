import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform, // Needed for header shadow fix
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// --- Type Definitions for Icons (Fixes TS Error 2307) ---
// In a real app, this would be imported from your icon library (e.g., react-native-vector-icons)
type IconProps = { size: number; color: string; style?: object };
const ArrowLeft = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'<'}</Text>;
const Check = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'✓'}</Text>;
const Globe = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'🌐'}</Text>;

// --- Constants (Simplified/Centralized) ---

const COLORS = {
  primary: '#8B4513', 
  white: '#FFFFFF',
  grayBackground: '#F9FAFB', 
  blueBackground: '#EFF6FF', 
  blueBorder: '#DBEAFE', 
  blueText: '#1E40AF', 
  text: '#1F2937', 
  textSecondary: '#6B7280', 
  border: '#E5E7EB', 
  shadow: 'rgba(0, 0, 0, 0.1)',
};
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
};

// Mock language data
const languages = [
  { code: "de", name: "Deutsch", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
];

// --- Reusable Components (Best Practice) ---

// 1. Header Component
const Header = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touchable area
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sprache</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>
    </View>
  );
};

// 2. Card Component
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type CardProps = { children: ReactNode; style?: StyleProp<ViewStyle> };
const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);


// --- Main Screen Component ---

export function LanguageScreen() {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState("de");

  const handleLanguageChange = (code: string) => {
    // Only proceed if language is actually changing
    if (selectedLanguage === code) return; 

    setSelectedLanguage(code);
    const languageName = languages.find(l => l.code === code)?.nativeName;

    // Use Alert with a callback to simulate the success notification and navigation
    Alert.alert(
        'Erfolg',
        `Die App-Sprache wurde auf ${languageName} geändert.`,
        [
            { 
                text: 'OK', 
                // In a real app, you might trigger a language change in a global state here
            }
        ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.contentContainer}>
          
          {/* Info Card (Blue Alert style) */}
          <Card style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Globe size={20} color={COLORS.blueText} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>App-Sprache</Text>
                <Text style={styles.infoText}>
                  Wähle die Sprache, in der die App angezeigt werden soll.
                </Text>
              </View>
            </View>
          </Card>

          {/* Languages List */}
          <Card style={styles.languageListCard}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => handleLanguageChange(language.code)}
                style={[
                  styles.languageItem,
                  // Use a condition to apply a separator line *between* items
                  index > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.languageItemContent}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View>
                    <Text style={styles.nativeName}>{language.nativeName}</Text>
                    {language.name !== language.nativeName && (
                      <Text style={styles.englishName}>{language.name}</Text>
                    )}
                  </View>
                </View>
                {selectedLanguage === language.code && (
                  <Check size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Card>

          {/* Additional Info/Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Hinweis</Text>
            <Text style={styles.noteText}>
              Die Spracheinstellung betrifft nur die Benutzeroberfläche der App.
              Profile und Inhalte von Anbietern können in verschiedenen Sprachen
              sein.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- React Native Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.grayBackground,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  // Header Styles
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm, // Reduced padding for a tighter look
    // Mimicking shadow-sm
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 3,
      },
    }),
    zIndex: 10, // Ensure header is above content when scrolling
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? SPACING.sm : 0, // Add top padding for Android (where SafeAreaView is less effective)
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  // Content and Card Styles
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  // Info Card Styles
  infoCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.blueBackground,
    borderWidth: 1,
    borderColor: COLORS.blueBorder,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    marginLeft: SPACING.sm * 1.5, // Used margin instead of unsupported 'gap'
    flexShrink: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A', 
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.blueText,
  },
  // Language List Styles
  languageListCard: {
    // No extra styling, relying on .card
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm, // Adjusted padding for better visual spacing
    paddingHorizontal: SPACING.md,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -SPACING.md, // Counteract card horizontal padding
    paddingLeft: SPACING.md,
  },
  flag: {
    fontSize: 30, 
    marginRight: SPACING.md, // Used margin instead of unsupported 'gap'
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  englishName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Additional Info/Note Styles
  noteContainer: {
    padding: SPACING.md,
    backgroundColor: 'transparent', // Make it transparent like the original
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});