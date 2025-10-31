import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// --- Constants ---
const THEME_COLOR = '#8B4513';
const LIGHT_GRAY = '#F9FAFB';
const TEXT_COLOR_DARK = '#1F2937';
const SPACING = 16;
const CARD_RADIUS = 12;

// --- Mock Data & Dependencies ---
const recentSearches: string[] = ['Box Braids', 'Cornrows', 'Salons in Dortmund'];

const filterChips: { id: string; label: string }[] = [
  { id: 'salon', label: 'Salon' },
  { id: 'individual', label: 'Einzelperson' },
  { id: 'mobile', label: 'Mobil' },
  { id: 'price-low', label: '€' },
  { id: 'price-mid', label: '€€' },
  { id: 'rating', label: '4★+' },
  { id: 'today', label: 'Heute' },
  { id: 'nearby', label: '< 5km' },
];

// Note: removed TypeScript-only type annotations to keep this file runtime-only.

// Mock Auth Context (Simulated)
const useAuth = () => ({
  isAuthenticated: true, // Default to true for favorite logic
  // In a real app, this would come from a context
});

// Mock API Call (Simulated)
type SearchResult = {
  id: string;
  name: string;
  business: string | null;
  rating?: number;
  reviews?: number;
  distance?: string;
  specialties?: string[];
  price?: string;
  available?: boolean;
  verified?: boolean;
  image?: string;
};

const mockResults: SearchResult[] = [
  { id: 'p1', name: 'Aisha Braids', business: "Aisha's Salon", rating: 4.8, reviews: 154, distance: '2.1 km', specialties: ['Box Braids', 'Cornrows', 'Twists'], price: 'ab €50', available: true, verified: true, image: '' },
  { id: 'p2', name: 'Beauty by B', business: null, rating: 4.5, reviews: 88, distance: '5.5 km', specialties: ['Knotless', 'Faux Locs'], price: 'ab €80', available: false, verified: false, image: '' },
  { id: 'p3', name: 'Dortmund Hair Hub', business: 'Salon', rating: 4.9, reviews: 302, distance: '1.2 km', specialties: ['Weaves', 'Extensions'], price: 'ab €65', available: true, verified: true, image: '' },
];

async function simulatedApiSearch(term: string): Promise<{ results: SearchResult[] }> {
  return new Promise((resolve: (value: { results: SearchResult[] }) => void) => {
    setTimeout(() => {
      if (term.toLowerCase().includes('braids')) {
        resolve({ results: mockResults.slice(0, 2) });
      } else if (term.toLowerCase().includes('dortmund')) {
        resolve({ results: mockResults });
      } else if (term.trim()) {
        resolve({ results: [mockResults[2]] });
      } else {
        resolve({ results: [] });
      }
    }, 400); // Simulate network latency
  });
}

// Mock Favorite Service (Simulated)
async function favoriteStatus(ids: string[]): Promise<{ favorites: string[] }> {
  // Mock: p1 is a favorite initially
  return new Promise((resolve: (value: { favorites: string[] }) => void) =>
    setTimeout(() => resolve({ favorites: ['p1'] }), 50)
  );
}
async function addFavorite(id: string) { /* no-op */ }
async function removeFavorite(id: string) { /* no-op */ }

// --- Custom Components ---

