import React from 'react';
import { View, Pressable, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Badge } from '../../components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/avatar';
import { colors, spacing, typography } from '../../theme/tokens';
import { http } from '../../api/http';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';

/**
 * @typedef {Object} ProviderUser
 * @property {string} id
 * @property {string|null=} email
 * @property {string|null=} phone
 * @property {string|null=} firstName
 * @property {string|null=} lastName
 * @property {string|null=} profilePictureUrl
 */
/**
 * @typedef {Object} ProviderProfile
 * @property {string} id
 * @property {string|null} businessName
 * @property {string|null=} businessType
 * @property {string|null=} bio
 * @property {number|null=} yearsOfExperience
 * @property {string|null=} coverPhotoUrl
 * @property {boolean} isVerified
 * @property {boolean=} isMobileService
 * @property {number|null=} serviceRadiusKm
 * @property {boolean=} acceptsSameDayBooking
 * @property {number|null=} advanceBookingDays
 * @property {string|null=} cancellationPolicy
 * @property {string=} createdAt
 * @property {string=} updatedAt
 * @property {ProviderUser=} user
 * @property {Array<{weekday: string, start: string, end: string}>=} availability
 */
/**
 * @typedef {Object} ProviderDashboard
 * @property {{
 *   todayCount: number,
 *   nextAppointment: ({ time: string, client: string, hoursUntil: number }|null),
 *   weekEarningsCents: number,
 *   ratingAverage: number,
 *   reviewCount: number,
 * }} stats
 * @property {Array<any>} todayAppointments
 * @property {Array<any>} recentReviews
 */
/**
 * @typedef {Object} ProviderPublic
 * @property {string} id
 * @property {string} name
 * @property {string|null} business
 * @property {boolean} verified
 * @property {string|null} imageUrl
 * @property {number} rating
 * @property {number} reviews
 * @property {string[]} specialties
 * @property {number|null} priceFromCents
 * @property {ProviderProfile} profile
 */

