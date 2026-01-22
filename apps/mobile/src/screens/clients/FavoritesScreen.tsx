import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
// Assuming React Navigation is used
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
// Icon imports (using standard RN names or placeholders)
import ArrowLeft from '../../icons/ArrowLeft';
import Heart from '../../icons/Heart';
import { Button } from '../../components/Button';
import ProviderCard from '../../components/ProviderCard';
import { listFavorites as listFavoritesApi, removeFavorite as removeFavoriteApi } from '../../services/favorites';
import { useI18n } from '@/i18n';

// --- Type Definition ---
// Shape matches backend FavoritesService.list mapping
interface FavoriteItem {
  id: string; // favorite id
  providerId: string; // The provider's ID
  name: string;
  business?: string | null;
  image?: string;
  rating?: number | null;
  reviewCount?: number | null;
  priceFromCents?: number | null;
  specialties?: string[];
  verified?: boolean;
  createdAt?: string;
}

// --- Constants ---
const COLORS = {
  primary: '#8B4513',
  white: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  background: '#F9FAFB',
  redHeart: '#EF4444',
  grayLight: '#F3F4F6',
};
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// --- Component Start ---

export function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { t } = useI18n();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listFavoritesApi();
      setItems(res.results || []);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || t('screens.favorites.loadError');
      setError(msg);
      // Native logging for errors
      Alert.alert(t('common.errorTitle'), msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveFavorite = async (
    providerId: string,
    name: string
  ) => {
    // Optimistic update
    const prev = items;
    setItems((cur) => cur.filter((it) => it.providerId !== providerId));

    // Success notification is logged to console, can be replaced by a toast library
    console.log(t('screens.favorites.removedSuccess', { name }));

    try {
      await removeFavoriteApi(providerId);
    } catch (err: unknown) {
      setItems(prev);
      const msg = (err as { message?: string })?.message || t('screens.favorites.removeError');
      Alert.alert(t('common.errorTitle'), msg);
    }
  };

  const handleNavigateToProvider = (providerId: string) => {
    // Navigate to ProviderDetail with a consistent { id } param shape
    navigation.navigate('ProviderDetail', { id: providerId });
  };

  const renderItem = (provider: FavoriteItem) => (
    <ProviderCard
      key={provider.id}
      data={{
        id: provider.providerId,
        name: provider.name,
        business: provider.business,
        imageUrl: provider.image,
        verified: provider.verified,
        rating: provider.rating,
        reviews: provider.reviewCount,
        specialties: provider.specialties,
        priceFromCents: provider.priceFromCents,
        // Calculate/map other missing fields if necessary
      }}
      isFavorite={true}
      onToggleFavorite={() => handleRemoveFavorite(provider.providerId, provider.name)}
      onPress={() => handleNavigateToProvider(provider.providerId)}
    />
  );

  // --- Render Logic ---

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('screens.favorites.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('screens.favorites.loading')}</Text>
        </View>
      )}

      {/* Error State (optional) */}
      {!loading && error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('common.errorTitle')}: {error}</Text>
          <Button title={t('common.actions.retry')} onPress={fetchData} />
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Heart size={48} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>{t('screens.favorites.empty.title')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('screens.favorites.empty.subtitle')}
          </Text>
          <Button
            title={t('screens.favorites.discoverButton')}
            onPress={() => navigation.navigate('Search')}
            style={styles.discoverButton}
          />
        </View>
      )}

      {/* Favorites List */}
      {!loading && !error && items.length > 0 && (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <Text style={styles.listCountText}>
            {items.length === 1
              ? t('screens.favorites.count.one')
              : t('screens.favorites.count.other', { count: items.length })}
          </Text>

          {items.map(renderItem)}

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>{t('screens.favorites.suggestions.title')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.suggestionsButtonText}>{t('screens.favorites.suggestions.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.suggestionsSubtitle}>
              {t('screens.favorites.suggestions.subtitle')}
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  cardItem: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm, // Add spacing between items if not handled by container gap
  },
  discoverButton: {
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl * 2,
  },
  emptyIconCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    width: 96,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    color: COLORS.redHeart,
    fontSize: 16,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    color: COLORS.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    marginLeft: SPACING.md,
  },
  imageWrapper: {
    height: 80,
    width: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm / 2,
  },
  listContainer: {
    gap: SPACING.md,
    padding: SPACING.md,
  },
  listCountText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.md,
  },
  providerBusiness: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  providerImage: {
    height: '100%',
    width: '100%',
  },
  providerName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1, // Allow shrinking if needed
    flexWrap: 'wrap', // Allow wrapping
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 24,
    zIndex: 10,
  },
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  suggestionsButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    padding: SPACING.sm / 2,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  suggestionsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  suggestionsSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  suggestionsTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
