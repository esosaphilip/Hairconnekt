import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext'; // Use shared auth context
import { http } from '../../api/http';
import { getProviderAppointments } from '../../api/appointments';
import { PLATFORM_FEE_RATE } from '../../api/payments';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import Avatar, { AvatarImage, AvatarFallback } from '../../components/avatar';
import Icon from '../../components/Icon';
import { checkAndReloadUpdates } from '@/services/updates';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import AlertModal from '@/components/AlertModal';

// --- Menu Data (Icons adapted to string names for the custom Icon component) ---
const menuSections = [
  {
    title: "Business Management",
    items: [
      {
        icon: "user",
        label: "Mein Profil",
        path: "ProviderProfileScreen",
        badge: null,
      },
      {
        icon: "eye",
        label: "Öffentliches Profil anzeigen",
        path: "ProviderPublicProfileScreen",
        badge: null,
      },
      {
        icon: "dollar-sign",
        label: "Services & Preise",
        path: "ProviderServicesScreen",
        badge: "12",
      },
      {
        icon: "camera",
        label: "Portfolio verwalten",
        path: "ProviderPortfolioScreen",
        badge: "42",
      },
    ],
  },
  {
    title: "Finanzen",
    items: [
      {
        icon: "dollar-sign",
        label: "Einnahmen & Auszahlungen",
        path: "TransactionsScreen",
        badge: null,
      },
      {
        icon: "bar-chart",
        label: "Statistiken & Berichte",
        path: "ProviderAnalyticsScreen",
        badge: null,
      },
      {
        icon: "gift",
        label: "Gutscheine & Angebote",
        path: "ProviderVouchersScreen",
        badge: "3",
      },
      {
        icon: "credit-card",
        label: "Abonnement & Gebühren",
        path: "ProviderSubscriptionScreen",
        badge: "Pro",
      },
    ],
  },
  {
    title: "Feedback",
    items: [
      {
        icon: "star",
        label: "Bewertungen",
        path: "ProviderReviewsScreen",
        badge: "4.8 ★",
      },
    ],
  },
  {
    title: "Einstellungen",
    items: [
      {
        icon: "settings",
        label: "Einstellungen",
        path: "ProviderSettingsScreen",
        badge: null,
      },
      {
        icon: "help-circle",
        label: "Hilfe & Support",
        path: "ProviderHelpScreen",
        badge: null,
      },
    ],
  },
];

// --- Helper Component for Menu Item (Replaces Web Button + Div Structure) ---
type MenuItemData = { icon: string; label: string; path: string; badge?: string | null };
const MenuItem: React.FC<{ item: MenuItemData; onPress: (path: string) => void }> = ({ item, onPress }) => (
  <TouchableOpacity
    key={item.label}
    onPress={() => onPress(item.path)}
    style={styles.menuItem}
    activeOpacity={0.7}
  >
    <View style={styles.menuIconCircle}>
      <Icon name={item.icon} size={20} color={COLORS.textSecondary} />
    </View>
    <Text style={styles.menuLabel}>{item.label}</Text>
    {item.badge && (
      <Badge title={item.badge} variant="secondary" />
    )}
    <Icon name="chevron-right" size={20} color={COLORS.border} />
  </TouchableOpacity>
);

