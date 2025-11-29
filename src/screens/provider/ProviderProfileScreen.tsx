import React from 'react';
import { View, Pressable, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Badge } from '../../components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/avatar';
import { colors, spacing, radii, typography } from '../../theme/tokens';
import { http } from '../../api/http';
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
  const navigation = useNavigation() as { navigate: (routeName: string, params?: Record<string, unknown>) => void; goBack: () => void };
  type Dashboard = { todayAppointments?: unknown[]; stats?: { reviewCount?: number; ratingAverage?: number } };
  type PublicData = { rating?: number; reviews?: number; specialties?: string[] };
  const [profile, setProfile] = React.useState<any>(null);
  const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
  const [publicData, setPublicData] = React.useState<PublicData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Ensure we have a token; http interceptor will attach it
        if (!tokens?.accessToken) {
          throw new Error('Nicht authentifiziert');
        }
        let me = null;
        try {
          const meRes = await http.get('/providers/me');
          me = meRes.data;
          if (!mounted) return;
          setProfile(me);
        } catch (e: any) {
          // Suppress the red error banner for "Provider profile not found" (404)
          const status = e?.response?.status;
          const msg = e?.response?.data?.message || e?.message || '';
          const isNotFound = status === 404 && typeof msg === 'string' && msg.toLowerCase().includes('provider profile not found');
          if (!isNotFound) {
            if (mounted) setError(e?.response?.data?.message || e?.message || 'Fehler beim Laden des Profils');
          }
          // If not found, we keep placeholders and continue without breaking the screen.
        }

        // Only load dashboard and public info if we have a provider profile id
        if (me?.id) {
          const [dashRes, pubRes] = await Promise.all([
            http.get('/providers/dashboard'),
            http.get(`/providers/public/${me.id}`),
          ]);
          if (!mounted) return;
          setDashboard(dashRes.data);
          setPublicData(pubRes.data);
        }
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Fehler beim Laden des Profils';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [tokens?.accessToken]);

  const onBack = () => {
    try {
      navigation.goBack();
    } catch {}
    if (Platform.OS === 'web') {
      try {
        window.history.back();
      } catch {}
    }
  };

  const onEdit = () => {
    // Navigate to the real EditProfileScreen
    try {
      navigation.navigate('EditProfileScreen');
    } catch (e) {
      console.log('Navigation to EditProfileScreen failed', e);
    }
  };

  const onOpenPublicProfile = () => {
    // Placeholder for navigation
    console.log('Navigate to /provider/more/public-profile (placeholder)');
    if (Platform.OS === 'web') {
      try {
        const id = profile?.id;
        window.location.hash = id ? `/provider/more/public-profile?id=${id}` : '/provider/more/public-profile';
      } catch {}
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
<Pressable style={styles.cameraBtn} onPress={onEdit} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
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
          <View style={[styles.sectionHeader]}> 
            <Text style={styles.sectionTitle}>Über mich</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <Text style={{ fontSize: 14, color: colors.gray700 }}>
            {profile?.bio || 'Profilbeschreibung ist noch nicht hinterlegt.'}
          </Text>
        </Card>

        {/* Specialties */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spezialisierungen</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View style={styles.badgeWrap}>
            {(Array.isArray(publicData?.specialties) && publicData.specialties.length > 0) ? (
              publicData.specialties.slice(0, 6).map((s, idx) => (
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
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View style={styles.badgeWrap}>
            {/* Placeholder until languages are part of the profile schema */}
            <Badge variant="outline" style={styles.badgeItem}>Deutsch</Badge>
            <Badge variant="outline" style={styles.badgeItem}>Englisch</Badge>
          </View>
        </Card>

        {/* Social Media */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View>
            <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
              <Ionicons name="globe-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>—</Text>
            </View>
            <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
              <Ionicons name="logo-instagram" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>—</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="logo-facebook" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>—</Text>
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
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View>
            <View style={{ marginBottom: spacing.sm }}>
              <Text style={{ fontWeight: '600' }}>—</Text>
              <Text style={{ color: colors.gray600 }}>—</Text>
            </View>
            <View>
              <Text style={{ fontWeight: '600' }}>—</Text>
              <Text style={{ color: colors.gray600 }}>—</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    padding: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
      default: {},
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.sm,
    color: colors.black,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 2,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray600,
  },
});
