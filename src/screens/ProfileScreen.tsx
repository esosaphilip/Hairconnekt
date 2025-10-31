import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext'; // Use correct context path
import { http } from '@/api/http'; // Use shared axios instance
// NOTE: usersApi.uploadAvatar is a web-specific implementation (DOM file input)
// In a real RN app, you would use a library like 'react-native-image-picker'.
import { usersApi } from '@/services/users'; // We'll mock the RN-friendly version
import {
  User,
  MapPin,
  Heart,
  Star,
  Calendar,
  CreditCard,
  Gift,
  Receipt,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  Camera,
  Settings,
} from 'lucide-react-native'; // Replacing 'lucide-react'
import * as ImagePicker from 'expo-image-picker'; // Use Expo for image picking

// Custom Components (assumed to be available)
import Text from '../components/Text';
import Button from '../components/Button'; // Custom Button component
import Card from '../components/Card'; // Custom Card/Container component
import Separator from '../components/separator'; // Custom Separator/Divider
import Switch from '../components/switch'; // Custom Switch component
import { spacing } from '../theme/tokens'; // Assuming a common theme spacing object

// --- Type Definition (can be kept as is) ---
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
  memberSince: string; // ISO date
  verified: { email: boolean; phone: boolean };
  addressesCount: number;
  clientProfile?: any;
  stats: {
    appointments: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    favorites: number;
    reviews: number;
  };
};

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const SUCCESS_COLOR = '#10B981'; // equivalent to Tailwind's bg-green-500

// --- Utility Components Refactored for RN ---

/**
 * RN equivalent for the MenuItem component.
 * Uses Pressable for interaction and StyleSheet for styling.
 */
const MenuItem = ({ icon: Icon, label, value, badge, onClick, danger = false }: any) => (
  <Pressable
    onPress={onClick}
    style={({ pressed }) => [
      styles.menuItem,
      { backgroundColor: pressed ? '#F9FAFB' : '#fff' }, // Mimics hover:bg-gray-50
    ]}
  >
    <View style={styles.menuItemLeft}>
      <View
        style={[
          styles.menuItemIconContainer,
          { backgroundColor: danger ? '#FEE2E2' : '#F3F4F6' }, // bg-red-50 : bg-gray-100
        ]}
      >
        <Icon size={20} color={danger ? '#DC2626' : '#4B5563'} /> {/* text-red-600 : text-gray-600 */}
      </View>
      <Text style={danger ? { color: '#DC2626', fontSize: 16 } : { fontSize: 16 }}>
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
      <ChevronRight size={20} color="#9CA3AF" /> {/* text-gray-400 */}
    </View>
  </Pressable>
);

/**
 * RN equivalent for SectionHeader.
 * Replaces div with View and p with Text, using native styles.
 */
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

// --- Main ProfileScreen Component ---

