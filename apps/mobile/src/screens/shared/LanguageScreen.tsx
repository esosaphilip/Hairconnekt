import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { http } from '@/api/http';
import { useAuth } from '@/auth/AuthContext';
import { useI18n, t } from '@/i18n';
import { getPreferredLanguageSetting, savePreferredLanguageSetting } from '@/auth/tokenStorage';
import type { PublicUser } from '@/auth/tokenStorage';
import { COLORS, SPACING, shadows } from '@/theme/tokens';

// --- Type Definitions for Icons (Fixes TS Error 2307) ---
// In a real app, this would be imported from your icon library (e.g., react-native-vector-icons)
type IconProps = { size: number; color: string; style?: object };
const ArrowLeft = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'<'}</Text>;
const Check = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'✓'}</Text>;
const Globe = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>{'🌐'}</Text>;

// --- Constants ---

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
        <Text style={styles.headerTitle}>{t('screens.language.title')}</Text>
        <View style={styles.headerSpacer} /> {/* Spacer */}
      </View>
    </View>
  );
};

type CardProps = { children: ReactNode; style?: StyleProp<ViewStyle> };
const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);


// --- Main Screen Component ---

export function LanguageScreen() {
  const { setLocale } = useI18n();
  // Be explicit with types to avoid TS "never" inference issues when using an untyped context
  const auth = useAuth() as unknown as {
    user: PublicUser | null;
    setUser: (u: PublicUser) => Promise<void>;
  };
  const user: PublicUser | null = auth?.user || null;
  const setUser = (auth?.setUser || (async (_u: PublicUser) => {})) as (u: PublicUser) => Promise<void>;
  const [selectedLanguage, setSelectedLanguage] = useState<string>('de');
  const [saving, setSaving] = useState(false);

  // Initialize from user preferredLanguage or locally saved setting
  useEffect(() => {
    let mounted = true;
    (async () => {
      const current = (user?.preferredLanguage as string | undefined) || (await getPreferredLanguageSetting()) || 'de';
      if (mounted) setSelectedLanguage(current);
    })();
    return () => { mounted = false; };
  }, [user?.preferredLanguage]);

  const handleLanguageChange = async (code: string) => {
    // Only proceed if language is actually changing
    if (selectedLanguage === code || saving) return;
    setSelectedLanguage(code);
    setSaving(true);
    const languageName = languages.find(l => l.code === code)?.nativeName;
    try {
      if (user?.id) {
        // Update backend user preference
        await http.patch('/users/me/language', { preferredLanguage: code });
        // Update local auth bundle user (ensure non-null type for spread)
        const currentUser = user as PublicUser;
        await setUser({ ...currentUser, preferredLanguage: code });
      }
      // Persist locally for unauthenticated users or redundancy
      await savePreferredLanguageSetting(code);
      // Update UI locale immediately
      await setLocale(code);
      Alert.alert(t('screens.language.successTitle'), t('screens.language.changedTo', { language: languageName }));
    } catch (e) {
      console.error('Language change failed:', e);
      const msg = e instanceof Error ? e.message : t('screens.language.changeFailed');
      Alert.alert(t('screens.language.errorTitle'), msg);
      // revert selection on error
      setSelectedLanguage((user?.preferredLanguage as string | undefined) || (await getPreferredLanguageSetting()) || 'de');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.contentContainer}>
          
          {/* Info Card (Blue Alert style) */}
          <Card style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Globe size={20} color={COLORS.infoText} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>{t('screens.language.appLanguage')}</Text>
                <Text style={styles.infoText}>{t('screens.language.info')}</Text>
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
                index > 0 ? styles.languageItemSeparator : null,
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
            <Text style={styles.noteTitle}>{t('screens.language.noteTitle')}</Text>
            <Text style={styles.noteText}>{t('screens.language.noteText')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- React Native Stylesheet ---

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  englishName: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  flag: {
    fontSize: 30,
    marginRight: SPACING.md,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    ...Platform.select({
      ios: { ...shadows.sm },
      android: { elevation: shadows.sm.elevation },
    }),
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? SPACING.sm : 0,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.infoBorder,
    borderWidth: 1,
    padding: SPACING.md,
  },
  infoContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  infoText: {
    color: COLORS.infoText,
    fontSize: 14,
  },
  infoTextContainer: {
    flexShrink: 1,
    marginLeft: SPACING.sm * 1.5,
  },
  infoTitle: {
    color: COLORS.infoText,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  languageItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: -SPACING.md,
    paddingLeft: SPACING.md,
  },
  languageItemSeparator: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
  },
  languageListCard: {},
  nativeName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  noteContainer: {
    backgroundColor: 'transparent',
    padding: SPACING.md,
  },
  noteText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  noteTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
});