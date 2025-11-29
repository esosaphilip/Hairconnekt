import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from '@/components/Icon';

// Custom Components (assumed to be available)
import Text from '@/components/Text';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { colors, spacing } from '@/theme/tokens';
import { useAuth } from '@/auth/AuthContext'; // Use correct context path
import { useI18n } from '@/i18n';

// --- Brand Color Constant ---

type NavParams = { Verify: undefined };

export function MessagesScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation<NavigationProp<NavParams>>();
  const { user, tokens } = useAuth();
  const { t } = useI18n();

  // The verification logic remains the same
  const isVerified = !!tokens?.accessToken && !!(user?.emailVerified || user?.phoneVerified);

  const goVerify = () => {
    navigation.navigate('Verify');
  };

  // --- Unverified State Render ---
  if (!isVerified) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerFixed}>
          <Text style={styles.mainTitle}>{t('screens.messages.title')}</Text>
        </View>
        <View style={styles.contentPadding}>
          <Card style={styles.unverifiedCard}>
            <View style={styles.unverifiedContent}>
          <Icon name="alert-circle" size={20} color={colors.amber} style={styles.iconMargin} />
              <View style={styles.unverifiedTextContainer}>
                <Text style={styles.unverifiedTitle}>{t('screens.messages.unverified.title')}</Text>
                <Text style={styles.unverifiedDescription}>
                  {t('screens.messages.unverified.description')}
                </Text>
                <Button
                  title={t('screens.messages.unverified.button')}
                  onPress={goVerify}
                  style={styles.verifyButton}
                  textStyle={styles.verifyButtonText}
                />
              </View>
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  // --- Verified State Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerFixed}>
        <Text style={styles.mainTitle}>{t('screens.messages.title')}</Text>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.gray400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={t('screens.messages.searchPlaceholder')}
            placeholderTextColor={colors.gray400}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="search" size={32} color={colors.gray400} />
          </View>
          <Text style={styles.emptyTitle}>{t('screens.messages.empty.title')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('screens.messages.empty.subtitle')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for RN ---
const styles = StyleSheet.create({
  contentPadding: {
    paddingHorizontal: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 48,
  },
  emptyIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.gray200,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64,
  },
  emptySubtitle: {
    color: colors.gray500,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerFixed: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconMargin: {
    flexShrink: 0,
    marginTop: 2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    justifyContent: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
  },
  searchIcon: {
    left: spacing.sm,
    position: 'absolute',
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.gray800,
    fontSize: 16,
    height: 40,
    paddingLeft: spacing.lg + spacing.xs,
    paddingRight: spacing.sm,
  },
  unverifiedCard: {
    backgroundColor: colors.amber50,
    borderColor: colors.amber200,
    borderWidth: 1,
    padding: spacing.md,
  },
  unverifiedContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  unverifiedDescription: {
    color: colors.amber900,
    fontSize: 14,
  },
  unverifiedTextContainer: {
    flex: 1,
  },
  unverifiedTitle: {
    color: colors.amber900,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  verifyButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.amber,
    borderRadius: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});