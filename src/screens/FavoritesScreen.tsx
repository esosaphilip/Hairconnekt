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
import { useNavigation } from '@react-navigation/native';
// Icon imports (using standard RN names or placeholders)
import ArrowLeft from '../icons/ArrowLeft'; 
import Heart from '../icons/Heart';
import MapPin from '../icons/MapPin'; 
import Star from '../icons/Star';
import { Button } from '../components/Button'; // Assuming a custom Button component
import { Card } from '../components/Card';   // Assuming a custom Card component

// --- Type Definition Stub (Must be adapted for RN environment) ---
// This interface must be defined in your shared types file
interface FavoriteItem {
  id: string; // Used for React key
  providerId: string; // Used for API calls
  name: string;
  business?: string;
  image?: string;
  // Add other necessary fields like rating, city, etc.
}

// --- Service Stubs (Must be adapted to use RN-compatible networking) ---
// These functions should use fetch or a mobile HTTP client
const listFavorites = async (): Promise<{ results: FavoriteItem[] }> => {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    results: [
      { id: '1', providerId: 'p1', name: 'Braider Berlin', business: 'Muster Salon', image: 'https://images.unsplash.com/photo-1596464526154-d9c025d57b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
      { id: '2', providerId: 'p2', name: 'Haarstudio Haarig', business: 'Inh. Lisa Mustermann', image: 'https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
    ],
  };
};

const removeFavorite = async (providerId: string): Promise<void> => {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Removed favorite: ${providerId}`);
};

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
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listFavorites();
      setItems(res.results || []);
    } catch (err: any) {
      const msg = err?.message || "Fehler beim Laden der Favoriten";
      setError(msg);
      // Native logging for errors
      Alert.alert("Fehler", msg);
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
    console.log(`${name} erfolgreich entfernt.`);
    
    try {
      await removeFavorite(providerId);
    } catch (err: any) {
      // Revert state on failure
      setItems(prev);
      Alert.alert(
        "Fehler", 
        err?.message || "Entfernen fehlgeschlagen. Bitte versuche es erneut."
      );
    }
  };

  const handleNavigateToProvider = (providerId: string) => {
    // Use React Navigation's standard navigate function
    navigation.navigate('ProviderDetail', { providerId }); 
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
        <Text style={styles.headerTitle}>Favoriten</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Lade Favoriten...</Text>
        </View>
      )}

      {/* Error State (optional) */}
      {!loading && error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Fehler: {error}</Text>
          <Button title="Erneut versuchen" onPress={fetchData} />
        </View>
      )}
      
      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Heart size={48} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Noch keine Favoriten</Text>
          <Text style={styles.emptySubtitle}>
            Speichere deine Lieblings-Braider für schnellen Zugriff
          </Text>
          <Button
            title="Braider entdecken"
            onPress={() => navigation.navigate('Search')}
            style={styles.discoverButton}
          />
        </View>
      )}

      {/* Favorites List */}
      {!loading && !error && items.length > 0 && (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <Text style={styles.listCountText}>
            {items.length} {items.length === 1 ? "Favorit" : "Favoriten"}
          </Text>

          {items.map(renderItem)}
          
          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>Weitere Empfehlungen</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.suggestionsButtonText}>Alle ansehen</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.suggestionsSubtitle}>
              Entdecke ähnliche Braider in deiner Nähe
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header Styles
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  discoverButton: {
    backgroundColor: COLORS.primary,
  },
  // Favorites List
  listContainer: {
    padding: SPACING.md,
    gap: SPACING.sm * 1.5, // space-y-3 equivalent
  },
  listCountText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  cardItem: {
    borderRadius: 8,
    overflow: 'hidden',
    // Hover effect mimic is often done via activeOpacity or custom state on TouchableOpacity
  },
  cardContent: {
    flexDirection: 'row',
    gap: SPACING.sm * 1.5, // gap-3 equivalent
    padding: SPACING.sm * 1.5, // p-3 equivalent
  },
  imageWrapper: {
    position: 'relative',
    width: 96, // w-24 equivalent
    height: 96, // h-24 equivalent
    flexShrink: 0,
  },
  providerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm / 2,
    right: SPACING.sm / 2,
    width: 28, // w-7 equivalent
    height: 28, // h-7 equivalent
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white/90
    alignItems: 'center',
    justifyContent: 'center',
    // For iOS backdrop-blur-sm, you would use '@react-native-community/blur'
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: SPACING.sm, // Add a bit of padding for better text flow
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm / 2,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
  },
  providerBusiness: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  // Suggestions
  suggestionsContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionsButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    padding: SPACING.sm / 2, // Mimic ghost button padding
  },
  suggestionsSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});