export function ProfileScreen() {
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);

  const navigation = useNavigation();
  const { logout, user } = useAuth();

  // Helper function to navigate to a screen
  const navigateTo = (screen: string) => {
    // @ts-ignore
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
      // NOTE: Using native JS date formatting as Intl is available in RN/JS engine
      return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(d);
    } catch {
      return '';
    }
  }, [me?.memberSince]);

  // --- Data Fetching Effect (Remains nearly identical) ---
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    http
      .get<MeResponse>('/users/me')
      .then((res) => {
        if (!isMounted) return;
        setMe(res.data); // Assuming API returns data property
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load profile:', err);
        const msg = (err as Error)?.message || 'Fehler beim Laden des Profils';
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
      Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Fotos, um ein Profilbild hochzuladen.');
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
      Alert.alert('Erfolg', 'Profilbild aktualisiert');

      setMe((prev) => (prev ? { ...prev, avatarUrl: res.url } : prev));
    } catch (err) {
      console.error('Avatar upload failed:', err);
      const msg = (err as Error)?.message || 'Upload fehlgeschlagen';
      Alert.alert('Fehler', msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Abmelden',
          onPress: () => {
            logout();
            // @ts-ignore - Navigate to the root of the stack, often 'Welcome' or similar
            navigation.popToTop();
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
            <Text style={styles.screenTitle}>Profil</Text>
            <Pressable
              onPress={() => navigateTo('Settings')}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Settings size={24} color="#4B5563" />
            </Pressable>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfoContainer}>
            <View style={styles.avatarWrapper}>
              {/* Avatar Component equivalent */}
              <View style={styles.avatar}>
                {me?.avatarUrl ? (
                  // Use a simple View/Image for Avatar replacement
                  <Image source={{ uri: me.avatarUrl }} style={styles.avatarImage} />
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
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={16} color="#fff" />
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
                  <Text style={styles.badgeSuccessText}>✓ E-Mail verifiziert</Text>
                </View>
              )}
              {me?.verified?.phone && (
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>✓ Telefon verifiziert</Text>
                </View>
              )}
            </View>

            {/* Member Since */}
            <Text style={styles.memberSinceText}>
              {me?.memberSince ? `Mitglied seit ${formattedMemberSince}` : ''}
            </Text>

            <Button
              title="Profil bearbeiten"
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
            <Text style={styles.statLabel}>Termine</Text>
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
            <Text style={styles.statLabel}>Favoriten</Text>
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
            <Text style={styles.statLabel}>Bewertungen</Text>
          </View>
        </View>

        {/* Mein Profil Section */}
        <SectionHeader title="Mein Profil" />
        <Card style={styles.card}>
          <MenuItem icon={Bell} label="Benachrichtigungen" onClick={() => navigateTo('Notifications')} />
          <Separator />
          <MenuItem icon={User} label="Persönliche Informationen" onClick={() => navigateTo('PersonalInfo')} />
          <Separator />
          <MenuItem
            icon={MapPin}
            label="Meine Adressen"
            badge={me?.addressesCount ?? 0}
            onClick={() => navigateTo('Addresses')}
          />
          <Separator />
          <MenuItem
            icon={User}
            label="Haartyp & Präferenzen"
            onClick={() => navigateTo('HairPreferences')}
          />
        </Card>

        {/* Meine Aktivitäten Section */}
        <SectionHeader title="Meine Aktivitäten" />
        <Card style={styles.card}>
          <MenuItem
            icon={Heart}
            label="Favoriten"
            badge={me?.stats?.favorites ?? 0}
            onClick={() => navigateTo('Favorites')}
          />
          <Separator />
          <MenuItem
            icon={Star}
            label="Meine Bewertungen"
            badge={me?.stats?.reviews ?? 0}
            onClick={() => navigateTo('MyReviews')}
          />
          <Separator />
          <MenuItem icon={Calendar} label="Buchungshistorie" onClick={() => navigateTo('BookingHistory')} />
        </Card>

        {/* Zahlungen Section */}
        <SectionHeader title="Zahlungen" />
        <Card style={styles.card}>
          <MenuItem icon={CreditCard} label="Zahlungsmethoden" onClick={() => navigateTo('PaymentMethods')} />
          <Separator />
          <MenuItem icon={Gift} label="Gutscheine & Rabatte" badge={0} onClick={() => navigateTo('Vouchers')} />
          <Separator />
          <MenuItem icon={Receipt} label="Transaktionshistorie" onClick={() => navigateTo('Transactions')} />
        </Card>

        {/* Einstellungen Section */}
        <SectionHeader title="Einstellungen" />
        <Card style={styles.card}>
          <View style={styles.settingsBlock}>
            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={styles.menuItemIconContainer}>
                  <Bell size={20} color="#4B5563" />
                </View>
                <Text style={{ fontSize: 16 }}>Push-Benachrichtigungen</Text>
              </View>
              <Switch
                value={notifications.push}
                onValueChange={(checked: boolean) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </View>
            <Separator style={{ marginVertical: spacing.sm }} />

            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={styles.menuItemIconContainer}>
                  <Bell size={20} color="#4B5563" />
                </View>
                <Text style={{ fontSize: 16 }}>E-Mail-Benachrichtigungen</Text>
              </View>
              <Switch
                value={notifications.email}
                onValueChange={(checked: boolean) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </View>
            <Separator style={{ marginVertical: spacing.sm }} />

            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={styles.menuItemIconContainer}>
                  <Bell size={20} color="#4B5563" />
                </View>
                <Text style={{ fontSize: 16 }}>SMS-Benachrichtigungen</Text>
              </View>
              <Switch
                value={notifications.sms}
                onValueChange={(checked: boolean) =>
                  setNotifications({ ...notifications, sms: checked })
                }
              />
            </View>
          </View>
          <Separator />
          <MenuItem
            icon={Globe}
            label="Sprache"
            value="Deutsch"
            onClick={() => navigateTo('Language')}
          />
          <Separator />
          <MenuItem
            icon={Shield}
            label="Datenschutz & Sicherheit"
            onClick={() => navigateTo('Privacy')}
          />
          <Separator />
          <MenuItem icon={HelpCircle} label="Hilfe & Support" onClick={() => navigateTo('Support')} />
        </Card>

        {/* Rechtliches Section */}
        <SectionHeader title="Rechtliches" />
        <Card style={styles.card}>
          <MenuItem
            icon={FileText}
            label="Allgemeine Geschäftsbedingungen"
            onClick={() => navigateTo('Terms')}
          />
          <Separator />
          <MenuItem
            icon={FileText}
            label="Datenschutzerklärung"
            onClick={() => navigateTo('PrivacyPolicy')}
          />
          <Separator />
          <MenuItem icon={FileText} label="Impressum" onClick={() => navigateTo('Imprint')} />
        </Card>

        {/* Account Actions */}
        <SectionHeader title="Account" />
        <Card style={styles.card}>
          <MenuItem icon={LogOut} label="Abmelden" danger onClick={handleLogout} />
          <Separator />
          <MenuItem
            icon={Trash2}
            label="Account löschen"
            danger
            onClick={() => navigateTo('DeleteAccount')}
          />
        </Card>

        {/* App Version */}
        <View style={styles.appVersionContainer}>
          <Text style={styles.appVersionText}>HairConnekt v1.0.0</Text>
          <Pressable
            onPress={() => navigateTo('About')}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, styles.aboutButton]}
          >
            <Text style={styles.aboutButtonText}>Über HairConnekt</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// NOTE: RN requires Image to be imported for use. Assuming it's imported at the top.
const Image = require('react-native').Image;

// --- Stylesheet for RN ---
// Cast styles to any to temporarily allow web-only properties like `gap` without TypeScript errors.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937', // Assuming h2/default text color
  },
  profileInfoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitials: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  loadingName: {
    width: 160,
    height: 24,
    backgroundColor: '#E5E7EB', // bg-gray-200
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  userEmail: {
    color: '#4B5563', // text-gray-600
    marginBottom: spacing.xs / 2,
  },
  userPhone: {
    color: '#4B5563', // text-gray-600
    marginBottom: spacing.sm,
  },
  badgesContainer: {
    flexDirection: 'row',
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeSuccess: {
    backgroundColor: SUCCESS_COLOR, // bg-green-500
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeSuccessText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  memberSinceText: {
    fontSize: 14,
    color: '#6B7280', // text-gray-500
  },
  editProfileButton: {
    marginTop: spacing.md,
    // Add specific styles if 'Button' component doesn't handle 'variant="outline"'
    borderColor: '#D1D5DB', // default border for outline
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },

  // Stats
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.xs, // mt-2
    marginHorizontal: spacing.md,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    minHeight: 28, // To match the text height for loading
    justifyContent: 'center',
  },
  loadingStat: {
    width: 40,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: spacing.xs / 2,
  },
  statNumber: {
    fontSize: 20,
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#4B5563', // text-gray-600
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F3F4F6', // bg-gray-100
    marginTop: spacing.md,
  },
  sectionHeaderText: {
    fontSize: 12,
    color: '#4B5563', // text-gray-600
    textTransform: 'uppercase',
    letterSpacing: 1, // tracking-wider
    fontWeight: '600',
  },
  card: {
    marginTop: 0,
    // Assuming Card component provides basic container styling
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    width: '100%',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.sm, // gap-3
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.xs, // gap-2
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6', // bg-gray-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#6B7280', // text-gray-500
  },
  badge: {
    backgroundColor: '#E5E7EB', // Badge variant="secondary"
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },

  // Settings Switch Block
  settingsBlock: {
    padding: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Footer
  appVersionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  appVersionText: {
    fontSize: 14,
    color: '#6B7280', // text-gray-500
  },
  aboutButton: {
    marginTop: spacing.xs,
  },
  aboutButtonText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
}) as any;