// --- Main Component ---
export function ProviderMore() {
  const navigation = useNavigation() as { navigate: (routeName: string, params?: Record<string, unknown>) => void; goBack: () => void };
  const { logout, user } = useAuth();
  type ProviderProfileSummary = {
    businessName?: string | null;
    isVerified?: boolean;
    acceptsSameDayBooking?: boolean;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      profilePictureUrl?: string | null;
    };
  };
  const [profile, setProfile] = useState<ProviderProfileSummary | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [earningsBadge, setEarningsBadge] = useState<string | null>(null);
  const [earningsError, setEarningsError] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
      let isActive = true;

      const loadProfile = async () => {
        setLoadingProfile(true);
        setProfileError(null);
        try {
          const res = await http.get('/providers/me');
          if (isActive) setProfile(res?.data ?? null);
        } catch (err: any) {
          const status = err?.response?.status;
          let msg = err?.response?.data?.message || err?.message || 'Profil konnte nicht geladen werden';
          if (status === 500) {
            msg = 'Profil derzeit nicht verfügbar';
          }
          if (isActive) setProfileError(msg);
        } finally {
          if (isActive) setLoadingProfile(false);
        }
      };

      const loadEarnings = async () => {
        setEarningsError(null);
        try {
          const now = Date.now();
          const sinceTs = now - 30 * 24 * 60 * 60 * 1000;
          const res = await getProviderAppointments('completed');
          if (!isActive) return;

          const items = res?.items || [];
          const total = items.reduce((sum, a) => {
            const d = new Date((a.appointmentDate || '').trim() + 'T' + ((a.startTime || '').trim() || '00:00:00'));
            const ts = d.getTime();
            if (Number.isNaN(ts) || ts < sinceTs) return sum;
            const gross = (a.totalPriceCents || 0) / 100;
            const fee = Math.round(gross * PLATFORM_FEE_RATE * 100) / 100;
            const net = Math.round((gross - fee) * 100) / 100;
            return sum + net;
          }, 0);
          const formatted = `€${total.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
          setEarningsBadge(formatted);
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || 'Einnahmen konnten nicht geladen werden';
          if (isActive) setEarningsError(msg);
        }
      };

      loadProfile();
      loadEarnings();

      return () => { isActive = false; };
    }, [])
  );

  const handleLogout = () => {
    // Use platform-aware confirmation: modal on web, Alert on native
    if (Platform.OS === 'web') {
      setShowLogoutDialog(true);
      return;
    }
    Alert.alert(
      "Abmelden",
      "Möchtest du dich wirklich abmelden?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Abmelden",
          onPress: () => {
            // Perform real logout: clear tokens and auth bundle
            Promise.resolve(logout());
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleCheckUpdates = async () => {
    const res = await checkAndReloadUpdates();
    if (Platform.OS === 'web') {
      Alert.alert('Aktualisierung', String(res.message));
    } else {
      Alert.alert('Aktualisierung', String(res.message));
    }
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingProfile && (
          <View style={{ padding: SPACING.md }}>
            <Text style={{ color: COLORS.textSecondary }}>Profil wird geladen…</Text>
          </View>
        )}
        {!!profileError && (
          <View style={{ padding: SPACING.md }}>
            <Text style={{ color: COLORS.danger }}>{profileError}</Text>
          </View>
        )}
        {/* Header with Profile */}
        <View style={styles.profileHeader}>
          <Text style={styles.screenTitle}>Mehr</Text>

          {/* Profile Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ProviderProfileScreen")}
            activeOpacity={0.8}
          >
            <Card style={styles.profileCard}>
              <View style={styles.profileSummary}>
                <Avatar size={64}>
                  <AvatarImage
                    size={64}
                    uri={(() => {
                      const url = getAvatarUrl(user, profile);
                      return url ? `${url}${url.includes('?') ? '&' : '?'}t=${avatarVersion}` : undefined;
                    })()}
                  />
                  <AvatarFallback
                    size={64}
                    label={[user?.firstName, user?.lastName].filter(Boolean).join(' ') || profile?.user?.firstName || 'User'}
                  />
                  <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 32, borderWidth: 1, borderColor: '#eee' }} />
                </Avatar>
                {/* NEW: Camera overlay or just make the whole area clickable? 
                    The user requested "upload picture from my phone". 
                    We can make the avatar clickable to go to upload screen.
                 */}
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={() => navigation.navigate("ProviderPhotoUploadScreen")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="camera" size={14} color={COLORS.white} />
                </TouchableOpacity>

                <View style={styles.profileTextContainer}>
                  <Text style={styles.profileName}>{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || profile?.user?.firstName || 'Profil'}</Text>
                  <Text style={styles.profileStudio}>{profile?.businessName || 'Studio'}</Text>
                  <View style={styles.profileBadgeRow}>
                    {profile?.isVerified ? <Badge title="Verifiziert" variant="outline" /> : null}
                    {profile?.acceptsSameDayBooking ? <Badge title="Same-Day" variant="outline" /> : null}
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.border} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSectionsContainer}>
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {section.title}
              </Text>
              <Card style={styles.cardContainer}>
                {section.items.map((item, itemIndex) => {
                  const displayItem =
                    item.label === 'Einnahmen & Auszahlungen'
                      ? { ...item, badge: earningsBadge ?? item.badge }
                      : item;
                  return (
                    <React.Fragment key={itemIndex}>
                      <MenuItem
                        item={displayItem}
                        onPress={(path) => {
                          if (path === 'ProviderPublicProfileScreen' && profile?.id) {
                            navigation.navigate(path, { id: profile.id });
                          } else {
                            navigation.navigate(path);
                          }
                        }}
                      />
                      {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  );
                })}
              </Card>
            </View>
          ))}

          {/* Earnings error */}
          {!!earningsError && (
            <Card style={{ padding: SPACING.md }}>
              <Text style={{ color: COLORS.danger }}>{earningsError}</Text>
            </Card>
          )}

          {/* Logout */}
          <Card style={styles.logoutCard}>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <View style={styles.logoutIconCircle}>
                <Icon name="log-out" size={20} color={COLORS.danger} />
              </View>
              <Text style={styles.logoutLabel}>Abmelden</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>HairConnekt Provider v1.0.0</Text>
          <Text style={styles.versionText}>© 2025 HairConnekt GmbH</Text>
          <TouchableOpacity onPress={handleCheckUpdates} style={styles.updateButton} activeOpacity={0.8}>
            <View style={styles.updateIconCircle}>
              <Icon name="refresh-cw" size={18} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.updateLabel}>App aktualisieren</Text>
          </TouchableOpacity>
        </View>
        {/* Logout confirmation (web) */}
        <AlertModal
          isVisible={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
          title={'Abmelden'}
          description={'Möchtest du dich wirklich abmelden?'}
          buttons={[
            { title: 'Abbrechen', onPress: () => setShowLogoutDialog(false), variant: 'outline' },
            { title: 'Abmelden', onPress: () => { setShowLogoutDialog(false); Promise.resolve(logout()); } },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function getAvatarUrl(user: unknown, profile: unknown): string {
  const u = (user ?? null) as Record<string, unknown> | null;
  const p = (profile ?? null) as { user?: Record<string, unknown> } | null;

  // Changed priority: Profile (fresh) > User (cached) > ImageUrl fallback
  const candidates = [
    p?.user && typeof p.user?.profilePictureUrl === 'string' ? (p.user.profilePictureUrl as string) : undefined,
    u && typeof u.profilePictureUrl === 'string' ? (u.profilePictureUrl as string) : undefined,
    u && typeof u.imageUrl === 'string' ? (u.imageUrl as string) : undefined,
  ].filter((v): v is string => typeof v === 'string');
  return candidates[0] || '';
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    backgroundColor: COLORS.background || '#F9FAFB',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  // --- Profile Header Styles ---
  profileHeader: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomColor: COLORS.border || '#E5E7EB',
    borderBottomWidth: 1,
    paddingBottom: SPACING.md || 16,
    paddingHorizontal: SPACING.md || 16,
    paddingTop: SPACING.md || 16,
  },
  screenTitle: {
    fontSize: FONT_SIZES.h3 || 20,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  profileCard: {
    padding: SPACING.md,
  },
  profileSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm || 8,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
  },
  profileStudio: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary || '#000',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  // --- Menu Sections Styles ---
  menuSectionsContainer: {
    gap: SPACING.lg || 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  section: {
    // Container for title + card
  },
  sectionTitle: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  divider: {
    backgroundColor: COLORS.border || '#E5E7EB',
    height: 1,
    marginLeft: 50 + SPACING.sm * 2, // Indent past the icon circle + spacing
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm || 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border || '#F3F4F6', // gray-100
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuLabel: {
    color: COLORS.text || '#1F2937',
    flex: 1,
    fontSize: FONT_SIZES.body || 14,
  },
  // --- Logout Styles ---
  logoutCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  logoutButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm || 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  logoutIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger + '10' || '#fee2e2', // red-50
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoutLabel: {
    color: COLORS.danger || '#EF4444',
    flex: 1,
    fontSize: FONT_SIZES.body || 14, // red-600
  },
  // --- Version Info ---
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  versionText: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
  },
  updateButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  updateIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateLabel: {
    color: COLORS.text || '#1F2937',
    fontSize: FONT_SIZES.body || 14,
  },
});
