import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Clipboard, // For Share/Copy link functionality
  ActivityIndicator,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation, useRoute, useFocusEffect, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProviderMoreStackParamList, RootStackParamList } from '@/navigation/types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { Badge } from '../../components/badge';
import Avatar, { AvatarImage, AvatarFallback } from '../../components/avatar';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { http } from '@/api/http';
import { BASE_URL } from '../../config';
import { addFavorite, removeFavorite, favoriteStatus } from '@/services/favorites';
import { useAuth } from '@/auth/AuthContext';

// --- Types for dynamic data ---
type PublicProfile = {
  id: string;
  name: string;
  business: string | null;
  verified: boolean;
  imageUrl: string | null;
  rating: number;
  reviews: number;
  specialties: string[];
  priceFromCents: number | null;
  profile?: {
    id: string;
    businessName: string | null;
    bio?: string | null;
    user?: {
      id: string;
      firstName?: string;
      lastName?: string;
      profilePictureUrl?: string | null;
    };
    availability?: { weekday: string; start: string; end: string }[];
  };
};

type PortfolioItem = {
  id: string;
  imageUrl: string;
  uploadedAt?: string;
};

// --- Main Component ---
export function ProviderPublicProfileScreen() {
  type Nav = CompositeNavigationProp<
    NativeStackNavigationProp<ProviderMoreStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >;
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ProviderMoreStackParamList, 'ProviderPublicProfileScreen'>>();
  // Accept both { id } and legacy { providerId }
  const providerId: string | undefined = route?.params?.id ?? route?.params?.providerId;
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'services' | 'portfolio' | 'reviews'
  const { tokens } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;

  // Dynamic data state
  const [publicData, setPublicData] = useState<PublicProfile | null>(null);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [errorPublic, setErrorPublic] = useState<string | null>(null);
  // Cache busting for avatar
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [errorPortfolio, setErrorPortfolio] = useState<string | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);

  // Share functionality
  const handleShare = () => {
    const url = `https://hairconnekt.app/provider/${providerId}`;
    Clipboard.setString(url);
    Alert.alert('Link kopiert!', 'Der Profil-Link wurde kopiert.');
  };

  // ... (useFocusEffect)
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      if (!providerId) return;

      // Force avatar refresh on focus
      setAvatarVersion(Date.now());

      const fetchData = async () => {
        setLoadingPublic(true);
        setLoadingServices(true);
        setLoadingPortfolio(true);
        setLoadingReviews(true);

        try {
          // Parallel fetch
          const [profileRes, servicesRes, portfolioRes, reviewsRes] = await Promise.allSettled([
            http.get(`/providers/public/${providerId}`),
            http.get(`/providers/${providerId}/services`),
            http.get(`/providers/${providerId}/portfolio`, { params: { limit: 12, sort: 'latest' } }),
            http.get(`/reviews/provider`, { params: { providerId, limit: 5 } }) // Recent 5
          ]);

          if (mounted) {
            // Profile
            if (profileRes.status === 'fulfilled') {
              const payload = profileRes.value.data;
              setPublicData((payload?.success && payload?.data) ? payload.data : payload as PublicProfile);
            } else {
              console.warn('Profile fetch failed', profileRes.reason);
              setErrorPublic('Profil konnte nicht geladen werden.');
            }

            // Services
            if (servicesRes.status === 'fulfilled') {
              const payload = servicesRes.value.data;
              const items = (payload?.success && payload?.data) ? payload.data : payload;
              setServices(Array.isArray(items) ? items : []);
            }

            // Portfolio
            if (portfolioRes.status === 'fulfilled') {
              const payload = portfolioRes.value.data;
              // Portfolio usually returns { items: [...] } or { success: true, data: { items: [...] } }
              // Let's handle both
              const dataRoot = (payload?.success && payload?.data) ? payload.data : payload;
              const items = Array.isArray(dataRoot?.items) ? dataRoot.items : [];

              setPortfolioItems(items.map((it: any) => ({
                id: it.id,
                imageUrl: it.imageUrl,
                uploadedAt: it.uploadedAt
              })).filter((x: any) => !!x.imageUrl));
            } else {
              setErrorPortfolio('Portfolio konnte nicht geladen werden.');
            }

            // Reviews
            if (reviewsRes.status === 'fulfilled') {
              const payload = reviewsRes.value.data;
              const items = (payload?.success && payload?.data) ? payload.data : payload;
              setReviews(Array.isArray(items) ? items : []);
            }
          }
        } catch (err) {
          console.error('Error fetching public profile data', err);
        } finally {
          if (mounted) {
            setLoadingPublic(false);
            setLoadingServices(false);
            setLoadingPortfolio(false);
            setLoadingReviews(false);
          }
        }
      };

      fetchData();

      // Load Favorite Status separately (fast, low priority, auth dependent)
      const loadFav = async () => {
        try {
          const res = await favoriteStatus(providerId);
          if (mounted) setIsFavorite((res as any).isFavorite);
        } catch { }
      };
      if (isAuthenticated) loadFav();

      return () => { mounted = false; };
    }, [providerId, isAuthenticated])
  );

  // ... (useFocusEffect)

  const renderAboutTab = () => (
    <View style={styles.tabContentContainer}>
      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Über uns</Text>
        <Text style={styles.bodyText}>
          {publicData?.profile?.bio || 'Keine Beschreibung verfügbar.'}
        </Text>
      </Card>

      {publicData?.specialties && publicData.specialties.length > 0 && (
        <Card style={styles.tabCard}>
          <Text style={styles.cardTitle}>Spezialgebiete</Text>
          <View style={styles.badgeWrap}>
            {publicData.specialties.map((spec, i) => (
              <Badge key={i} title={spec} variant="outline" />
            ))}
          </View>
        </Card>
      )}

      {publicData?.profile?.availability && publicData.profile.availability.length > 0 && (
        <Card style={styles.tabCard}>
          <Text style={styles.cardTitle}>Öffnungszeiten</Text>
          <View style={styles.featureList}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayEn, idx) => {
              const dayDe = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][idx];
              // Backend returns 3-letter codes (mon, tue, wed...)
              const shortCode = dayEn.substring(0, 3).toLowerCase();
              // Handle 'thu' vs 'thursday' (first 3 chars match). 'tue' match.
              // 'wed' match. 'fri' match. 'sat' match. 'sun' match. 'mon' match.
              // Wait, 'Thursday' substring(0,3) is 'Thu'. 'Tuesday' is 'Tue'.
              // Backend uses 'thu', 'tue'. So substring(0,3).toLowerCase() works for all except maybe... 
              // 'Sunday' -> 'sun'. 'Saturday' -> 'sat'. 'Friday' -> 'fri'. 'Wednesday' -> 'wed'.
              // All seem to align with standard 3-letter codes.
              // Let's verify 'Thursday' -> 'thu'. Yes.

              const slot = publicData.profile?.availability?.find(a => a.weekday?.toLowerCase() === shortCode);
              return (
                <View key={dayEn} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.bodyText}>{dayDe}</Text>
                  <Text style={[styles.bodyText, { color: slot ? COLORS.text : COLORS.textSecondary }]}>
                    {slot ? `${slot.start} - ${slot.end}` : 'Geschlossen'}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {/* Additional details could go here */}
    </View>
  );

  const ownerName = publicData?.profile?.user?.firstName
    ? `${publicData.profile.user.firstName} ${publicData.profile.user.lastName || ''}`.trim()
    : null;

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert('Anmelden', 'Bitte melde dich an, um diesen Anbieter zu favorisieren.');
      return;
    }
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    try {
      if (newStatus) {
        await addFavorite(providerId!);
      } else {
        await removeFavorite(providerId!);
      }
    } catch {
      setIsFavorite(!newStatus); // Revert
    }
  };

  const renderServicesTab = () => (
    <View style={styles.tabContentContainer}>
      {loadingServices ? (
        <ActivityIndicator />
      ) : services.length > 0 ? (
        services.map((service, idx) => (
          <Card key={service.id || idx} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                <Text style={styles.serviceDuration}>
                  {service.durationMinutes ? `${service.durationMinutes} Min.` : 'Dauer variiert'}
                </Text>
                {service.description ? (
                  <Text style={styles.serviceDescription} numberOfLines={2}>{service.description}</Text>
                ) : null}
              </View>
              <Text style={styles.servicePrice}>
                {service.priceCents != null ? `€${(service.priceCents / 100).toFixed(2)}` : 'Preis auf Anfrage'}
              </Text>
            </View>
            <Button
              title="Buchen"
              size="sm"
              onPress={() => navigation.navigate('BookingFlowScreen', { providerId, serviceName: service.name })}
              style={styles.bookButton}
            />
          </Card>
        ))
      ) : (
        <Text style={styles.bodyText}>Keine Services verfügbar.</Text>
      )}
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContentContainer}>
      <Card style={styles.tabCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
          <Icon name="star" size={16} color={COLORS.amber} fill={COLORS.amber} />
          <Text style={styles.ratingValue}>{publicData?.rating ?? '–'}</Text>
          <Text style={styles.reviewCountText}>({publicData?.reviews ?? 0} Bewertungen)</Text>
        </View>
      </Card>

      {loadingReviews ? (
        <ActivityIndicator />
      ) : reviews.length > 0 ? (
        reviews.map((review, idx) => (
          <Card key={review.id || idx} style={[styles.tabCard, { marginTop: SPACING.sm }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
              <Text style={{ fontWeight: 'bold' }}>{review.client?.name || 'Anonym'}</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>{new Date(review.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: SPACING.xs }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={12} color={i < review.rating ? COLORS.amber : COLORS.gray} fill={i < review.rating ? COLORS.amber : 'transparent'} />
              ))}
            </View>
            <Text style={styles.bodyText}>{review.comment}</Text>
          </Card>
        ))
      ) : (
        <Text style={styles.bodyText}>Noch keine Bewertungen.</Text>
      )}
    </View>
  );

  const renderPortfolioTab = () => (
    <View>
      {loadingPortfolio ? (
        <View style={{ paddingVertical: SPACING.md }}>
          <ActivityIndicator />
        </View>
      ) : errorPortfolio ? (
        <Text style={styles.bodyText}>{errorPortfolio}</Text>
      ) : (
        <View style={styles.portfolioGrid}>
          {portfolioItems.length > 0 ? (
            portfolioItems.map((item, index) => {
              const imageUrl = item.imageUrl?.startsWith('http')
                ? item.imageUrl
                : `${BASE_URL}${item.imageUrl}`;

              return (
                <TouchableOpacity key={item.id || index} style={styles.portfolioItem} onPress={() => { /* View Image Modal */ }}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.portfolioImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ width: '100%', alignItems: 'center', padding: SPACING.xl }}>
              <Text style={[styles.bodyText, { textAlign: 'center', color: COLORS.textSecondary }]}>
                Noch keine Portfolio-Bilder vorhanden.
              </Text>
              {/* Debug Info: remove later */}
              {/* <Text style={{ fontSize: 10, color: 'red' }}>Count: {portfolioItems.length}</Text> */}
            </View>
          )}
        </View>
      )}
    </View>
  );


  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header (Always Visible) */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Öffentliches Profil</Text>
          <IconButton name="copy" onPress={handleShare} />
        </View>
        <Text style={styles.headerSubtitle}>So sehen dich potenzielle Kunden</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileSummary}>
            <Avatar size={80}>
              <AvatarImage
                size={80}
                uri={(() => {
                  const url = publicData?.profile?.user?.profilePictureUrl || publicData?.imageUrl;
                  if (!url) return undefined; // Let Fallback handle it instead of Unsplash hardcode
                  return `${url}${url.includes('?') ? '&' : '?'}t=${avatarVersion}`;
                })()}
              />
              <AvatarFallback
                size={80}
                label={publicData?.name || 'Provider'}
              />
            </Avatar>
            <View style={styles.summaryTextContainer}>
              <View style={styles.businessTitleRow}>
                <Text style={styles.businessName}>{publicData?.business || publicData?.name || 'Anbieter'}</Text>
                <TouchableOpacity onPress={() => { /* Navigate to edit profile/dashboard */ }} style={{ marginLeft: SPACING.xs }}>
                  {/* For provider's own screen, show link to dashboard/edit */}
                  <Icon name="edit" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              {!!ownerName && <Text style={styles.ownerName}>{ownerName}</Text>}
              <View style={styles.badgeRow}>
                <Badge title="Pro" color="amber" />
                {publicData?.verified ? (
                  <Badge title="Verifiziert" variant="outline" />
                ) : null}
              </View>

              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color={COLORS.amber} fill={COLORS.amber} />
                <Text style={styles.ratingValue}>{publicData?.rating ?? '–'}</Text>
                <Text style={styles.reviewCountText}>({publicData?.reviews ?? 0} Bewertungen)</Text>
              </View>
            </View>
          </View>

          <View style={styles.locationInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-pin" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>Adresse wird demnächst angezeigt</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button title="Jetzt buchen" onPress={() => navigation.navigate("BookingFlowScreen", { providerId })} style={styles.bookNowButton} />
            <IconButton name="message-circle" onPress={() => navigation.navigate("ChatScreen", { userId: providerId })} style={styles.iconButtonOutline} color={COLORS.textSecondary} />
            <IconButton name={isFavorite ? 'heart' : 'heart'} onPress={handleToggleFavorite} style={styles.iconButtonOutline} color={isFavorite ? COLORS.primary : COLORS.textSecondary} />
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsList}>
            {['about', 'services', 'portfolio', 'reviews'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabTrigger, activeTab === tab && styles.tabTriggerActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'about' && 'Über'}
                  {tab === 'services' && 'Services'}
                  {tab === 'portfolio' && 'Portfolio'}
                  {tab === 'reviews' && 'Bewertungen'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContentWrapper}>
            {activeTab === 'about' && renderAboutTab()}
            {activeTab === 'services' && renderServicesTab()}
            {activeTab === 'portfolio' && renderPortfolioTab()}
            {activeTab === 'reviews' && renderReviewsTab()}
            {errorPublic ? (
              <View style={{ paddingTop: SPACING.sm }}>
                <Text style={{ color: COLORS.danger || '#EF4444' }}>{errorPublic}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    backgroundColor: COLORS.background || '#F9FAFB',
    flex: 1,
  },
  // --- Fixed Header Styles ---
  fixedHeader: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomColor: COLORS.border || '#E5E7EB',
    borderBottomWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
  },
  // --- Profile Header ---
  scrollContent: {
    paddingBottom: SPACING.lg || 24,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg, // Separator from tabs
  },
  profileSummary: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryTextContainer: {
    flex: 1,
  },
  businessTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  businessName: {
    fontSize: FONT_SIZES.h3 || 20,
    fontWeight: 'bold',
  },
  ownerName: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  ratingValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  reviewCountText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body || 14,
  },
  locationInfo: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body || 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bookNowButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    flex: 1,
    height: 48,
  },
  // --- Tabs Styles ---
  tabsContainer: {
    backgroundColor: COLORS.white,
    // No top margin needed since it follows the profile header
  },
  tabsList: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
  },
  tabTrigger: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    marginRight: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tabTriggerActive: {
    borderBottomColor: COLORS.primary || '#8B4513',
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContentWrapper: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  // --- About Tab Styles ---
  tabContentContainer: {
    gap: SPACING.md,
  },
  tabCard: {
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  bodyText: {
    color: COLORS.text || '#1F2937',
    fontSize: FONT_SIZES.body || 14,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  featureList: {
    gap: SPACING.xs,
  },
  featureItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  checkIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  // --- Services Tab Styles ---
  serviceCard: {
    padding: SPACING.md,
  },
  serviceHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  serviceTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  serviceName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  serviceDuration: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body || 14,
  },
  serviceDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  servicePrice: {
    color: COLORS.primary || '#8B4513',
    fontSize: FONT_SIZES.body || 14,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
  },
  // --- Portfolio Tab Styles ---
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  portfolioItem: {
    width: (Dimensions.get('window').width - SPACING.md * 2 - SPACING.sm) / 2, // Calculate for 2 columns
    aspectRatio: 1,
    backgroundColor: '#f3f4f6', // Placeholder color
    borderRadius: 8,
    overflow: 'hidden',
  },
  portfolioImage: {
    height: '100%',
    width: '100%',
  },
  // --- Reviews Tab Styles ---
  viewAllReviewsButton: {
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  iconButtonOutline: {
    borderColor: COLORS.border,
    borderWidth: 1,
  }
});
