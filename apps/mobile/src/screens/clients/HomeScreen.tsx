import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Image,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { rootNavigationRef } from '@/navigation/rootNavigation';
import Icon from "@/components/Icon";
import { useAuth } from "@/auth/AuthContext";
import { clientBraiderApi } from '@/api/clientBraider';
// import { IBraider } from '@/domain/models/braider';
// import { addFavorite, removeFavorite, favoriteStatus } from "@/services/favorites";
import { IBraider } from '@/domain/models/braider';
import { addFavorite, removeFavorite, favoriteStatus } from "@/services/favorites";
import { showMessage } from "react-native-flash-message";
import { Avatar, Badge, Card, Input, Button } from "@/ui";
import ProviderCard from "@/components/ProviderCard";
import * as Location from "expo-location";
import { useI18n } from "@/i18n";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { API_CONFIG, MESSAGES } from "@/constants";
import { logger } from "@/services/logger";
import { showError } from "@/presentation/utils/errorHandler";
import type { ClientTabsParamList } from "@/navigation/types";

// --- Data Definitions (Remain mostly the same) ---

// Replace ImageWithFallback with a simple Image component, handling fallback within it or a wrapper
// For simplicity here, I'll use a direct Image component, RN often handles fallbacks within Image props
// or a custom wrapper.