// Simplified Badge Component
const CustomBadge = ({ label, variant, onPress, icon }: any) => {
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
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        navigation.navigate('Login');
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
        Alert.alert('Fehler', 'Aktion fehlgeschlagen');
      }
    },
    [isAuthenticated, favorites, navigation]
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Effect for searching
  useEffect(() => {
    let timeout;
    async function fetchResults() {
      if (!searchTerm.trim()) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { results: data } = await simulatedApiSearch(searchTerm);
        setResults(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Suche derzeit nicht verfügbar';
        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    timeout = setTimeout(fetchResults, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

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

  const RenderListItem = ({ braider }: { braider: SearchResult }) => {
    const isFavorite = favorites.includes(braider.id);

    return (
      <TouchableOpacity
        style={styles.card}
        // TODO: Navigate to a specific provider detail route when available
        onPress={() => navigation.navigate('Tabs')}
      >
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(braider.id, braider.name)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#F43F5E' : '#9CA3AF'} // pink-500 or gray-400
            style={isFavorite ? styles.favoriteIconFilled : styles.favoriteIconOutline}
          />
        </TouchableOpacity>

        <View style={styles.listItemContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {/* Simulate ImageWithFallback */}
              <Text style={styles.avatarText}>{braider.name.charAt(0)}</Text>
            </View>
            {braider.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.braiderName} numberOfLines={1}>
              {braider.name}
            </Text>
            {braider.business && (
              <Text style={styles.businessName} numberOfLines={1}>
                {braider.business}
              </Text>
            )}
            {!!braider.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>{braider.rating}</Text>
                {!!braider.reviews && (
                  <Text style={styles.reviewsText}>({braider.reviews})</Text>
                )}
              </View>
            )}
            {!!braider.distance && (
              <View style={styles.distanceRow}>
                <Ionicons name="location-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.distanceText}>
                  {braider.distance} entfernt
                </Text>
              </View>
            )}
            {Array.isArray(braider.specialties) && braider.specialties.length > 0 && (
              <View style={styles.specialtyContainer}>
                {braider.specialties.slice(0, 3).map((specialty, idx) => (
                  <CustomBadge
                    key={idx}
                    label={specialty}
                    variant="secondary"
                    style={{ marginRight: 4 }}
                  />
                ))}
              </View>
            )}
            <View style={styles.priceAvailableRow}>
              {braider.price && (
                <Text style={styles.priceText}>{braider.price}</Text>
              )}
              {braider.available && (
                <CustomBadge
                  label="Verfügbar heute"
                  variant="available"
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Suche nach Styles, Braiders, Salons..."
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Searches */}
        {!searchTerm && (
          <View style={styles.recentSearchSection}>
            <View style={styles.recentSearchHeader}>
              <Text style={styles.recentSearchTitle}>Letzte Suchen</Text>
              <TouchableOpacity onPress={() => Alert.alert('Simuliert', 'Alle Suchen gelöscht')}>
                <Text style={styles.clearAllText}>Alle löschen</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
              {recentSearches.map((search, index) => (
                <CustomBadge
                  key={index}
                  label={search}
                  variant="outline"
                  onPress={() => setSearchTerm(search)}
                  icon={<Ionicons name="time-outline" size={12} color={TEXT_COLOR_DARK} />}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          <CustomButton
            title="Erweiterte Filter"
            onPress={() => Alert.alert('Filter', 'Erweiterte Filter öffnen')}
            variant="outline"
            style={styles.advancedFilterButton}
            textStyle={styles.advancedFilterText}
            icon={<Ionicons name="options-outline" size={16} color={TEXT_COLOR_DARK} />}
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
                {loading ? 'Suchen...' : `${results.length} Ergebnisse`}
                </Text>
                <View style={styles.viewModeButtons}>
                <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.viewModeButtonBase, viewMode === 'list' && styles.viewModeButtonActive]}>
                    <Ionicons name="list-outline" size={20} color={viewMode === 'list' ? THEME_COLOR : '#9CA3AF'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.viewModeButtonBase, viewMode === 'grid' && styles.viewModeButtonActive, { marginLeft: 8 }]}>
                    <Ionicons name="grid-outline" size={20} color={viewMode === 'grid' ? THEME_COLOR : '#9CA3AF'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('map')} style={[styles.viewModeButtonBase, viewMode === 'map' && styles.viewModeButtonActive, { marginLeft: 8 }]}>
                    <Ionicons name="map-outline" size={20} color={viewMode === 'map' ? THEME_COLOR : '#9CA3AF'} />
                </TouchableOpacity>
                </View>
            </View>

            {/* Sort Dropdown - Simulated as TouchableOpacity */}
            <TouchableOpacity onPress={() => Alert.alert('Sortierung', 'Sortieroptionen auswählen (Simuliert)')}>
                <View style={styles.sortDropdown}>
                <Text style={styles.sortDropdownText}>Empfohlen</Text>
                <Ionicons name="chevron-down" size={18} color={TEXT_COLOR_DARK} />
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
                        label={chip?.label}
                        variant="default"
                        icon={
                            <TouchableOpacity onPress={() => toggleFilter(filterId)}>
                                <Ionicons name="close-outline" size={14} color="white" style={{marginLeft: 4}} />
                            </TouchableOpacity>
                        }
                    />
                    );
                })}
                <TouchableOpacity onPress={() => setActiveFilters([])}>
                    <Text style={styles.resetFilterText}>Filter zurücksetzen</Text>
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
                <ActivityIndicator size="large" color={THEME_COLOR} />
                <Text style={styles.loadingText}>Suchen...</Text>
              </View>
            ) : results.length > 0 ? (
              <View style={styles.resultsList}>
                {results.map((braider) => (
                  <RenderListItem key={braider.id} braider={braider} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>Keine Ergebnisse</Text>
                <Text style={styles.emptyStateMessage}>
                  Suche ist bald verfügbar, während wir unser Provider-Verzeichnis aufbauen.
                </Text>
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
            )
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>Finde deinen perfekten Braider</Text>
              <Text style={styles.emptyStateMessage}>
                Suche nach Styles, Braiders oder Salons
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Custom Button for RN (Simplified) ---
const CustomButton = ({ title, onPress, variant = 'primary', icon, style, textStyle }: any) => {
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


// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: SPACING,
    paddingTop: SPACING,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING / 2,
    backgroundColor: '#F3F4F6',
    borderRadius: CARD_RADIUS,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    color: TEXT_COLOR_DARK,
  },
  clearButton: {
    padding: 4,
  },

  // Recent Search Section
  recentSearchSection: {
    marginBottom: SPACING,
  },
  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentSearchTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearAllText: {
    fontSize: 14,
    color: THEME_COLOR,
  },

  // Chip ScrollView
  chipScrollView: {
    paddingVertical: 4, // Space around the chips
  },
  // Button styles used by CustomButton
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 36,
  },
  buttonPrimary: {
    backgroundColor: THEME_COLOR,
  },
  buttonOutline: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR_DARK,
  },
  buttonTextPrimary: {
    color: 'white',
  },
  buttonTextOutline: {
    color: TEXT_COLOR_DARK,
  },
  buttonIcon: {
    marginRight: 8,
  },
  advancedFilterButton: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    height: 32, // Smaller button
  },
  advancedFilterText: {
    fontSize: 14,
    color: TEXT_COLOR_DARK,
    fontWeight: 'normal',
  },

  // Badge/Chip Styles
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    height: 32,
  },
  badgePrimary: {
    backgroundColor: THEME_COLOR,
  },
  badgeOutline: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 14,
  },
  badgeTextPrimary: {
    color: 'white',
  },
  badgeTextOutline: {
    color: TEXT_COLOR_DARK,
  },
  // Custom variant for 'Verfügbar heute'
  badgeAvailable: {
    backgroundColor: '#10B981', // bg-green-500
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    height: 24,
  },

  // Results Header
  resultsHeader: {
    backgroundColor: 'white',
    paddingHorizontal: SPACING,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 14,
    color: TEXT_COLOR_DARK,
  },
  viewModeButtons: {
    flexDirection: 'row',
  },
  viewModeButtonBase: {
    padding: 4,
    borderRadius: 4,
  },
  viewModeButtonActive: {
    backgroundColor: `${THEME_COLOR}10`,
  },
  // viewModeButton functional style replaced by base+active variants above
  
  // Sort Dropdown Simulation
  sortDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  sortDropdownText: {
    fontSize: 14,
    color: TEXT_COLOR_DARK,
  },

  // Active Filters
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  resetFilterText: {
    fontSize: 12,
    color: THEME_COLOR,
    alignSelf: 'center',
  },

  // Results List
  resultsBody: {
    padding: SPACING,
  },
  resultsList: {
  },
  card: {
    backgroundColor: 'white',
    borderRadius: CARD_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: SPACING,
    marginBottom: SPACING,
    position: 'relative',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4, // larger touch target
  },
  favoriteIconFilled: {
    // heart is already filled in Ionicons when name='heart'
  },
  favoriteIconOutline: {
    // heart is outline in Ionicons when name='heart-outline'
  },

  // Avatar & Verified Badge
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
    width: 64,
    height: 64,
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6', // Simulating Avatar background
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#3B82F6', // bg-blue-500
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  // Details
  detailsContainer: {
    flex: 1,
    minWidth: 0,
  },
  braiderName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR_DARK,
    marginBottom: 2,
  },
  businessName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: TEXT_COLOR_DARK,
  },
  reviewsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  priceAvailableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    color: THEME_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  // Custom Badge for 'Verfügbar heute' (style defined above)

  // Empty State / Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: THEME_COLOR,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: SPACING,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: TEXT_COLOR_DARK,
  },
  emptyStateMessage: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#EF4444', // text-red-500
  }
});