export function ProviderProfileScreen() {
  const { tokens } = useAuth();
  const navigation = useNavigation<any>();
  type Dashboard = { todayAppointments?: unknown[]; stats?: { reviewCount?: number; ratingAverage?: number } };
  type PublicData = { rating?: number; reviews?: number; specialties?: string[] };
  type ProviderUser = {
    id: string;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profilePictureUrl?: string | null;
  };
  type ProviderProfile = {
    id: string;
    businessName: string | null;
    bio?: string | null;
    coverPhotoUrl?: string | null;
    isVerified: boolean;
    acceptsSameDayBooking?: boolean;
    createdAt?: string;
    user?: ProviderUser;
    specializations?: string[];
    languages?: string[];
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      website?: string;
    };
    certifications?: Array<{
      id: string;
      title: string;
      institution: string;
      year: string;
    }>;
  };
  const [profile, setProfile] = React.useState<ProviderProfile | null>(null);
  const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
  const [publicData, setPublicData] = React.useState<PublicData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  function getMessage(err: unknown, fallback = 'Fehler beim Laden des Profils'): string {
    if (typeof err === 'string') return err;
    if (typeof err === 'object' && err) {
      const e = err as { message?: string; response?: { data?: { message?: string } } };
      return e.response?.data?.message ?? e.message ?? fallback;
    }
    return fallback;
  }

  function getStatus(err: unknown): number | undefined {
    if (typeof err === 'object' && err) {
      const e = err as { response?: { status?: number } };
      return e.response?.status;
    }
    return undefined;
  }

  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prev => prev + 1);
      return () => { };
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      async function load() {
        try {

          setLoading(true);
          setError(null);

          if (!tokens?.accessToken) {
            throw new Error('Nicht authentifiziert');
          }
          let me = null;
          try {
            const meRes = await http.get('/providers/me');
            me = meRes.data;
            if (!mounted) return;
            setProfile(me);
          } catch (e: unknown) {
            const status = getStatus(e);
            const msg = getMessage(e, '');
            const isNotFound = status === 404 && typeof msg === 'string' && msg.toLowerCase().includes('provider profile not found');
            if (!isNotFound) {
              if (mounted) setError(getMessage(e));
            }
          }

          if (me?.id) {
            const [dashRes, pubRes] = await Promise.all([
              http.get('/providers/dashboard'),
              http.get(`/providers/public/${me.id}`),
            ]);
            if (!mounted) return;

            // Unwrap dashboard data
            const dashPayload = dashRes.data;
            const dashData = (dashPayload?.success && dashPayload?.data) ? dashPayload.data : dashPayload;
            setDashboard(dashData);

            // Unwrap public profile data
            const pubPayload = pubRes.data;
            const pubData = (pubPayload?.success && pubPayload?.data) ? pubPayload.data : pubPayload;
            setPublicData(pubData);
          }
        } catch (e: unknown) {
          const msg = getMessage(e);
          if (mounted) setError(msg);
        } finally {
          if (mounted) setLoading(false);
        }
      }
      load();

      return () => {
        mounted = false;
      };
    }, [tokens?.accessToken, refreshKey])
  );

  const onBack = () => {
    try {
      navigation.goBack();
    } catch { }
    if (Platform.OS === 'web') {
      try {
        window.history.back();
      } catch { }
    }
  };

  const onEdit = () => {
    // Navigate to the real EditProfileScreen (Basic Info)
    try {
      navigation.navigate('EditProfileScreen');
    } catch (e) {

    }
  };

  const onEditAboutMe = () => {

    navigation.navigate('EditAboutMeScreen');
  };
  const onEditSpecializations = () => {

    navigation.navigate('EditSpecializationsScreen');
  };
  const onEditLanguages = () => {

    navigation.navigate('EditLanguagesScreen');
  };
  const onEditSocialMedia = () => {

    navigation.navigate('EditSocialMediaScreen');
  };
  const onEditPhoto = () => {
    // Navigate to dedicated photo screen

    // @ts-ignore - Route is definitely registered in App.tsx
    navigation.navigate('ProviderPhotoUploadScreen');
  };

  const onEditCertifications = () => {

    navigation.navigate('EditCertificationsScreen');
  };

  const onOpenPublicProfile = () => {
    if (profile?.id) {
      // Navigate to the public profile screen with the provider ID
      navigation.navigate('ProviderPublicProfileScreen', { id: profile.id });
    }

    if (Platform.OS === 'web') {
      try {
        const id = profile?.id;
        window.location.hash = id ? `/provider/more/public-profile?id=${id}` : '/provider/more/public-profile';
      } catch { }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} style={styles.iconBtn} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
            <Ionicons name="chevron-back" size={24} color={colors.gray700} />
          </Pressable>
          <Text style={[typography.h3, styles.headerTitle]}>Mein Profil</Text>
          <Pressable onPress={onEdit} style={styles.iconBtn} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
            <Ionicons name="pencil-outline" size={20} color={colors.gray700} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && (
          <View style={{ padding: spacing.md }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        {!!error && (
          <Card style={{ padding: spacing.md, marginBottom: spacing.md, borderColor: colors.error, borderWidth: 1 }}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </Card>
        )}
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.centered}>
            <View style={{ position: 'relative', marginBottom: spacing.md }}>
              <Avatar size={96}>
                <AvatarImage uri={(profile?.user?.profilePictureUrl || profile?.coverPhotoUrl) ?? undefined} />
                <AvatarFallback label="AM" />
              </Avatar>
              <Pressable style={styles.cameraBtn} onPress={onEditPhoto} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
                <Ionicons name="camera-outline" size={16} color={colors.white} />
              </Pressable>
            </View>
            <Text style={[typography.h3, { marginBottom: 4 }]}>
              {[
                profile?.user?.firstName,
                profile?.user?.lastName,
              ].filter(Boolean).join(' ') || 'Mein Name'}
            </Text>
            <Text style={{ color: colors.gray600, marginBottom: spacing.sm }}>
              {profile?.businessName || 'Mein Studio'}
            </Text>

            <View style={[styles.row, { marginBottom: spacing.sm }]}>
              <Badge style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}>Pro</Badge>
              <View style={{ width: spacing.sm }} />
              {profile?.isVerified && (
                <Badge variant="outline">Verifiziert</Badge>
              )}
              <View style={{ width: spacing.sm }} />
              {(profile?.acceptsSameDayBooking ?? false) && (
                <Badge variant="outline" style={{ borderColor: '#16A34A' }} textStyle={{ color: '#16A34A' }}>Geöffnet</Badge>
              )}
            </View>

            <View style={[styles.row, { marginBottom: 4 }]}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={{ marginLeft: 4 }}>
                {publicData?.rating != null ? publicData.rating.toFixed(1) : (dashboard?.stats?.ratingAverage ?? 0).toFixed(1)}
                {' '}({publicData?.reviews ?? dashboard?.stats?.reviewCount ?? 0} Bewertungen)
              </Text>
            </View>
            <Text style={{ color: colors.gray600, fontSize: 12 }}>
              {(() => {
                const created = profile?.createdAt ? new Date(profile.createdAt) : null;
                const seit = created ? created.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : '—';
                const apptCount = dashboard?.todayAppointments?.length;
                const apptText = typeof apptCount === 'number' ? `${apptCount} Termine heute` : '—';
                return `Mitglied seit ${seit} · ${apptText}`;
              })()}
            </Text>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>{/* Address not yet available in API */}Adresse nicht hinterlegt</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>{profile?.user?.phone || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>{profile?.user?.email || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>Öffnungszeiten nicht hinterlegt</Text>
            </View>
          </View>

          <Button
            onPress={onOpenPublicProfile}
            variant="secondary"
            title="Öffentliches Profil anzeigen"
            style={{ marginTop: spacing.md, backgroundColor: colors.primary }}
          />
        </Card>

        {/* Bio Section */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Über mich</Text>
            <TouchableOpacity onPress={onEditAboutMe} style={styles.iconBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14, color: colors.gray700 }}>
            {profile?.bio || 'Profilbeschreibung ist noch nicht hinterlegt.'}
          </Text>
        </Card>

        {/* Specialties */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spezialisierungen</Text>
            <TouchableOpacity onPress={onEditSpecializations} style={styles.iconBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </TouchableOpacity>
          </View>
          <View style={styles.badgeWrap}>
            {(Array.isArray(profile?.specializations) && profile!.specializations!.length > 0) ? (
              profile!.specializations!.map((s, idx) => (
                <Badge key={`${s}-${idx}`} variant="secondary" style={styles.badgeItem}>{s}</Badge>
              ))
            ) : (
              <Text style={{ color: colors.gray600 }}>Noch keine Spezialisierungen hinterlegt.</Text>
            )}
          </View>
        </Card>

        {/* Languages */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sprachen</Text>
            <TouchableOpacity onPress={onEditLanguages} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </TouchableOpacity>
          </View>
          <View style={styles.badgeWrap}>
            {(Array.isArray(profile?.languages) && profile!.languages!.length > 0) ? (
              profile!.languages!.map((lang, idx) => (
                <Badge key={`${lang}-${idx}`} variant="outline" style={styles.badgeItem}>{lang}</Badge>
              ))
            ) : (
              <Text style={{ color: colors.gray600 }}>Noch keine Sprachen hinterlegt.</Text>
            )}
          </View>
        </Card>

        {/* Social Media */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <TouchableOpacity onPress={onEditSocialMedia} style={styles.iconBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </TouchableOpacity>
          </View>
          <View>
            <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
              <Ionicons name="globe-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>{profile?.socialMedia?.website || '—'}</Text>
            </View>
            <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
              <Ionicons name="logo-instagram" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>{profile?.socialMedia?.instagram || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="logo-facebook" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>{profile?.socialMedia?.facebook || '—'}</Text>
            </View>
          </View>
        </Card>

        {/* Statistics */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Statistiken</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Array.isArray(dashboard?.todayAppointments) ? dashboard.todayAppointments.length : 0}</Text>
              <Text style={styles.statLabel}>Termine heute</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{typeof dashboard?.stats?.reviewCount === 'number' ? dashboard.stats.reviewCount : 0}</Text>
              <Text style={styles.statLabel}>Bewertungen</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Annahmerate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Ø Reaktionszeit</Text>
            </View>
          </View>
        </Card>

        {/* Certifications */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Zertifikate & Ausbildungen</Text>
            <Pressable onPress={onEditCertifications} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View>
            {Array.isArray(profile?.certifications) && profile!.certifications!.length > 0 ? (
              profile!.certifications!.map((cert) => (
                <View key={cert.id} style={{ marginBottom: spacing.sm }}>
                  <Text style={{ fontWeight: '600' }}>{cert.title}</Text>
                  <Text style={{ color: colors.gray600 }}>{cert.institution} • {cert.year}</Text>
                </View>
              ))
            ) : (
              <View>
                <Text style={{ color: colors.gray600 }}>Keine Zertifikate hinterlegt</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeItem: {
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cameraBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
      default: {},
    }),
  },
  centered: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    padding: spacing.sm,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoText: {
    color: colors.black,
    marginLeft: spacing.sm,
  },
  profileCard: {
    padding: spacing.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '600',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    width: '50%',
  },
  statLabel: {
    color: colors.gray600,
    fontSize: 12,
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
});