const popularStyles = [
  {
    id: 1,
    name: "Box Braids",
    priceFrom: 45,
    durationHoursRange: "3-4",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 2,
    name: "Cornrows",
    priceFrom: 35,
    durationHoursRange: "2-3",
    image: "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 3,
    name: "Senegalese Twists",
    priceFrom: 55,
    durationHoursRange: "4-5",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

const quickActions = [
  { iconName: "flash", key: "urgent", color: colors.orange500 },
  { iconName: "car", key: "mobileService", color: colors.blue600 },
  { iconName: "gift", key: "vouchers", color: colors.purple600 },
  { iconName: "heart", key: "favorites", color: colors.pink500 },
  { iconName: "sparkles", key: "newBraiders", color: colors.amber600 },
];

// Type definitions
// Remove NearbyItem type definition as we use IBraider now
/* 
type NearbyItem = {
  id: string;
  name: string;
  business?: string;
  imageUrl?: string;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  distanceKm?: number;
  specialties?: string[];
  priceFromCents?: number;
  available?: boolean;
};
*/

type PopularStyle = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
};

// --- Refactored Component ---

export function HomeScreen() {
  const { t, locale } = useI18n();
  const [favorites, setFavorites] = useState<string[]>([]);
  const { tokens, user } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;
  
  const [popularCategories, setPopularCategories] = useState<PopularStyle[]>([]);
  
  // Load popular categories
  useEffect(() => {
    (async () => {
        try {
            const cats = await clientBraiderApi.getCategories();
            // Take top 5 for horizontal list
            setPopularCategories(cats.slice(0, 5));
        } catch (e) {
            // ignore
        }
    })();
  }, []);

  const displayName = user?.firstName ? `${user.firstName}! 👋` : user?.email ? `${user.email}` : t('screens.home.welcomeTo');
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email ? user.email[0].toUpperCase() : "U");

  const [locationLabel, setLocationLabel] = useState<string>(t('screens.home.location.detecting'));
  const [nearby, setNearby] = useState<IBraider[] | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  // Safe currency formatter for Android/Hermes where Intl may be limited
  const formatCurrency = useCallback((euros: number) => {
    try {
      if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        const currencyLocale = locale === 'de' ? 'de-DE' : 'en-GB';
        return new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: 'EUR' }).format(euros);
      }
    } catch {}
    // Fallback: simple formatting
    const value = Math.round((euros + Number.EPSILON) * 100) / 100;
    return `€${value.toFixed(2)}`;
  }, [locale]);

  // Use useCallback for async handlers
  const initFavStatus = useCallback(async (currentNearby: IBraider[] | null) => {
    if (!isAuthenticated || !currentNearby?.length) return;
    const ids = (currentNearby || []).map((n) => n.id).filter(Boolean);
    if (!ids.length) return;
    try {
      const res = await favoriteStatus(ids);
      setFavorites(res.favorites || []);
    } catch {
      // best-effort: ignore
    }
  }, [isAuthenticated]);

  // Geolocation and Nearby Fetching
  const fetchNearbyData = useCallback(async (latitude: number, longitude: number) => {
    setNearbyLoading(true);
    setNearbyError(null);
    let cityLabel = t('screens.home.location.currentLocation');
    
    // Reverse Geocoding (RN often uses a dedicated library, but fetch works for Nominatim)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const resp = await fetch(url);
      const data = await resp.json().catch(() => null);
      const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;
      const state = data?.address?.state || data?.address?.region;
      cityLabel = [city, state].filter(Boolean).join(', ') || cityLabel;
    } catch {
      // Ignore geocoding failure, keep current location label
    } finally {
      setLocationLabel(cityLabel);
    }

    // API Call
    try {
      // Use the new clientBraiderApi instead of direct http call
      const items = await clientBraiderApi.getNearby({ 
        lat: latitude, 
        lon: longitude, 
        radiusKm: 25, 
        limit: 10 
      });
      setNearby(items);
      // Re-initialize favorites after loading nearby
      initFavStatus(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('screens.home.fetchError');
      setNearbyError(message);
      setNearby([]);
      logger.error('Failed to fetch nearby providers', err);
    } finally {
      setNearbyLoading(false);
    }
  }, [initFavStatus, t]);

  const getLocation = useCallback(async () => {
    setLocationLabel(t('screens.home.location.detecting'));
    setNearbyError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationLabel(t('screens.home.location.disabled'));
        setNearbyError(t('screens.home.location.permissionRequired'));
        setNearby([]);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      fetchNearbyData(latitude, longitude);
    } catch (err: unknown) {
      logger.warn('Geolocation error:', err);
      setLocationLabel(t('screens.home.location.disabled'));
      setNearbyError(t('screens.home.location.permissionRequired'));
      setNearby([]);
    }
  }, [fetchNearbyData, t]);

  // Use useFocusEffect for fetching data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      // Only fetch if location is available on mount/focus
      getLocation();
      // Cleanup is not strictly necessary for Geolocation but good practice
      return () => {};
    }, [getLocation])
  );

  const handleToggleFavorite = async (id: string) => {
    if (!isAuthenticated) {
      // Navigate to login (uses the RN navigation stack)
      rootNavigationRef.current?.navigate('Login');
      return;
    }
    const isFav = favorites.includes(id);
    // Optimistic update
    setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
    try {
      if (isFav) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    } catch (err: unknown) {
      // Revert on failure
      setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
      const msg = err instanceof Error ? err.message : MESSAGES.ERROR.UNKNOWN;
      showMessage({
        message: 'Fehler',
        description: msg,
        type: 'danger',
      });
      logger.error('Failed to toggle favorite', err);
    }
  };

  const renderPopularStyleItem = ({ item }: { item: PopularStyle }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Search', params: { initialFilter: `cat:${item.slug}` } })}
      style={styles.popularStyleCard}
    >
      <View style={styles.popularStyleImageContainer}>
        <Image
          source={{ uri: item.iconUrl || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=400&q=80' }}
          style={styles.popularStyleImage}
          // Fallback logic for Image is usually handled by onError or a custom wrapper
        />
        <View style={styles.imageOverlay} />
        <View style={styles.popularStyleTextContainer}>
          <Text style={styles.popularStyleName}>{item.name}</Text>
          <View style={styles.popularStyleDetails}>
             <Text style={styles.popularStylePrice}>Jetzt entdecken</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNearbyBraider = ({ item: braider }: { item: IBraider }) => (
    <ProviderCard
      data={{
        ...braider,
        reviews: braider.reviews?.length || 0, // Convert review array to number count for ProviderSummary
      }}
      isFavorite={favorites.includes(braider.id)}
      onToggleFavorite={handleToggleFavorite}
      onPress={() => rootNavigationRef.current?.navigate('ProviderDetail', { id: braider.id })}
      formatCurrency={formatCurrency}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            {isAuthenticated ? (
              <View style={styles.userInfo}>
                <Avatar size={40} style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>{initials}</Text>
                </Avatar>
                <View>
                  <Text style={styles.greetingText}>{t('screens.home.hello')}</Text>
                  <Text style={styles.displayName}>{displayName}</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.greetingText}>{t('screens.home.welcomeTo')}</Text>
                <Text style={styles.displayName}>HairConnekt 👋</Text>
              </View>
            )}
            <View style={styles.headerActions}>
              {!isAuthenticated && (
                <Button
                  size="small"
                  variant="outline"
                  onPress={() => rootNavigationRef.current?.navigate('Login')}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                  icon={<Icon name="person" size={16} color={colors.primary} style={{ marginRight: spacing.xs }} />}
                >
                  {t('common.actions.logIn')}
                </Button>
              )}
              {isAuthenticated && (
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'Notifications' } })}
                >
                  <Icon name="notifications" size={24} color={colors.gray700} />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={getLocation}
            style={styles.locationButton}
            activeOpacity={0.7}
          >
            <Icon name="map-pin" size={16} color={colors.gray700} />
            <Text style={styles.locationText}>{locationLabel}</Text>
            <Icon name="chevron-right" size={16} color={colors.gray700} />
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity
            onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Search' })}
            style={styles.searchBarWrapper}
            activeOpacity={1} // Prevent visual change on press
          >
            <Input
              placeholder={t('screens.home.searchPlaceholder')}
              editable={false} // ReadOnly in web -> editable={false} in RN
              style={styles.searchBarInput}
              leftIcon={<Icon name="funnel-outline" size={20} color={colors.gray400} />}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="funnel-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Verification Banner */}
        {isAuthenticated && (user?.emailVerified === false || user?.phoneVerified === false) && (
          <Card style={styles.verificationCard}>
            <View style={styles.verificationContent}>
              <Icon name="alert-circle" size={20} color={colors.amber600} />
              <View style={styles.verificationTextWrapper}>
                <Text style={styles.verificationText}>
                  {t('screens.home.verification.promptWithWhich', { which: t(user?.emailVerified === false ? 'screens.home.verification.email' : 'screens.home.verification.phone') })}
                </Text>
                <Button
                  size="small"
                  onPress={() => rootNavigationRef.current?.navigate('Verify')}
                  style={styles.verifyButton}
                  textStyle={styles.verifyButtonText}
                >
                  {t('screens.home.verification.verifyNow')}
                </Button>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <FlatList
            data={quickActions}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.key === "urgent") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Search', params: { urgent: true } });
                  } else if (item.key === "mobileService") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Search', params: { mobileService: true } });
                  } else if (item.key === "vouchers") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'Vouchers' } });
                  } else if (item.key === "favorites") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'Favorites' } });
                  } else if (item.key === "newBraiders") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Search', params: { newProviders: true } });
                  }
                }}
              >
                <View style={[styles.quickActionButton, { backgroundColor: item.color }]}>
                  <Icon name={item.iconName} size={24} color={colors.white} />
                </View>
                <Text style={styles.quickActionLabel}>{t(`screens.home.quickActions.${item.key}`)}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Popular Styles */}
        <View style={styles.popularStylesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('screens.home.popularStylesTitle')}</Text>
            <TouchableOpacity
              onPress={() => rootNavigationRef.current?.navigate('AllStyles')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>{t('screens.home.seeAll')}</Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularCategories}
            keyExtractor={(item) => item.id}
            renderItem={renderPopularStyleItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularStylesList}
          />
        </View>

        {/* Nearby Braiders */}
        <View style={styles.nearbyBraidersSection}>
          <Text style={styles.sectionTitle}>{t('screens.home.nearbyTitle')}</Text>
          {nearbyLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>{t('screens.home.loadingNearby')}</Text>
            </View>
          )}
          {nearbyError && (
            <Text style={styles.errorText}>{nearbyError}</Text>
          )}
          <View style={styles.nearbyList}>
            {/* Using a regular View for vertical list instead of FlatList for simplicity */}
            {(nearby || []).map((braider) => (
              <View key={braider.id}>{renderNearbyBraider({ item: braider })}</View>
            ))}
            {!nearbyLoading && (nearby?.length || 0) === 0 && !nearbyError && (
              <Text style={styles.noDataText}>{t('screens.home.noNearbyFound')}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  userInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  initialsAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  initialsText: {
    color: colors.white,
    fontWeight: '600',
  },
  greetingText: {
    color: colors.gray500,
    fontSize: typography.small.fontSize,
  },
  displayName: {
    color: colors.gray800,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loginButton: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: typography.small.fontSize,
  },
  notificationButton: {
    padding: spacing.sm,
    position: 'relative',
  },
  notificationBadge: {
    backgroundColor: colors.error,
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 8,
  },
  locationButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationText: {
    color: colors.gray700,
    fontSize: typography.small.fontSize,
  },
  searchBarWrapper: {
    justifyContent: 'center',
    position: 'relative',
  },
  searchBarInput: {
    borderRadius: radii.lg,
    height: 48,
    paddingLeft: spacing.xl,
  },
  filterButton: {
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
  },
  verificationCard: {
    backgroundColor: colors.amber50,
    borderColor: colors.amber200,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  verificationContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  verificationTextWrapper: {
    flex: 1,
  },
  verificationText: {
    color: colors.amber900,
    fontSize: typography.small.fontSize,
    marginBottom: spacing.sm,
  },
  verifyButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.amber600,
    height: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: typography.small.fontSize,
  },
  quickActionsContainer: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  quickActionsList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 72,
  },
  quickActionButton: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 56,
  },
  quickActionLabel: {
    color: colors.gray700,
    fontSize: 11,
    textAlign: 'center',
  },
  popularStylesSection: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.gray800,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  seeAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: typography.small.fontSize,
  },
  popularStylesList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  popularStyleCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: 160,
  },
  popularStyleImageContainer: {
    height: 192,
    position: 'relative',
  },
  popularStyleImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popularStyleTextContainer: {
    bottom: 0,
    left: 0,
    padding: spacing.sm,
    position: 'absolute',
    right: 0,
  },
  popularStyleName: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  popularStyleDetails: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popularStylePrice: {
    color: colors.white,
    fontSize: typography.small.fontSize,
  },
  popularStyleDuration: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  popularStyleDurationText: {
    color: colors.white,
    fontSize: typography.small.fontSize,
  },
  nearbyBraidersSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.small.fontSize,
    paddingVertical: spacing.sm,
  },
  nearbyList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  nearbyBraiderCard: {
    padding: 0,
  },
  nearbyBraiderTouchable: {
    padding: spacing.md,
    position: 'relative',
  },
  favoriteButton: {
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    zIndex: 10,
  },
  nearbyBraiderContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  braiderAvatar: {
    borderRadius: 32,
    height: 64,
    overflow: 'hidden',
    width: 64,
  },
  braiderImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: colors.blue600,
    borderColor: colors.white,
    borderRadius: 10,
    borderWidth: 2,
    bottom: -spacing.xs,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -spacing.xs,
    width: 20,
  },
  verifiedText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  braiderDetails: {
    flex: 1,
    minWidth: 0,
  },
  braiderName: {
    color: colors.gray800,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
  },
  braiderBusiness: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
    marginTop: 2,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  ratingText: {
    color: colors.gray800,
    fontSize: typography.small.fontSize,
  },
  reviewCount: {
    color: colors.gray400,
    fontSize: typography.small.fontSize,
  },
  distanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  distanceText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  specialtyBadgeText: {
    fontSize: typography.small.fontSize,
  },
  priceAndAvailability: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  priceText: {
    color: colors.primary,
    fontWeight: '600',
  },
  availableBadgeText: {
    fontSize: typography.small.fontSize,
  },
  noDataText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
