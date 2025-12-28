import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Linking, // For phone calls
  Alert,   // For simple alerts
} from 'react-native';

// Reusable components (assumed, based on previous refactoring)
import Text from '@/components/Text';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Badge from '@/components/badge';
import Avatar, { AvatarImage, AvatarFallback } from '@/components/avatar';
import Icon from '@/components/Icon';
import { colors, spacing, typography, radii } from '@/theme/tokens';
import { logger } from '@/services/logger';
import { MESSAGES } from '@/constants';
import { useNavigation } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { clientBraiderApi } from '@/api/clientBraider';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

// --- Mock Data (Simplified AvatarFallback logic for RN) ---

const mockProviders = [
  // ... (Mock data remains unchanged)
  {
    id: "1",
    name: "Amina's Braids Studio",
    avatar: "",
    rating: 4.9,
    reviewCount: 128,
    distance: "0.8 km",
    specialty: "Box Braids, Cornrows",
    price: "€60-€120",
    location: {
      lat: 52.52,
      lng: 13.405,
      address: "Hauptstraße 45, 10115 Berlin",
    },
    isAvailable: true,
  },
  {
    id: "2",
    name: "Bella Hair Salon",
    avatar: "",
    rating: 4.8,
    reviewCount: 95,
    distance: "1.2 km",
    specialty: "Knotless Braids, Twists",
    price: "€70-€130",
    location: {
      lat: 52.525,
      lng: 13.41,
      address: "Friedrichstraße 120, 10117 Berlin",
    },
    isAvailable: true,
  },
  {
    id: "3",
    name: "StyleMasters Barbershop",
    avatar: "",
    rating: 4.7,
    reviewCount: 156,
    distance: "1.5 km",
    specialty: "Fades, Designs",
    price: "€25-€45",
    location: {
      lat: 52.515,
      lng: 13.4,
      address: "Unter den Linden 77, 10117 Berlin",
    },
    isAvailable: false,
  },
  {
    id: "4",
    name: "Natural Hair Berlin",
    avatar: "",
    rating: 4.9,
    reviewCount: 203,
    distance: "2.1 km",
    specialty: "Locs, Natural Styling",
    price: "€50-€100",
    location: {
      lat: 52.53,
      lng: 13.395,
      address: "Alexanderplatz 5, 10178 Berlin",
    },
    isAvailable: true,
  },
];

// --- Config Helpers ---
const IconNames = {
  ArrowLeft: 'chevron-left',
  MapPin: 'map-pin',
  Search: 'search',
  Filter: 'sliders',
  List: 'list',
  Star: 'star',
  Navigation: 'compass',
  Phone: 'phone',
  MessageSquare: 'message-square',
};


const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n: string) => (n.length > 1 ? n[0] : n.slice(0, 2)))
    .join("");

import { useLocation } from '@/context/LocationContext';

