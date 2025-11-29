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
import { Card } from '../../components/Card';
import { listFavorites as listFavoritesApi, removeFavorite as removeFavoriteApi } from '../../services/favorites';
import { useI18n } from '@/i18n';

// --- Type Definition ---
// Shape matches backend FavoritesService.list mapping
interface FavoriteItem {
  id: string; // favorite id
  providerId: string;
  name: string;
  business?: string | null;
  image?: string;
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
    <Card
      key={provider.id}
      // Replaced onClick with onPress on the Card's TouchableOpacity
      onPress={() => handleNavigateToProvider(provider.providerId)} 
      style={styles.cardItem}
    >
      <View style={styles.cardContent}>
        {/* Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: provider.image || "https://placehold.co/200x200" }} // Use a placeholder URI
            style={styles.providerImage}
            resizeMode="cover"
          />
          {/* Remove Button - Replaced HTML button with TouchableOpacity */}
          <TouchableOpacity
            // Important: Stop the propagation so the parent Card press is not triggered
            onPress={() => handleRemoveFavorite(provider.providerId, provider.name)}
            style={styles.removeButton}
          >
            <Heart size={16} color={COLORS.redHeart} fill={COLORS.redHeart} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoTopRow}>
            <Text style={styles.providerName} numberOfLines={1}>
              {provider.name}
            </Text>
          </View>
          {provider.business && (
            <Text style={styles.providerBusiness}>{provider.business}</Text>
          )}
          {/* Add more info here like rating, location, etc. */}
        </View>
      </View>
    </Card>
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
    gap: SPACING.sm * 1.5,
    padding: SPACING.sm * 1.5,
  },
  cardItem: {
    borderRadius: 8,
    overflow: 'hidden',
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
    flexShrink: 0,
    height: 96,
    position: 'relative',
    width: 96,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: SPACING.sm,
  },
  infoTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm / 2,
  },
  listContainer: {
    gap: SPACING.sm * 1.5,
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
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  providerImage: {
    borderRadius: 8,
    height: '100%',
    width: '100%',
  },
  providerName: {
    color: COLORS.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    opacity: 0.9,
    position: 'absolute',
    right: SPACING.sm / 2,
    top: SPACING.sm / 2,
    width: 28,
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
