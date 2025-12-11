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
import { useNavigation, useRoute, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProviderMoreStackParamList, RootStackParamList } from '@/navigation/types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { Badge } from '../../components/badge';
import Avatar, { AvatarImage } from '../../components/avatar';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { http } from '@/api/http';
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

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [errorPortfolio, setErrorPortfolio] = useState<string | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  // For now we only read the param; later we'll fetch provider data by id
  if (providerId) {
    // lightweight debug log to confirm navigation param wiring
    console.debug('ProviderPublicProfileScreen opened for provider id:', providerId);
  }

  useEffect(() => {
    let mounted = true;
    async function fetchPublicProfile() {
      if (!providerId) return;
      setLoadingPublic(true);
      setErrorPublic(null);
      try {
        const res = await http.get(`/providers/public/${providerId}`);
        const data = res?.data as PublicProfile;
        if (mounted) setPublicData(data);
      } catch (err: unknown) {
        const msg = (() => {
          if (typeof err === 'string') return err;
          if (typeof err === 'object' && err) {
            const e = err as { message?: string; response?: { data?: { message?: string } } };
            return e.response?.data?.message ?? e.message ?? 'Fehler beim Laden des Profils';
          }
          return 'Fehler beim Laden des Profils';
        })();
        if (mounted) setErrorPublic(msg);
      } finally {
        if (mounted) setLoadingPublic(false);
      }
    }

    async function fetchPortfolio() {
      if (!providerId) return;
      setLoadingPortfolio(true);
      setErrorPortfolio(null);
      try {
        let res: any;
        try {
          res = await http.get(`/providers/${providerId}/portfolio`, { params: { limit: 12, sort: 'latest' } });
        } catch {
          res = await http.get(`/provider/${providerId}/portfolio`, { params: { limit: 12, sort: 'latest' } });
        }
        type RawPortfolioItem = { id: string; imageUrl?: string; uploadedAt?: string };
        const items = Array.isArray(res?.data?.items) ? (res.data.items as RawPortfolioItem[]) : [];
        const mapped: PortfolioItem[] = items.map((it) => ({ id: it.id, imageUrl: it.imageUrl ?? '', uploadedAt: it.uploadedAt }));
        if (mounted) setPortfolioItems(mapped.filter((x) => !!x.imageUrl));
      } catch (err: unknown) {
        const msg = (() => {
          if (typeof err === 'string') return err;
          if (typeof err === 'object' && err) {
            const e = err as { message?: string; response?: { data?: { message?: string } } };
            return e.response?.data?.message ?? e.message ?? 'Fehler beim Laden des Portfolios';
          }
          return 'Fehler beim Laden des Portfolios';
        })();
        if (mounted) setErrorPortfolio(msg);
      } finally {
        if (mounted) setLoadingPortfolio(false);
      }
    }

    async function loadFavoriteStatus() {
      if (!providerId) return;
      try {
        const res = await favoriteStatus(providerId);
        const fav = (res as { isFavorite?: boolean })?.isFavorite === true;
        if (mounted) setIsFavorite(fav);
      } catch {
        if (mounted) setIsFavorite(false);
      }
    }

    fetchPublicProfile();
    fetchPortfolio();
    loadFavoriteStatus();
    return () => { mounted = false; };
  }, [providerId]);

  const ownerName = useMemo(() => {
    const first = publicData?.profile?.user?.firstName || '';
    const last = publicData?.profile?.user?.lastName || '';
    const name = [first, last].filter(Boolean).join(' ').trim();
    return name ? `von ${name}` : '';
  }, [publicData]);

  const handleToggleFavorite = async () => {
    if (!providerId) return;
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) await addFavorite(providerId);
      else await removeFavorite(providerId);
    } catch {
      // revert on failure
      setIsFavorite(!next);
      Alert.alert('Fehler', 'Aktion fehlgeschlagen');
    }
  };

  // Function to handle sharing link
  const handleShare = () => {
    const w = typeof window !== 'undefined' ? window : null;
    const origin = w && w.location && w.location.origin ? w.location.origin : 'https://hairconnekt.app';
    const url = providerId ? `${origin}/providers/${providerId}` : origin;
    Clipboard.setString(url);
    Alert.alert('Link kopiert!', 'Der Profil-Link wurde in die Zwischenablage kopiert.');
  };

  // --- Tab Content Renderers ---

  const renderAboutTab = () => (
    <View style={styles.tabContentContainer}>
      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Über uns</Text>
        {loadingPublic ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.bodyText}>
            {publicData?.profile?.bio || 'Der Anbieter hat noch keine Beschreibung hinzugefügt.'}
          </Text>
        )}
      </Card>

      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Spezialisierungen</Text>
        <View style={styles.badgeWrap}>
          {(publicData?.specialties && publicData.specialties.length > 0) ? (
            publicData.specialties.map((s, idx) => (
              <Badge key={`${s}-${idx}`} title={s} variant="secondary" />
            ))
          ) : (
            <Text style={styles.bodyText}>Keine Spezialisierungen hinterlegt.</Text>
          )}
        </View>
      </Card>

      {/* Removed static feature and opening hours cards */}
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.tabContentContainer}>
      {(publicData?.specialties && publicData.specialties.length > 0) ? (
        publicData.specialties.map((name, idx) => (
          <Card key={`${name}-${idx}`} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.serviceName}>{name}</Text>
                </View>
                <Text style={styles.serviceDuration}>Dauer je nach Style</Text>
              </View>
              <Text style={styles.servicePrice}>
                {publicData?.priceFromCents != null ? `ab €${(publicData.priceFromCents / 100).toFixed(0)}` : 'Preis auf Anfrage'}
              </Text>
            </View>
            <Button
              title="Buchen"
              size="sm"
              onPress={() => navigation.navigate('BookingFlowScreen', { providerId, serviceName: name })}
              style={styles.bookButton}
            />
          </Card>
        ))
      ) : (
        <Text style={styles.bodyText}>Keine Services hinterlegt.</Text>
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
            portfolioItems.map((item, index) => (
              <TouchableOpacity key={item.id || index} style={styles.portfolioItem} onPress={() => { /* View Image Modal */ }}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.portfolioImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.bodyText}>Noch keine Portfolio-Bilder.</Text>
          )}
        </View>
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
        <Text style={[styles.bodyText, { marginTop: SPACING.sm }]}>Detailbewertungen folgen demnächst.</Text>
      </Card>
      <Button
        title="Alle Bewertungen anzeigen"
        variant="outline"
        onPress={() => setActiveTab('reviews')}
        style={styles.viewAllReviewsButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header (Always Visible) */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Öffentliches Profil</Text>
          <IconButton name="share-2" onPress={handleShare} />
        </View>
        <Text style={styles.headerSubtitle}>So sehen dich potenzielle Kunden</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileSummary}>
            <Avatar size={80}>
              <AvatarImage uri={publicData?.imageUrl || 'https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=200'} />
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
            <Button title="Jetzt buchen" onPress={() => navigation.navigate("BookingFlowScreen")} style={styles.bookNowButton} />
            <IconButton name="message-circle" onPress={() => navigation.navigate("ChatScreen")} style={styles.iconButtonOutline} color={COLORS.textSecondary} />
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
    </SafeAreaView>
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
