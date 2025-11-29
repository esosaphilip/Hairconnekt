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
import { useNavigation, useRoute } from '@react-navigation/native';
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
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
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
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Fehler beim Laden des Profils';
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
        const res = await http.get(`/provider/${providerId}/portfolio`, { params: { limit: 12, sort: 'latest' } });
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];
        const mapped: PortfolioItem[] = items.map((it: any) => ({ id: it?.id, imageUrl: it?.imageUrl, uploadedAt: it?.uploadedAt }));
        if (mounted) setPortfolioItems(mapped.filter((x) => !!x.imageUrl));
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Fehler beim Laden des Portfolios';
        if (mounted) setErrorPortfolio(msg);
      } finally {
        if (mounted) setLoadingPortfolio(false);
      }
    }

    async function loadFavoriteStatus() {
      if (!providerId) return;
      try {
        const res = await favoriteStatus(providerId);
        if (mounted) setIsFavorite(!!(res as any)?.isFavorite);
      } catch (e) {
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
    } catch (err) {
      // revert on failure
      setIsFavorite(!next);
      Alert.alert('Fehler', 'Aktion fehlgeschlagen');
    }
  };

  // Function to handle sharing link
  const handleShare = () => {
    Clipboard.setString("https://app.example.com/aisha-braiding-studio");
    Alert.alert("Link kopiert!", "Der Profil-Link wurde in die Zwischenablage kopiert.");
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

      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Was uns auszeichnet</Text>
        <View style={styles.featureList}>
          {[
            'Qualität und Sorgfalt',
            'Individuelle Beratung',
            'Angenehme Atmosphäre',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check" size={20} color={COLORS.success} style={styles.checkIcon} />
              <Text style={styles.bodyText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Öffnungszeiten</Text>
        <Text style={styles.bodyText}>Bitte kontaktiere den Anbieter für aktuelle Öffnungszeiten.</Text>
      </Card>
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
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Fixed Header Styles ---
  fixedHeader: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Profile Header ---
  scrollContent: {
    paddingBottom: SPACING.lg || 24,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xs, // Separator from tabs
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontSize: FONT_SIZES.h3 || 20,
    fontWeight: 'bold',
  },
  ownerName: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  ratingValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  reviewCountText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  locationInfo: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  openText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.success || '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bookNowButton: {
    flex: 1,
    backgroundColor: COLORS.primary || '#8B4513',
    height: 48,
  },
  // --- Tabs Styles ---
  tabsContainer: {
    backgroundColor: COLORS.white,
    // No top margin needed since it follows the profile header
  },
  tabsList: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  tabTrigger: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabTriggerActive: {
    borderBottomColor: COLORS.primary || '#8B4513',
  },
  tabText: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
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
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  checkIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  hoursList: {
    gap: SPACING.xs,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: FONT_SIZES.body || 14,
  },
  hoursDay: {
    color: COLORS.textSecondary,
  },
  hoursTimeOpen: {
    color: COLORS.text,
  },
  hoursTimeClosed: {
    color: COLORS.danger || '#EF4444',
  },
  // --- Services Tab Styles ---
  serviceCard: {
    padding: SPACING.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  serviceName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  serviceDuration: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  servicePrice: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.primary || '#8B4513',
    fontWeight: 'bold',
  },
  bookButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  // --- Portfolio Tab Styles ---
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  portfolioItem: {
    width: (Dimensions.get('window').width - SPACING.md * 2 - SPACING.sm) / 2, // Calculate for 2 columns
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  // --- Reviews Tab Styles ---
  reviewCard: {
    padding: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewClient: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  reviewDate: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  reviewServiceBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
  },
  viewAllReviewsButton: {
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
  }
});
