import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProviderCard from '@/components/ProviderCard';
import { clientBraiderApi } from '@/api/clientBraider';
import { http } from '@/api/http';
import { IBraider } from '@/domain/models/braider';
import { favoriteStatus, addFavorite, removeFavorite } from '@/services/favorites';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '@/services/recentSearches';
import { useAuth } from '@/auth/AuthContext';
import { useI18n } from '@/i18n';
import { colors, spacing, typography, radii } from '@/theme/tokens';
import { MESSAGES } from '@/constants';
import { logger } from '@/services/logger';
import type { ClientTabsParamList } from '@/navigation/types';
import { rootNavigationRef } from '@/navigation/rootNavigation';

// --- Mock Data & Dependencies ---
// Removed static recent searches; will add real persisted recent searches later

// Note: removed TypeScript-only type annotations to keep this file runtime-only.

// --- Custom Components ---

type CustomBadgeProps = {
  label: string;
  variant?: 'default' | 'available' | 'outline';
  onPress?: () => void;
  icon?: React.ReactNode;
};

const CustomBadge = ({ label, variant, onPress, icon }: CustomBadgeProps) => {
  const isPrimary = variant === 'default';
  const isAvailable = variant === 'available';
  const badgeStyle = [
    styles.badgeBase,
    isAvailable
      ? styles.badgeAvailable
      : isPrimary
        ? styles.badgePrimary
        : styles.badgeOutline,
  ];
  const textStyle = [
    styles.badgeText,
    isAvailable || isPrimary ? styles.badgeTextPrimary : styles.badgeTextOutline,
  ];

  return (
    <TouchableOpacity onPress={onPress} style={badgeStyle} disabled={!onPress}>
      {icon}
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

// --- SearchScreen Component ---

export function SearchScreen() {
  const { t } = useI18n();
  const { tokens } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as { initialTerm?: string; styleName?: string; urgent?: boolean; mobileService?: boolean; newProviders?: boolean; initialFilter?: string } | undefined;
  const initialTerm = routeParams?.initialTerm || routeParams?.styleName || '';
  const [searchTerm, setSearchTerm] = useState<string>(initialTerm);
  const [activeFilters, setActiveFilters] = useState<string[]>(routeParams?.initialFilter ? [routeParams.initialFilter] : []);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');

  // React to route params updates (e.g. navigation from AllStyles/PopularStyles while Search is already mounted)
  useEffect(() => {
    if (routeParams?.initialFilter) {
      setActiveFilters([routeParams.initialFilter]);
    } else if (routeParams?.initialTerm || routeParams?.styleName) {
      // If we just have a term but no filter, clear filters (optional logic, depends on UX preference)
      // setActiveFilters([]); 
      setSearchTerm(routeParams.initialTerm || routeParams.styleName || '');
    }
  }, [routeParams?.initialFilter, routeParams?.initialTerm, routeParams?.styleName]);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [results, setResults] = useState<IBraider[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Build filter chips with translatable labels (must be inside component so t() is in scope)
  const filterChips: { id: string; label: string }[] = [
    { id: 'salon', label: t('screens.search.chips.salon') },
    { id: 'individual', label: t('screens.search.chips.individual') },
    { id: 'mobile', label: t('screens.search.chips.mobile') },
    { id: 'price-low', label: '€' },
    { id: 'price-mid', label: '€€' },
    { id: 'rating', label: '4★+' },
    { id: 'today', label: t('screens.search.chips.today') },
    { id: 'nearby', label: t('screens.search.chips.nearby') },
  ];

  const toggleFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const handleToggleFavorite = useCallback(
    async (id: string, name: string) => {
      if (!isAuthenticated) {
        // Navigate to Login route in RootStack
        rootNavigationRef.current?.navigate('Login');
        return;
      }
      const isFav = favorites.includes(id);
      // Optimistic UI
      setFavorites((prev) =>
        isFav ? prev.filter((f) => f !== id) : [...prev, id]
      );

      try {
        if (isFav) {
          await removeFavorite(id);
        } else {
          await addFavorite(id);
        }
      } catch (err) {
        // Revert on failure
        setFavorites((prev) =>
          isFav ? [...prev, id] : prev.filter((f) => f !== id)
        );
        // Using Alert as a substitute for toast
        Alert.alert('Fehler', MESSAGES.ERROR.UNKNOWN);
      }
    },
    [isAuthenticated, favorites, navigation]
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Load persisted recent searches and categories on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const recents = await getRecentSearches();
      if (!cancelled) setRecentSearches(recents);

      // Fetch Categories
      try {
        const res = await http.get('/services/categories');
        const items = Array.isArray(res.data) ? res.data : [];
        if (!cancelled && items.length > 0) {
          setCategories(items.map((c: any) => ({
            id: c.id,
            name: c.nameDe || c.name,
            slug: c.slug
          })));
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUseRecent = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleClearRecent = useCallback(async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Effect for searching
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    async function fetchResults() {
      // Allow search if term exists OR if a category filter is active
      const categoryFilter = activeFilters.find(f => f.startsWith('cat:'));
      const hasSearchTerm = !!searchTerm.trim();

      if (!hasSearchTerm && !categoryFilter) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Extract pure category slug if present (remove "cat:" prefix)
        const categorySlug = categoryFilter ? categoryFilter.replace('cat:', '') : undefined;

        const data = await clientBraiderApi.search(searchTerm, { category: categorySlug });
        // Deduplicate by ID to prevent Fabric key errors
        const unique = Array.from(new Map(data.map(item => [item.id, item])).values());
        setResults(unique);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t('screens.search.error.unavailable');
        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    // Immediate fetch if we have initial params matching current state (first load optimization)
    // logic: if searchTerm equals initialTerm and we haven't fetched yet? 
    // Simplified: just wait 50ms for initial wrapper, else 400ms
    const isInitialParamLoad = (routeParams?.initialTerm === searchTerm || routeParams?.styleName === searchTerm) && results.length === 0 && !loading;
    const delay = isInitialParamLoad ? 0 : 400;

    timeout = setTimeout(fetchResults, delay);
    return () => clearTimeout(timeout);
  }, [searchTerm, activeFilters]);

  // Effect to initialize favorite status
  useEffect(() => {
    let cancelled = false;
    async function initFav() {
      if (!isAuthenticated) return;
      const ids = (results || []).map((r) => r.id).filter(Boolean);
      if (!ids.length) return;
      try {
        const res = await favoriteStatus(ids);
        if (!cancelled) setFavorites(res.favorites || []);
      } catch {
        // ignore silently
      }
    }
    initFav();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, results]);

  const RenderListItem = ({ braider }: { braider: IBraider }) => {
    const isFavorite = favorites.includes(braider.id);
    // Map IBraider to ProviderSummary expected by ProviderCard
    const providerSummary = {
      id: braider.id,
      name: braider.name,
      businessName: braider.businessName,
      rating: braider.rating,
      reviewCount: braider.reviews?.length || 0,
      distance: braider.distance,
      imageUrl: braider.profileImage, // Map profileImage to imageUrl
      isVerified: braider.isVerified,
      // Add other necessary fields if ProviderCard needs them
    };

    return (
      <ProviderCard
        data={providerSummary}
        isFavorite={isFavorite}
        onToggleFavorite={(id: string) => handleToggleFavorite(id, braider.name)}
        onPress={(id: string) => rootNavigationRef.current?.navigate('ProviderDetail', { id })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.gray400}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={t('screens.search.searchPlaceholder')}
            placeholderTextColor={colors.gray400}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={async () => {
              const next = await addRecentSearch(searchTerm);
              setRecentSearches(next);
            }}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-outline" size={20} color={colors.gray400} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Searches (persisted) */}
        <View style={styles.recentSearchSection}>
          <View style={styles.recentSearchHeader}>
            <Text style={styles.recentSearchTitle}>{t('screens.search.recent.title')}</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={handleClearRecent}>
                <Text style={styles.clearAllText}>{t('screens.search.recent.clearAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.recentChipsContainer}>
            {recentSearches.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.recentSearchChip}
                onPress={() => handleUseRecent(term)}
              >
                <Text style={styles.recentSearchChipText}>{term}</Text>
              </TouchableOpacity>
            ))}
            {recentSearches.length === 0 && (
              <Text style={styles.recentEmptyText}>{t('screens.search.recent.empty')}</Text>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          <CustomButton
            title={t('screens.search.filters.advanced')}
            onPress={() => Alert.alert(t('screens.search.filters.alertTitle'), t('screens.search.filters.alertMessage'))}
            variant="outline"
            style={styles.advancedFilterButton}
            textStyle={styles.advancedFilterText}
            icon={<Ionicons name="options-outline" size={16} color={colors.gray800} />}
          />
          {filterChips.map((chip) => (
            <CustomBadge
              key={chip.id}
              label={chip.label}
              variant={activeFilters.includes(chip.id) ? 'default' : 'outline'}
              onPress={() => toggleFilter(chip.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {/* Results Header */}
        {searchTerm ? (
          <View style={styles.resultsHeader}>
            <View style={styles.resultsHeaderContent}>
              <Text style={styles.resultsCountText}>
                {loading ? t('screens.search.results.searching') : t('screens.search.results.count', { count: results.length })}
              </Text>
              <View style={styles.viewModeButtons}>
                <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.viewModeButtonBase, viewMode === 'list' && styles.viewModeButtonActive]}>
                  <Ionicons name="list-outline" size={20} color={viewMode === 'list' ? colors.primary : colors.gray400} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.viewModeButtonBase, viewMode === 'grid' && styles.viewModeButtonActive, styles.viewModeButtonSpacing]}>
                  <Ionicons name="grid-outline" size={20} color={viewMode === 'grid' ? colors.primary : colors.gray400} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('map')} style={[styles.viewModeButtonBase, viewMode === 'map' && styles.viewModeButtonActive, styles.viewModeButtonSpacing]}>
                  <Ionicons name="map-outline" size={20} color={viewMode === 'map' ? colors.primary : colors.gray400} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sort Dropdown - Simulated as TouchableOpacity */}
            <TouchableOpacity onPress={() => Alert.alert(t('screens.search.sort.title'), t('screens.search.sort.message'))}>
              <View style={styles.sortDropdown}>
                <Text style={styles.sortDropdownText}>{t('screens.search.sort.recommended')}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.gray800} />
              </View>
            </TouchableOpacity>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <View style={styles.activeFiltersContainer}>
                {activeFilters.map((filterId) => {
                  const chip = filterChips.find((c) => c.id === filterId);
                  return (
                    <CustomBadge
                      key={filterId}
                      label={chip?.label ?? ''}
                      variant="default"
                      icon={
                        <TouchableOpacity onPress={() => toggleFilter(filterId)}>
                          <Ionicons name="close-outline" size={14} color={colors.white} style={styles.closeIconSpacing} />
                        </TouchableOpacity>
                      }
                    />
                  );
                })}
                <TouchableOpacity onPress={() => setActiveFilters([])}>
                  <Text style={styles.resetFilterText}>{t('screens.search.activeFilters.reset')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}

        {/* Results List / Status */}
        <View style={styles.resultsBody}>
          {searchTerm ? (
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('screens.search.results.searching')}</Text>
              </View>
            ) : results.length > 0 ? (
              <View style={styles.resultsList}>
                {results.map((braider) => (
                  <RenderListItem key={braider.id} braider={braider} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={colors.gray300} />
                <Text style={styles.emptyStateTitle}>{t('screens.search.empty.noResultsTitle')}</Text>
                <Text style={styles.emptyStateMessage}>
                  {t('screens.search.empty.noResultsMessage')}
                </Text>
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
            )
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>{t('screens.search.empty.defaultTitle')}</Text>
              <Text style={styles.emptyStateMessage}>
                {t('screens.search.empty.defaultMessage')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
  style?: any;
  textStyle?: any;
};

const CustomButton = ({ title, onPress, variant = 'primary', icon, style, textStyle }: CustomButtonProps) => {
  const isPrimary = variant === 'primary';
  const buttonStyle = [
    styles.buttonBase,
    isPrimary ? styles.buttonPrimary : styles.buttonOutline,
    style,
  ];
  const textStyles = [
    styles.buttonText,
    isPrimary ? styles.buttonTextPrimary : styles.buttonTextOutline,
    textStyle,
  ];

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle}>
      {icon && <View style={styles.buttonIcon}>{icon}</View>}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray100,
    borderBottomWidth: 1,
    elevation: 2,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    zIndex: 10,
  },
  searchInputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: radii.lg,
    flexDirection: 'row',
    height: 48,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    color: colors.gray800,
    flex: 1,
    fontSize: typography.body.fontSize,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
  },
  recentSearchSection: {
    marginBottom: spacing.md,
  },
  recentSearchHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  recentSearchTitle: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  clearAllText: {
    color: colors.primary,
    fontSize: typography.small.fontSize,
  },
  recentChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchChip: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  recentSearchChipText: {
    color: colors.gray800,
    fontSize: typography.small.fontSize,
  },
  recentEmptyText: {
    color: colors.gray400,
    fontSize: 13,
  },
  chipScrollView: {
    paddingVertical: spacing.xs,
  },
  buttonBase: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.gray800,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: colors.white,
  },
  buttonTextOutline: {
    color: colors.gray800,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  advancedFilterButton: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderRadius: 20,
    borderWidth: 1,
    height: 32,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  advancedFilterText: {
    color: colors.gray800,
    fontSize: typography.small.fontSize,
    fontWeight: 'normal',
  },
  badgeBase: {
    alignItems: 'center',
    borderRadius: radii.xl,
    flexDirection: 'row',
    height: 32,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgePrimary: {
    backgroundColor: colors.primary,
  },
  badgeOutline: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: typography.small.fontSize,
  },
  badgeTextPrimary: {
    color: colors.white,
  },
  badgeTextOutline: {
    color: colors.gray800,
  },
  badgeAvailable: {
    backgroundColor: colors.green500,
    borderRadius: radii.sm,
    height: 24,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  resultsHeader: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultsHeaderContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  resultsCountText: {
    color: colors.gray800,
    fontSize: typography.small.fontSize,
  },
  viewModeButtons: {
    flexDirection: 'row',
  },
  viewModeButtonBase: {
    borderRadius: radii.sm,
    padding: spacing.xs,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  viewModeButtonSpacing: {
    marginLeft: spacing.sm,
  },
  sortDropdown: {
    alignItems: 'center',
    borderColor: colors.gray200,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  sortDropdownText: {
    color: colors.gray800,
    fontSize: typography.small.fontSize,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  resetFilterText: {
    alignSelf: 'center',
    color: colors.primary,
    fontSize: typography.small.fontSize,
  },
  closeIconSpacing: {
    marginLeft: spacing.xs,
  },
  resultsBody: {
    padding: spacing.md,
  },
  resultsList: {},
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    elevation: 3,
    marginBottom: spacing.md,
    padding: spacing.md,
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  listItemContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  favoriteButton: {
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 10,
  },
  favoriteIconFilled: {},
  favoriteIconOutline: {},
  avatarContainer: {
    flexShrink: 0,
    height: 64,
    marginRight: spacing.sm,
    position: 'relative',
    width: 64,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: radii.md,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  avatarText: {
    color: colors.gray600,
    fontSize: 24,
    fontWeight: 'bold',
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
  detailsContainer: {
    flex: 1,
    minWidth: 0,
  },
  braiderName: {
    color: colors.gray800,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  businessName: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  ratingText: {
    color: colors.gray800,
    fontSize: typography.small.fontSize,
  },
  reviewsText: {
    color: colors.gray400,
    fontSize: typography.small.fontSize,
  },
  distanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  distanceText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  priceAvailableRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  priceText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    color: colors.gray800,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  emptyStateMessage: {
    color: colors.gray600,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: '#EF4444', // text-red-500
  }
});
