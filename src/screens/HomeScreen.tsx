/* @ts-nocheck */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  Image,
  Linking,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
// Assuming you have a custom icon set or use a library like 'react-native-vector-icons'
// I'll use placeholders for Lucide icons and assume a custom component or a library mapping.
import Icon from "react-native-vector-icons/Feather"; // Example, replace with your actual icon library
import { MapPin, Bell, ChevronRight, Clock, Star, Heart, Zap, Car, Gift, Sparkles, Filter, User, ShieldAlert } from "lucide-react-native"; // Using lucide-react-native for clarity
import { useAuth } from "@/auth/AuthContext";
import { http } from "@/api/http";
import { addFavorite, removeFavorite, favoriteStatus } from "@/services/favorites";
import { showMessage } from "react-native-flash-message"; // Replacement for 'sonner' toast
import { Avatar, Badge, Card, Input, Button } from "../ui"; // Assuming custom RN UI components
import Geolocation from "@react-native-community/geolocation"; // Standard RN Geolocation library

// --- Data Definitions (Remain mostly the same) ---

// Replace ImageWithFallback with a simple Image component, handling fallback within it or a wrapper
// For simplicity here, I'll use a direct Image component, RN often handles fallbacks within Image props
// or a custom wrapper.

const popularStyles = [
  // ... (data remains the same)
  {
    id: 1,
    name: "Box Braids",
    price: "ab €45",
    duration: "3-4 Std.",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 2,
    name: "Cornrows",
    price: "ab €35",
    duration: "2-3 Std.",
    image: "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 3,
    name: "Senegalese Twists",
    price: "ab €55",
    duration: "4-5 Std.",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

const quickActions = [
  // ... (data remains the same)
  { icon: Zap, label: "Notfall-Termin", color: "#F97316" }, // Replaced 'bg-orange-500' with hex
  { icon: Car, label: "Mobile Service", color: "#3B82F6" },
  { icon: Gift, label: "Gutscheine", color: "#A855F7" },
  { icon: Heart, label: "Favoriten", color: "#EC4899" },
  { icon: Sparkles, label: "Neue Braider", color: "#F59E0B" },
];

// Type definitions
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

type PopularStyle = {
  id: number;
  name: string;
  price: string;
  duration: string;
  image: string;
};

// --- Refactored Component ---

export function HomeScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const navigation = useNavigation<any>(); // Use 'useNavigation' from '@react-navigation/native' with loose typing for route names
  const { tokens, user } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;

  const displayName = user?.firstName ? `${user.firstName}! 👋` : user?.email ? `${user.email}` : "Willkommen bei";
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email ? user.email[0].toUpperCase() : "U");

  const [locationLabel, setLocationLabel] = useState<string>("Standort wird ermittelt...");
  const [nearby, setNearby] = useState<NearbyItem[] | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  const formatPrice = useMemo(() => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }), []);

  // Use useCallback for async handlers
  const initFavStatus = useCallback(async (currentNearby: NearbyItem[] | null) => {
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
    let cityLabel = 'Mein Standort';
    
    // Reverse Geocoding (RN often uses a dedicated library, but fetch works for Nominatim)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const resp = await fetch(url);
      const data = await resp.json().catch(() => null);
      const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;
      const state = data?.address?.state || data?.address?.region;
      cityLabel = [city, state].filter(Boolean).join(', ') || cityLabel;
    } catch {
      // Ignore geocoding failure, keep 'Mein Standort'
    } finally {
      setLocationLabel(cityLabel);
    }

    // API Call
    try {
      const res = await http.get<{ items: NearbyItem[] }>(`/providers/nearby`, { params: { lat: latitude, lon: longitude, radiusKm: 25, limit: 10 } });
      const items = res.data?.items ?? [];
      setNearby(items);
      // Re-initialize favorites after loading nearby
      initFavStatus(items);
    } catch (e: any) {
      setNearbyError(e?.message || 'Konnte nahegelegene Anbieter nicht laden');
      setNearby([]);
    } finally {
      setNearbyLoading(false);
    }
  }, [initFavStatus]);

  const getLocation = useCallback(() => {
    setLocationLabel("Standort wird ermittelt...");
    setNearbyError(null);
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchNearbyData(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationLabel('Standort deaktiviert');
        setNearbyError('Standortzugriff erforderlich.');
        setNearby([]);
        // Optional: Prompt user to enable location
        // Linking.openSettings(); // For prompting settings open
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [fetchNearbyData]);

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
      navigation.navigate("Login"); // Adjust route name
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
    } catch (err: any) {
      // Revert on failure
      setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
      const msg = err?.message || "Aktion fehlgeschlagen";
      // Replacement for toast.error
      showMessage({
        message: "Fehler",
        description: msg,
        type: "danger",
      });
    }
  };

  const renderPopularStyleItem = ({ item }: { item: PopularStyle }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("Search")} // Adjust route name
      style={styles.popularStyleCard}
    >
      <View style={styles.popularStyleImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.popularStyleImage}
          // Fallback logic for Image is usually handled by onError or a custom wrapper
        />
        <View style={styles.imageOverlay} />
        <View style={styles.popularStyleTextContainer}>
          <Text style={styles.popularStyleName}>{item.name}</Text>
          <View style={styles.popularStyleDetails}>
            <Text style={styles.popularStylePrice}>{item.price}</Text>
            <View style={styles.popularStyleDuration}>
              <Clock size={12} color="#fff" />
              <Text style={styles.popularStyleDurationText}>{item.duration}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNearbyBraider = ({ item: braider }: { item: NearbyItem }) => (
    <Card style={styles.nearbyBraiderCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ProviderDetail", { id: braider.id })} // Adjust route name
        style={styles.nearbyBraiderTouchable}
      >
        <TouchableOpacity
          onPress={() => handleToggleFavorite(braider.id)}
          style={styles.favoriteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={20}
            color={favorites.includes(braider.id) ? "#EC4899" : "#9CA3AF"} // pink-500 : gray-400
            fill={favorites.includes(braider.id) ? "#EC4899" : "none"}
          />
        </TouchableOpacity>

        <View style={styles.nearbyBraiderContent}>
          <View style={styles.avatarContainer}>
            <Avatar size={64} style={styles.braiderAvatar}>
              <Image
                source={{ uri: braider.imageUrl || "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" }}
                style={styles.braiderImage}
              />
            </Avatar>
            {braider.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.braiderDetails}>
            <Text style={styles.braiderName} numberOfLines={1}>{braider.name}</Text>
            {braider.business && (
              <Text style={styles.braiderBusiness} numberOfLines={1}>{braider.business}</Text>
            )}
            <View style={styles.ratingRow}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{Math.round((braider.rating || 0) * 10) / 10}</Text>
              <Text style={styles.reviewCount}>({braider.reviews || 0})</Text>
            </View>
            <View style={styles.distanceRow}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.distanceText}>{braider.distanceKm?.toFixed(1)} km entfernt</Text>
            </View>
            <View style={styles.specialtiesRow}>
              {(braider.specialties || []).slice(0, 3).map((specialty, idx) => (
                <Badge key={idx} variant="secondary" textStyle={styles.specialtyBadgeText}>
                  {specialty}
                </Badge>
              ))}
            </View>
            <View style={styles.priceAndAvailability}>
              <Text style={styles.priceText}>
                {braider.priceFromCents != null ? `ab ${formatPrice.format((braider.priceFromCents || 0) / 100)}` : 'Preis auf Anfrage'}
              </Text>
              {braider.available && (
                <Badge variant="success" textStyle={styles.availableBadgeText}>
                  Verfügbar heute
                </Badge>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
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
                  <Text style={styles.greetingText}>Hallo,</Text>
                  <Text style={styles.displayName}>{displayName}</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.greetingText}>Willkommen bei</Text>
                <Text style={styles.displayName}>HairConnekt 👋</Text>
              </View>
            )}
            <View style={styles.headerActions}>
              {!isAuthenticated && (
                <Button
                  size="small"
                  variant="outline"
                  onPress={() => navigation.navigate("Login")}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                  icon={<User size={16} color="#8B4513" style={{ marginRight: 4 }} />}
                >
                  Anmelden
                </Button>
              )}
              {isAuthenticated && (
                <TouchableOpacity style={styles.notificationButton}>
                  <Bell size={24} color="#4B5563" />
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
            <MapPin size={16} color="#4B5563" />
            <Text style={styles.locationText}>{locationLabel}</Text>
            <ChevronRight size={16} color="#4B5563" />
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            style={styles.searchBarWrapper}
            activeOpacity={1} // Prevent visual change on press
          >
            <Input
              placeholder="Suche nach Styles, Braiders, Salons..."
              editable={false} // ReadOnly in web -> editable={false} in RN
              style={styles.searchBarInput}
              leftIcon={<Filter size={20} color="#9CA3AF" />}
            />
            {/* The right filter button from web is often simplified or integrated into the search screen */}
            {/* Keeping it separate for a direct refactor */}
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#8B4513" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Verification Banner */}
        {isAuthenticated && (user?.emailVerified === false || user?.phoneVerified === false) && (
          <Card style={styles.verificationCard}>
            <View style={styles.verificationContent}>
              <ShieldAlert size={20} color="#D97706" />
              <View style={styles.verificationTextWrapper}>
                <Text style={styles.verificationText}>
                  Bitte verifiziere {user?.emailVerified === false ? "deine E-Mail" : "deine Telefonnummer"}, um alle Funktionen zu nutzen.
                </Text>
                <Button
                  size="small"
                  onPress={() => navigation.navigate("Verify")}
                  style={styles.verifyButton}
                  textStyle={styles.verifyButtonText}
                >
                  Jetzt verifizieren
                </Button>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <FlatList
            data={quickActions}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.label === "Notfall-Termin") {
                    navigation.navigate("Search", { screen: 'Search', params: { urgent: true } });
                  } else if (item.label === "Mobile Service") {
                    navigation.navigate("Search", { screen: 'Search', params: { mobileService: true } });
                  } else if (item.label === "Gutscheine") {
                    navigation.navigate("Vouchers");
                  } else if (item.label === "Favoriten") {
                    navigation.navigate("Favorites");
                  } else if (item.label === "Neue Braider") {
                    navigation.navigate("Search", { screen: 'Search', params: { newProviders: true } });
                  }
                }}
              >
                <View style={[styles.quickActionButton, { backgroundColor: item.color }]}>
                  <item.icon size={24} color="#fff" />
                </View>
                <Text style={styles.quickActionLabel}>{item.label}</Text>
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
            <Text style={styles.sectionTitle}>Beliebte Styles</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllStyles")}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>Alle ansehen</Text>
              <ChevronRight size={16} color="#8B4513" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularStyles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPopularStyleItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularStylesList}
          />
        </View>

        {/* Nearby Braiders */}
        <View style={styles.nearbyBraidersSection}>
          <Text style={styles.sectionTitle}>Braiders in deiner Nähe</Text>
          {nearbyLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#8B4513" />
              <Text style={styles.loadingText}>Lade nahegelegene Anbieter...</Text>
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
              <Text style={styles.noDataText}>Keine Braider in deiner Nähe gefunden.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

// Cast to any to allow non-standard style properties like gap while we iteratively fix styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
  },
  scrollViewContent: {
    paddingBottom: 80, // Space for a potential bottom tab bar
  },
  // --- Header Styles ---
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initialsAvatar: {
    backgroundColor: '#8B4513', // brown color
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: '600',
  },
  greetingText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButton: {
    borderColor: '#8B4513',
    backgroundColor: '#fff',
  },
  loginButtonText: {
    color: '#8B4513',
    fontSize: 14,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B', // Red
    borderRadius: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    color: '#4B5563', // gray-700
    fontSize: 14,
  },
  searchBarWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchBarInput: {
    paddingLeft: 40, // Make space for the left icon
    height: 48,
    borderRadius: 12,
  },
  filterButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },

  // --- Verification Banner ---
  verificationCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFFBEB', // amber-50
    borderColor: '#FDE68A', // amber-200
    borderWidth: 1,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  verificationTextWrapper: {
    flex: 1,
  },
  verificationText: {
    fontSize: 14,
    color: '#78350F', // amber-900
    marginBottom: 8,
  },
  verifyButton: {
    backgroundColor: '#D97706', // amber-600
    alignSelf: 'flex-start',
    height: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
  },

  // --- Quick Actions ---
  quickActionsContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 16,
  },
  quickActionsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 72, // Fixed width for action item
  },
  quickActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#4B5563', // gray-700
    textAlign: 'center',
  },

  // --- Popular Styles ---
  popularStylesSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: '#8B4513',
    fontSize: 14,
  },
  popularStylesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  popularStyleCard: {
    width: 160, // w-40
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  popularStyleImageContainer: {
    height: 192, // h-48
    position: 'relative',
  },
  popularStyleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Gradient from black/60
  },
  popularStyleTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  popularStyleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  popularStyleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularStylePrice: {
    fontSize: 12,
    color: '#fff',
  },
  popularStyleDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularStyleDurationText: {
    fontSize: 12,
    color: '#fff',
  },

  // --- Nearby Braiders ---
  nearbyBraidersSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444', // red-600
    paddingVertical: 10,
  },
  nearbyList: {
    gap: 12,
    marginTop: 4,
  },
  nearbyBraiderCard: {
    padding: 0, // Card component is assumed to handle basic container styling
  },
  nearbyBraiderTouchable: {
    padding: 16,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  nearbyBraiderContent: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  braiderAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  braiderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#3B82F6', // blue-500
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  braiderDetails: {
    flex: 1,
    minWidth: 0,
  },
  braiderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  braiderBusiness: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  specialtyBadgeText: {
    fontSize: 12,
  },
  priceAndAvailability: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  availableBadgeText: {
    fontSize: 12,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
}) as any;