export function MapViewScreen() {
  const navigation = useNavigation();
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  type Provider = {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    distance: string;
    specialty: string;
    price: string;
    location: { lat: number; lng: number; address: string };
    isAvailable: boolean;
  };
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showList, setShowList] = useState(false);
  const [providers, setProviders] = useState<Provider[]>(mockProviders);

  useEffect(() => {
    let mounted = true;
    const lat = location?.lat || 52.52;
    const lon = location?.lon || 13.405;

    (async () => {
      try {
        if (!location?.lat || !location?.lon) return;

        const items = await clientBraiderApi.getNearby({ lat: location.lat, lon: location.lon, radiusKm: 10, limit: 10 });
        if (mounted && Array.isArray(items) && items.length > 0) {
          const mapped: Provider[] = items.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.imageUrl || '',
            rating: p.rating,
            reviewCount: p.reviewCount,
            distance: p.distance || (p.distanceKm ? `${p.distanceKm.toFixed(1)} km` : '0 km'),
            specialty: p.specialties?.join(', ') || '',
            price: p.priceFromCents != null ? `ab €${(p.priceFromCents / 100).toFixed(2)}` : 'Preis auf Anfrage',
            location: { lat: 0, lng: 0, address: p.address || '' },
            isAvailable: p.isAvailable
          }));
          setProviders(mapped);
        }
      } catch (e) {
        console.error("Failed to load map providers", e);
      }
    })();
    return () => { mounted = false; };
  }, [location]);

  const filteredProviders = useMemo(() =>
    providers.filter((provider) =>
      String(provider.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    ), [providers, searchQuery]);

  const handleCall = () => {
    // Mock call functionality, use Linking.openURL(`tel:`) in a real app
    Alert.alert("Anruf", "Starte Anruf zu +49 123 456 7890...");
  };

  // Custom Render for the Provider Card (Bottom Sheet Equivalent)
  const renderProviderCard = () => {
    if (!selectedProvider) return null;
    const provider = selectedProvider;

    return (
      <View style={styles.providerCardWrapper}>
        <Card style={styles.providerCard}>
          <View style={styles.providerCardContent}>
            <Avatar size={64}>
              {provider.avatar
                ? <AvatarImage uri={provider.avatar} size={64} />
                : <AvatarFallback label={provider.name} size={64} />}
            </Avatar>

            <View style={styles.providerDetails}>
              <View style={styles.nameBadgeRow}>
                <Text variant="h3" numberOfLines={1} style={styles.providerNameText}>
                  {provider.name}
                </Text>
                {provider.isAvailable && (
                  <Badge
                    label="Verfügbar"
                    backgroundColor={colors.lightGreen}
                    textColor={colors.green600}
                  />
                )}
              </View>

              <View style={styles.ratingDistanceRow}>
                <Icon name={IconNames.Star} size={16} color={colors.amber600} style={styles.starIcon} />
                <Text style={styles.ratingText}>
                  {provider.rating} ({provider.reviewCount})
                </Text>
                <Text style={styles.separatorText}>•</Text>
                <Text style={styles.distanceText}>
                  {provider.distance}
                </Text>
              </View>

              <Text style={styles.specialtyText}>{provider.specialty}</Text>
              <Text style={styles.priceText}>{provider.price}</Text>

              <View style={styles.addressRow}>
                <Icon name={IconNames.MapPin} size={12} color={colors.gray600} />
                <Text numberOfLines={1} style={styles.addressText}>{provider.location.address}</Text>
              </View>

              <View style={styles.actionButtonsRow}>
                <Button
                  title="Profil ansehen"
                  onPress={() => rootNavigationRef.current?.navigate('ProviderDetail', { id: provider.id })}
                  style={styles.profileButton}
                  textStyle={{ color: colors.white }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Messages' })}
                  style={[styles.actionIconButton, { marginLeft: 8 }]}
                >
                  <Icon name={IconNames.MessageSquare} size={16} color={colors.gray700} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onPress={handleCall}
                  style={[styles.actionIconButton, { marginLeft: 8 }]}
                >
                  <Icon name={IconNames.Phone} size={16} color={colors.gray700} />
                </Button>
              </View>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  // Custom Render for the List View
  const renderListView = () => {
    return (
      <View style={styles.listOverlay}>
        <View style={styles.listHeader}>
          <View style={styles.listTitleRow}>
            <Text variant="h2" style={styles.listHeaderTitle}>Listenansicht</Text>
            <Button
              title="Karte"
              variant="ghost"
              size="sm"
              onPress={() => setShowList(false)}
            />
          </View>
          <Text style={styles.listResultsText}>
            {filteredProviders.length} Ergebnisse
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.listScrollViewContent}>
          {filteredProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              onPress={() => {
                setSelectedProvider(provider);
                setShowList(false);
              }}
            >
              <Card style={styles.listItemCard}>
                <View style={styles.listItemContent}>
                  <Avatar size={48}>
                    {provider.avatar
                      ? <AvatarImage uri={provider.avatar} size={48} />
                      : <AvatarFallback label={provider.name} size={48} />}
                  </Avatar>

                  <View style={styles.listItemDetails}>
                    <View style={styles.nameBadgeRow}>
                      <Text variant="h3" numberOfLines={1} style={styles.listItemName}>
                        {provider.name}
                      </Text>
                      {provider.isAvailable && (
                        <Badge
                          label="Verfügbar"
                          backgroundColor={colors.lightGreen}
                          textColor={colors.green}
                          textStyle={styles.listItemBadge}
                        />
                      )}
                    </View>

                    <View style={styles.ratingDistanceRow}>
                      <Icon name={IconNames.Star} size={12} color={colors.amber600} style={styles.starIcon} />
                      <Text style={styles.listItemSmallText}>
                        {provider.rating} ({provider.reviewCount})
                      </Text>
                      <Text style={styles.separatorText}>•</Text>
                      <Text style={styles.listItemSmallText}>
                        {provider.distance}
                      </Text>
                    </View>

                    <Text style={styles.listItemSmallText}>{provider.specialty}</Text>
                    <Text style={styles.listItemPriceText}>{provider.price}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header and Search Bar (Fixed at Top) */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => navigation.goBack()}
            >
              <Icon name={IconNames.ArrowLeft} size={20} color={colors.gray800} />
            </Button>
            <Text variant="h3" style={styles.headerTitle}>Kartenansicht</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarWrapper}>
            <Icon name={IconNames.Search} size={20} color={colors.gray400} style={styles.searchIcon} />
            <Input
              placeholder="Suche nach Stylisten..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <View style={styles.searchButtons}>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Search' })}
                style={styles.filterButton}
              >
                <Icon name={IconNames.Filter} size={16} color="#4B5563" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setShowList(!showList)}
                style={[styles.filterButton, { marginLeft: 4 }]}
              >
                <Icon name={IconNames.List} size={16} color={colors.gray700} />
              </Button>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Map Container (Flex-1) */}
      <View style={styles.mapContainer}>
        {/* Mock Map Placeholder */}
        <View style={styles.mockMapBackground}>
          {/* Results Count Badge */}
          <View style={styles.resultsBadge}>
            <Text style={styles.resultsText}>
              {filteredProviders.length} Stylisten in der Nähe
            </Text>
          </View>

          {/* Map Markers */}
          {filteredProviders.map((provider, index) => {
            // Using arbitrary percentages for mock positioning, should be based on real coordinates
            const mockLeftPx = 30 + index * 15;
            const mockTopPx = 40 + index * 10;

            return (
              <TouchableOpacity
                key={provider.id}
                onPress={() => setSelectedProvider(provider)}
                style={[
                  styles.mapMarker,
                  { left: mockLeftPx, top: mockTopPx },
                  selectedProvider?.id === provider.id && styles.selectedMarkerScale,
                ]}
              >
                <View style={[
                  styles.mapMarkerInner,
                  provider.isAvailable ? styles.markerAvailable : styles.markerUnavailable,
                ]}
                >
                  <Icon name={IconNames.MapPin} size={20} color={colors.white} />
                </View>
                {selectedProvider?.id === provider.id && (
                  <View style={styles.pulseDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Center Location Button */}
        <TouchableOpacity
          style={styles.centerLocationButton}
          onPress={() => Alert.alert("Standort", "Standort wird zentriert...")}
        >
          <Icon name={IconNames.Navigation} size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 3. Selected Provider Card (Bottom Overlay) */}
      {renderProviderCard()}

      {/* 4. List View Overlay (Conditional) */}
      {showList && renderListView()}
    </View>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // bg-[#FAF9F6]
  },
  // --- 1. Header Styles ---
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    zIndex: 20,
    // RN shadow for sticky header feel
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginLeft: 8,
  },
  // Search Bar
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 40,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 100, // Space for buttons
    height: 40,
  },
  searchButtons: {
    position: 'absolute',
    right: 8,
    flexDirection: 'row',
  },
  filterButton: {
    height: 32, // h-8
    width: 32,
    borderRadius: 6,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- 2. Map Container Styles ---
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mockMapBackground: {
    ...StyleSheet.absoluteFillObject,
    // Simulating gradient map background
    backgroundColor: colors.blue200,
  },
  resultsBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  resultsText: {
    fontSize: 14,
    color: colors.gray700,
  },
  mapMarker: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -20 }], // Centers the 40x40 marker
  },
  selectedMarkerScale: {
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.25 }],
    zIndex: 10,
  },
  mapMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  markerAvailable: {
    backgroundColor: colors.primary,
  },
  markerUnavailable: {
    backgroundColor: colors.gray400,
  },
  pulseDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    // RN doesn't support easy pulse animation in CSS, would need Animated API
  },
  centerLocationButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },
  // --- 3. Selected Provider Card (Bottom Overlay) ---
  providerCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 20,
  },
  providerCard: {
    // Card styles are handled by the Card component, applying shadows/border
    padding: 16,
    backgroundColor: colors.white,
  },
  providerCardContent: {
    flexDirection: 'row',
  },
  providerDetails: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  providerNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    flexShrink: 1,
  },
  ratingDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starIcon: {
    color: colors.amber600,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  separatorText: {
    fontSize: 14,
    color: colors.gray400,
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    color: colors.gray700,
    marginLeft: 4,
  },
  specialtyText: {
    fontSize: 14,
    color: colors.gray700,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    color: colors.primary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addressText: {
    fontSize: 12,
    color: colors.gray600,
    marginLeft: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  profileButton: {
    flex: 1,
    height: 36, // h-9
    backgroundColor: colors.primary,
  },
  actionIconButton: {
    height: 36,
    width: 36,
    borderColor: colors.gray300,
  },
  // --- 4. List View Overlay ---
  listOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    zIndex: 30,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  listResultsText: {
    fontSize: 14,
    color: colors.gray700,
  },
  listScrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  listItemCard: {
    padding: 16,
  },
  listItemContent: {
    flexDirection: 'row',
  },
  listItemDetails: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  listItemBadge: {
    fontSize: 12,
  },
  listItemSmallText: {
    fontSize: 12,
    color: colors.gray700,
    marginBottom: 2,
  },
  listItemPriceText: {
    fontSize: 12,
    color: colors.primary,
  }
});
