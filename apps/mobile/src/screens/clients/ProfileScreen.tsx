import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/AuthContext';
import { usersApi } from '@/services/users';
import { normalizeUrl } from '@/utils/url';
import Icon from '@/components/Icon';
import * as ImagePicker from 'expo-image-picker';
import { useI18n } from '@/i18n';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Separator from '@/components/separator';
import { Switch } from 'react-native';
import { spacing, colors, typography, radii, FONT_SIZES } from '@/theme/tokens';
import { logger } from '@/services/logger';
import AlertModal from '@/components/AlertModal';
import { AppImage } from '@/components/AppImage';

type MeResponse = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  userType: string;
  preferredLanguage: string;
  memberSince: string;
  verified: { email: boolean; phone: boolean };
  addressesCount: number;
  clientProfile?: unknown;
  stats: { appointments: number; upcoming: number; completed: number; cancelled: number; favorites: number; reviews: number };
};


// --- Utility Components Refactored for RN ---

/**
 * RN equivalent for the MenuItem component.
 * Uses Pressable for interaction and StyleSheet for styling.
 */
type MenuItemProps = {
  iconName: string;
  label: string;
  value?: string;
  badge?: number;
  onClick: () => void;
  danger?: boolean;
};

const MenuItem = ({ iconName, label, value, badge, onClick, danger = false }: MenuItemProps) => (
  <Pressable
    onPress={onClick}
    style={({ pressed }) => [
      styles.menuItem,
      { backgroundColor: pressed ? colors.gray50 : colors.white },
    ]}
  >
    <View style={styles.menuItemLeft}>
      <View
        style={[
          styles.menuItemIconContainer,
          danger && styles.menuItemIconContainerDanger,
        ]}
      >
        <Icon name={iconName} size={20} color={danger ? colors.error : colors.gray700} />
      </View>
      <Text style={[styles.menuItemLabel, danger && styles.menuItemLabelDanger]}>
        {label}
      </Text>
    </View>
    <View style={styles.menuItemRight}>
      {badge !== undefined && ( // Check for undefined to allow 0 to be rendered
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {value && (
        <Text style={styles.menuItemValue}>{value}</Text>
      )}
      <Icon name="chevron-forward" size={20} color={colors.gray400} />
    </View>
  </Pressable>
);

/**
 * RN equivalent for SectionHeader.
 * Replaces div with View and p with Text, using native styles.
 */
type SectionHeaderProps = { title: string };

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

// --- Main ProfileScreen Component ---

export function ProfileScreen() {
  const { t, locale } = useI18n();
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const navigation = useNavigation();
  const { logout, user, setUser } = useAuth();

  // After logout, RootNavigator will automatically reset to Welcome when user becomes null.

  // Helper function to navigate to a screen
  const navigateTo = (screen: string) => {
    // @ts-expect-error navigation uses string route names in this stack
    navigation.navigate(screen);
  };

  // Memoized values remain largely the same, only the formatting utility is native
  const initials = useMemo(() => {
    const fn = me?.firstName || user?.firstName || '';
    const ln = me?.lastName || user?.lastName || '';
    return [fn[0], ln[0]].filter(Boolean).join('').toUpperCase() || 'U';
  }, [me, user]);

  const formattedMemberSince = useMemo(() => {
    if (!me?.memberSince) return '';
    try {
      const d = new Date(me.memberSince);
      // Use locale-aware formatting
      const tag = locale === 'de' ? 'de-DE' : 'en-US';
      return new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric' }).format(d);
    } catch {
      return '';
    }
  }, [me?.memberSince, locale]);

  // --- Data Fetching Effect (Remains nearly identical) ---
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    usersApi
      .getMe()
      .then((data) => {
        if (!isMounted) return;
        setMe(data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        logger.error('Failed to load profile:', err);
        const msg = typeof err === 'object' && err && 'message' in err
          ? (err as { message: string }).message
          : t('screens.profile.loadError');
        setError(msg);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Avatar Upload Logic Refactored for RN ---
  const handleAvatarUpload = async () => {
    if (uploadingAvatar) return;

    // 1. Request Media Library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('screens.profile.avatar.permissionTitle'), t('screens.profile.avatar.permissionText'));
      return;
    }

    // 2. Select Image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, // Often required for direct API upload
    });

    if (result.canceled || !result.assets || !result.assets[0].uri) {
      return; // User cancelled
    }

    setUploadingAvatar(true);
    try {
      const imageUri = result.assets[0].uri;
      // In a real RN app, the upload function would handle the URI/Blob/Base64,
      // and not a DOM File object. We mock the call here.
      const res = await usersApi.uploadAvatar(imageUri);

      // Simple alert for toast replacement
      Alert.alert(t('common.successTitle'), t('screens.profile.avatar.uploadSuccess'));

      setMe((prev) => (prev ? { ...prev, avatarUrl: res.url } : prev));
      // Also update the auth bundle so other parts of the app see the new avatar
      try {
        const nextUser = user ? { ...user, avatarUrl: res.url } : user;
        if (nextUser) await setUser(nextUser);
      } catch { }
    } catch (err: unknown) {
      logger.error('Avatar upload failed:', err);
      const msg = typeof err === 'object' && err && 'message' in err
        ? (err as { message: string }).message
        : 'Upload fehlgeschlagen';
      Alert.alert(t('common.errorTitle'), msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    logger.debug('[ProfileScreen] handleLogout called');
    // On web, use an in-app modal to avoid any race with navigation.
    if (Platform.OS === 'web') {
      setShowLogoutDialog(true);
      return;
    }
    Alert.alert(
      t('screens.profile.logoutConfirmTitle') || 'Abmelden',
      t('screens.profile.logoutConfirmText') || 'Möchtest du dich wirklich abmelden?',
      [
        {
          text: t('screens.profile.logoutConfirmCancel') || 'Abbrechen',
          style: 'cancel',
        },
        {
          text: t('screens.profile.logoutConfirmConfirm') || 'Abmelden',
          onPress: () => {
            Promise.resolve(logout());
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // --- Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleBar}>
            <Text style={styles.screenTitle}>{t('screens.profile.title')}</Text>
            <Pressable
              onPress={() => navigateTo('Settings')}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Icon name="settings" size={24} color={colors.gray700} />
            </Pressable>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfoContainer}>
            <View style={styles.avatarWrapper}>
              {/* Avatar Component equivalent */}
              <View style={styles.avatar}>
                {me?.avatarUrl ? (
                  <AppImage uri={me.avatarUrl} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitials}>{initials}</Text>
                )}
              </View>

              {/* Camera Icon Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.cameraButton,
                  { opacity: uploadingAvatar || pressed ? 0.6 : 1 },
                ]}
                onPress={handleAvatarUpload}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Icon name="camera" size={16} color={colors.white} />
                )}
              </Pressable>
            </View>

            {/* User Details */}
            {loading ? (
              <View style={styles.loadingName} />
            ) : (
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{me?.name || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`}</Text>
                <Text style={styles.userEmail}>{me?.email || user?.email}</Text>
                <Text style={styles.userPhone}>{me?.phone || user?.phone}</Text>
              </View>
            )}

            {/* Verification Badges */}
            <View style={styles.badgesContainer}>
              {me?.verified?.email && (
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>{t('screens.profile.verified.email')}</Text>
                </View>
              )}
              {me?.verified?.phone && (
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>{t('screens.profile.verified.phone')}</Text>
                </View>
              )}
            </View>

            {/* Member Since */}
            <Text style={styles.memberSinceText}>
              {me?.memberSince ? t('screens.profile.memberSince', { date: formattedMemberSince }) : ''}
            </Text>

            <Button
              title={t('screens.profile.editProfile')}
              variant="outline"
              style={styles.editProfileButton}
              onPress={() => navigateTo('EditProfile')}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statValue}>
              {loading ? (
                <View style={styles.loadingStat} />
              ) : (
                <Text style={styles.statNumber}>{me?.stats?.appointments ?? 0}</Text>
              )}
            </View>
            <Text style={styles.statLabel}>{t('screens.profile.stats.appointments')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statValue}>
              {loading ? (
                <View style={styles.loadingStat} />
              ) : (
                <Text style={styles.statNumber}>{me?.stats?.favorites ?? 0}</Text>
              )}
            </View>
            <Text style={styles.statLabel}>{t('screens.profile.stats.favorites')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statValue}>
              {loading ? (
                <View style={styles.loadingStat} />
              ) : (
                <Text style={styles.statNumber}>{me?.stats?.reviews ?? 0}</Text>
              )}
            </View>
            <Text style={styles.statLabel}>{t('screens.profile.stats.reviews')}</Text>
          </View>
        </View>

        {/* My Profile Section */}
        <SectionHeader title={t('screens.profile.sections.myProfile')} />
        <Card style={styles.card}>
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <MenuItem iconName="notifications" label={t('screens.profile.menu.notifications')} onClick={() => navigateTo('Notifications')} />
          <Separator /> */}
          <MenuItem iconName="person" label={t('screens.profile.menu.personalInfo')} onClick={() => navigateTo('PersonalInfo')} />
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <Separator />
          <MenuItem
            iconName="map"
            label={t('screens.profile.menu.addresses')}
            badge={me?.addressesCount ?? 0}
            onClick={() => navigateTo('Addresses')}
          />
          <Separator />
          <MenuItem
            iconName="person"
            label={t('screens.profile.menu.preferences')}
            onClick={() => navigateTo('HairPreferences')}
          /> */}
        </Card>

        {/* My Activities Section */}
        <SectionHeader title={t('screens.profile.sections.myActivities')} />
        <Card style={styles.card}>
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <MenuItem
            iconName="heart"
            label={t('screens.profile.menu.favorites')}
            badge={me?.stats?.favorites ?? 0}
            onClick={() => navigateTo('Favorites')}
          /> */}
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <Separator />
          <MenuItem
            iconName="star"
            label={t('screens.profile.menu.myReviews')}
            badge={me?.stats?.reviews ?? 0}
            onClick={() => navigateTo('MyReviews')}
          /> */}
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <Separator />
          <MenuItem iconName="calendar" label={t('screens.profile.menu.bookingHistory')} onClick={() => navigateTo('BookingHistory')} /> */}
        </Card>

        {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
        {/* 
        <SectionHeader title={t('screens.profile.sections.payments')} />
        <Card style={styles.card}>
          <MenuItem iconName="card" label={t('screens.profile.menu.paymentMethods')} onClick={() => navigateTo('PaymentMethods')} />
          <Separator />
          <MenuItem iconName="gift" label={t('screens.profile.menu.vouchers')} badge={0} onClick={() => navigateTo('Vouchers')} />
          <Separator />
          <MenuItem iconName="document-text" label={t('screens.profile.menu.transactions')} onClick={() => navigateTo('Transactions')} />
        </Card>
        */}

        {/* Settings Section */}
        <SectionHeader title={t('screens.profile.sections.settings')} />
        <Card style={styles.card}>
          {/* Settings Section Switches */}
          <View style={styles.settingsBlock}>
            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={styles.menuItemIconContainer}>
                  <Icon name="notifications" size={20} color={colors.gray700} />
                </View>
                <Text style={styles.menuItemLabel}>{t('screens.profile.menu.notifications')}</Text>
              </View>
              <Switch
                value={notifications.push}
                onValueChange={(checked) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </View>
            <Separator style={{ marginVertical: spacing.sm }} />

            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={styles.menuItemIconContainer}>
                  <Icon name="notifications" size={20} color={colors.gray700} />
                </View>
                <Text style={styles.menuItemLabel}>{t('screens.profile.verified.email')}</Text>
              </View>
              <Switch
                value={notifications.email}
                onValueChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </View>
            <Separator style={{ marginVertical: spacing.sm }} />

            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={styles.menuItemIconContainer}>
                  <Icon name="notifications" size={20} color={colors.gray700} />
                </View>
                <Text style={styles.menuItemLabel}>SMS</Text>
              </View>
              <Switch
                value={notifications.sms}
                onValueChange={(checked) =>
                  setNotifications({ ...notifications, sms: checked })
                }
              />
            </View>
          </View>
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <Separator />
          <MenuItem
            iconName="globe"
            label={t('screens.profile.menu.language')}
            value={locale === 'de' ? t('common.languages.de') : t('common.languages.en')}
            onClick={() => navigateTo('Language')}
          /> */}
          <Separator />
          <MenuItem
            iconName="shield"
            label={t('screens.profile.menu.privacy')}
            onClick={() => navigateTo('Privacy')}
          />
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <Separator />
          <MenuItem iconName="help-circle" label={t('screens.profile.menu.support')} onClick={() => navigateTo('Support')} /> */}
        </Card>

        {/* Legal Section */}
        <SectionHeader title={t('screens.profile.sections.legal')} />
        <Card style={styles.card}>
          <MenuItem
            iconName="document-text"
            label={t('screens.profile.menu.terms')}
            onClick={() => navigateTo('Terms')}
          />
          <Separator />
          <MenuItem
            iconName="document-text"
            label={t('screens.profile.menu.privacyPolicy')}
            onClick={() => navigateTo('PrivacyPolicy')}
          />
          <Separator />
          <MenuItem iconName="document-text" label={t('screens.profile.menu.imprint')} onClick={() => navigateTo('Imprint')} />
        </Card>

        {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
        {/*
        {String(user?.userType || '').toLowerCase() === 'client' && (
          <View style={{ padding: spacing.xl }}>
            <View style={{ backgroundColor: colors.primary, padding: spacing.xl, borderRadius: radii.lg, alignItems: 'center' }}>
              <Text style={{ fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.white, marginBottom: spacing.sm }}>Anbieter werden</Text>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.white, textAlign: 'center', opacity: 0.9, marginBottom: spacing.lg }}>
                Biete deine Services an und erreiche neue Kunden
              </Text>
              <Button title="Mehr erfahren" onPress={() => navigateTo('BecomeProvider')} style={{ backgroundColor: colors.white }} textStyle={{ color: colors.primary }} />
            </View>
          </View>
        )}
        */}

        {/* Account Actions */}
        <SectionHeader title={t('screens.profile.sections.account')} />
        <Card style={styles.card}>
          <MenuItem iconName="log-out" label={t('screens.profile.menu.logout')} danger onClick={handleLogout} />
          <Separator />
          <MenuItem
            iconName="trash"
            label={t('screens.profile.menu.deleteAccount')}
            danger
            onClick={() => navigateTo('DeleteAccount')}
          />
        </Card>

        {/* App Version */}
        <View style={styles.appVersionContainer}>
          <Text style={styles.appVersionText}>HairConnekt v1.0.0</Text>
          {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
          {/* <Pressable
            onPress={() => navigateTo('About')}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, styles.aboutButton]}
          >
            <Text style={styles.aboutButtonText}>{t('screens.profile.menu.about')}</Text>
          </Pressable> */}
        </View>
      </ScrollView>
      {/* Logout confirmation (web) */}
      <AlertModal
        isVisible={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title={t('screens.profile.logoutConfirmTitle') || 'Abmelden'}
        description={t('screens.profile.logoutConfirmText') || 'Möchtest du dich wirklich abmelden?'}
        buttons={[
          { title: t('screens.profile.logoutConfirmCancel') || 'Abbrechen', onPress: () => setShowLogoutDialog(false), variant: 'outline' },
          { title: t('screens.profile.logoutConfirmConfirm') || 'Abmelden', onPress: () => { setShowLogoutDialog(false); Promise.resolve(logout()); } },
        ]}
      />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  aboutButton: {
    marginTop: spacing.xs,
  },
  aboutButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  appVersionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  appVersionText: {
    color: colors.gray500,
    fontSize: typography.small.fontSize,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 96,
  },
  avatarImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  avatarInitials: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
  },
  avatarWrapper: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  badge: {
    backgroundColor: colors.gray200,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeSuccess: {
    backgroundColor: colors.green500,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeSuccessText: {
    color: colors.white,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  badgeText: {
    color: colors.gray700,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cameraButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
  },
  card: {
    marginTop: 0,
  },
  editProfileButton: {
    borderColor: colors.gray300,
    borderWidth: 1,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  header: {
    backgroundColor: colors.white,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerTitleBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  loadingName: {
    backgroundColor: colors.gray200,
    borderRadius: radii.sm,
    height: 24,
    marginBottom: spacing.xs,
    width: 160,
  },
  loadingStat: {
    backgroundColor: colors.gray200,
    borderRadius: radii.sm,
    height: 24,
    marginBottom: spacing.xs / 2,
    width: 40,
  },
  memberSinceText: {
    color: colors.gray500,
    fontSize: typography.small.fontSize,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    width: '100%',
  },
  menuItemIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuItemIconContainerDanger: {
    backgroundColor: colors.red200,
  },
  menuItemLabel: {
    fontSize: typography.body.fontSize,
  },
  menuItemLabelDanger: {
    color: colors.error,
  },
  menuItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menuItemRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  menuItemValue: {
    color: colors.gray500,
    fontSize: typography.small.fontSize,
  },
  profileInfoContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: spacing.sm,
    textAlign: 'center',
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  screenTitle: {
    color: colors.gray800,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: colors.gray100,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionHeaderText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  settingsBlock: {
    padding: spacing.md,
  },
  statDivider: {
    backgroundColor: colors.gray200,
    height: '60%',
    width: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  statNumber: {
    color: colors.primary,
    fontSize: FONT_SIZES.h4,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statValue: {
    justifyContent: 'center',
    minHeight: 28,
  },
  statsContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchRowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  userDetails: {
    alignItems: 'center',
  },
  userEmail: {
    color: colors.gray600,
    marginBottom: spacing.xs / 2,
  },
  userName: {
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  userPhone: {
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
});
