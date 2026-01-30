import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { clientBraiderApi } from '@/api/clientBraider';
import { IBraider } from '@/domain/models/braider';
import { colors } from '@/theme/tokens'; // Assuming tokens available
import { normalizeUrl } from '../../utils/url';

// Mock fallback for now if ID fetch fails or while building
// But we aim to use real data.
// Removing hardcoded `providerData` object and using state.

export default function ProviderProfile() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<IBraider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'gallery' | 'reviews'>('overview');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (!id) {
      setError("Kein Provider gefunden.");
      setLoading(false);
      return;
    }

    async function loadProfile() {
      setLoading(true);
      try {
        const data = await clientBraiderApi.getProfile(id);
        setProvider(data);
      } catch (err) {
        setError("Fehler beim Laden des Profils.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();

    // Simulate favorite status init
    setIsFavorite(false);
  }, [id]);

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !provider) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>{error || "Provider nicht gefunden"}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#8B4513' }}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Header / Hero Image */}
        <View style={styles.heroWrapper}>
          <Image
            source={{ uri: normalizeImageUrl(provider.coverImage || provider.imageUrl) }}
            style={styles.heroImage}
            testID="hero-image"
          />

          {/* Overlay Actions */}
          <SafeAreaView style={styles.headerOverlay}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
                <Ionicons name="arrow-back" size={22} color="#111827" />
              </TouchableOpacity>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => Alert.alert('Teilen')} style={styles.circleBtn}>
                  <Ionicons name="share-social-outline" size={20} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsFavorite((p) => !p)} style={styles.circleBtn}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#F43F5E' : '#111827'} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {/* Centered Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={
                (provider.profileImage || provider.imageUrl)
                  ? {
                    uri: (() => {
                      const url = normalizeImageUrl(provider.profileImage || provider.imageUrl);
                      console.log('ProviderProfile avatar:', { raw: provider.profileImage, normalized: url });
                      return url;
                    })()
                  }
                  : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=random` }
              }
              style={styles.avatarImage}
              testID="avatar-image"
            />
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>
        </View>

        {/* Title & Rating - Centered */}
        <View style={styles.section}>
          <Text style={styles.title}>{provider.businessName || provider.name}</Text>
          <Text style={styles.subtitle}>von {provider.name}</Text>

          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(provider.rating) ? 'star' : 'star-outline'}
                size={16}
                color={i < Math.floor(provider.rating) ? '#F59E0B' : '#D1D5DB'}
                style={{ marginHorizontal: 1 }}
              />
            ))}
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewsText}>({provider.reviewCount} Bewertungen)</Text>
          </View>

          <TouchableOpacity style={styles.distanceRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.distanceText}>
              {provider.distanceKm ? `${provider.distanceKm.toFixed(1)} km entfernt` : 'Entfernung unbekannt'}
            </Text>
            <Text style={styles.routeText}>Route</Text>
          </TouchableOpacity>
        </View>

        {/* Badges - Centered */}
        <View style={[styles.section, styles.badgesRow]}>
          {(provider.badges || []).map((badge, idx) => (
            <View key={idx} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={[styles.section, styles.statsRow]}>
          {(provider.stats || []).map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>


        {/* Tabs */}
        <View style={styles.tabsList}>
          {(['overview', 'services', 'gallery', 'reviews'] as const).map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}>
              <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {tab === 'overview' ? 'Überblick' : tab === 'services' ? 'Services' : tab === 'gallery' ? 'Galerie' : 'Bewertungen'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <View style={styles.galleryContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Über mich</Text>
              <Text style={styles.cardText}>{provider.bio || 'Keine Beschreibung verfügbar.'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Spezialisierungen</Text>
              {(provider.badges || []).map((badge, i) => (
                <View key={i} style={styles.rowWithIcon}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.cardText, { marginLeft: 8 }]}>{badge}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sprachen</Text>
              <View style={styles.badgesRow}>
                {(provider.languages || []).map((lang, i) => (
                  <View key={i} style={[styles.badge, styles.badgeOutline, { marginRight: 8 }]}>
                    <Text style={[styles.badgeText, { color: '#374151' }]}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Öffnungszeiten</Text>
              {(provider.hours || []).map((h, i) => (
                <View key={i} style={styles.rowBetween}>
                  <Text style={[styles.cardText, h.day === 'Montag' && styles.boldText]}>{h.day}</Text>
                  <Text style={[styles.cardText, h.hours === 'Geschlossen' ? styles.closedText : styles.boldText]}>{h.hours}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.servicesContainer}>
            {(provider.services || []).map((cat, idx) => (
              <View key={idx} style={styles.categorySection}>
                <Text style={styles.categoryHeader}>{cat.category}</Text>

                {cat.items.map((service, sIdx) => {
                  const active = selectedServices.includes(service.name);
                  return (
                    <TouchableOpacity
                      key={sIdx}
                      onPress={() => toggleService(service.name)}
                      style={[styles.serviceCard, active && styles.serviceCardActive]}
                    >
                      <View style={styles.serviceHeaderRow}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.servicePrice}>{service.price}</Text>
                      </View>

                      {service.description ? (
                        <Text style={styles.serviceDescription}>{service.description}</Text>
                      ) : null}

                      <View style={styles.serviceMetaRow}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.serviceMetaText}>{service.duration}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            {(!provider.services || provider.services.length === 0) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Keine Services verfügbar.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'gallery' && (
          <View style={styles.galleryContainer}>
            <Text style={styles.sectionHeader}>
              Galerie ({(provider.portfolioImages || []).length})
            </Text>
            <View style={styles.galleryGrid}>
              {(provider.portfolioImages || []).map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri: normalizeUrl(uri) }}
                  style={styles.galleryImage}
                  testID="gallery-image"
                  resizeMode="cover"
                />
              ))}
            </View>
            {(!provider.portfolioImages || provider.portfolioImages.length === 0) && (
              <Text style={styles.emptyStateText}>Noch keine Bilder hochgeladen.</Text>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.galleryContainer}>
            <Text style={styles.sectionHeader}>Bewertungen ({provider.reviewCount})</Text>

            {(provider.reviews || []).map((review) => (
              <View key={review.id} style={[styles.reviewCard, styles.card]}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowWithIcon}>
                    <Ionicons name="person-circle-outline" size={24} color="#9CA3AF" />
                    <Text style={[styles.boldText, { marginLeft: 8 }]}>{review.name}</Text>
                  </View>
                  <Text style={styles.cardText}>{review.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 4, marginBottom: 6 }}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.cardText}>{review.text}</Text>
                {review.style && (
                  <View style={[styles.badge, styles.badgeOutline, { alignSelf: 'flex-start', marginTop: 8 }]}>
                    <Text style={[styles.badgeText, { color: '#8B4513' }]}>{review.style}</Text>
                  </View>
                )}
              </View>
            ))}
            {(!provider.reviews || provider.reviews.length === 0) && (
              <Text style={styles.emptyStateText}>Noch keine Bewertungen.</Text>
            )}
          </View>
        )}

        {/* Bottom Actions */}
        <View style={[styles.card, styles.bottomBar]}>
          <View style={styles.rowWithIcon}>
            <Text style={styles.cardText}>Preise starten ab</Text>
            <Text style={styles.priceBig}>{provider.priceFromCents ? `€${provider.priceFromCents / 100}` : 'Anfrage'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => Alert.alert('Nachricht')}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
              <Text style={[styles.btnText]}>Nachricht</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('Booking', { id: provider.id })}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>Termin buchen</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}



const THEME = '#8B4513';
const COLOR_ROUTE = '#D97706'; // Example orange/brown for Route text

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroWrapper: {
    position: 'relative',
    marginBottom: 50, // Making space for the overlapping avatar
  },
  heroImage: {
    width: '100%',
    height: 220, // Taller image as per design
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10, // Adjust for status bar if not handled by SafeAreaView automatically in absolute mode
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -36, // Half of 72 to overlap
    alignSelf: 'center',
    width: 84, // Slightly larger border wrapper
    height: 84,
    borderRadius: 42,
    backgroundColor: '#fff', // White border effect
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: {
    marginTop: 16,
    alignItems: 'center', // Center everything in main sections
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 6,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    color: '#4B5563',
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_ROUTE,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  badge: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: 12,
    paddingVertical: 6, // Slightly taller pill
    borderRadius: 20,
  },
  badgeOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '23%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Minimal shadow for clean look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 15,
    color: THEME,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabsList: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Spread tabs?? Or pill container? Design looks like segmented
    backgroundColor: '#F3F4F6', // Light gray background for the bar
    borderRadius: 24, // High radius for pill shape container
    padding: 4,
    marginTop: 24,
    marginHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  boldText: {
    fontWeight: '600',
    color: '#111827',
  },
  closedText: {
    fontWeight: '600',
    color: '#EF4444',
  },
  galleryContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  servicesContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceCardActive: {
    borderColor: THEME,
    backgroundColor: '#FDF8F6',
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  serviceMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  servicePrice: {
    fontSize: 15, // Matches design "45 - 65"
    fontWeight: '700',
    color: THEME,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // gap property support is inconsistent in older RN, use margins
  },
  galleryImage: {
    width: '31%', // Fits 3 items with margins (31*3 = 93% + 2*2% margins = 97%)
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    marginRight: '2%', // Add margin for spacing
    backgroundColor: '#e5e7eb', // Fallback color
  },
  ratingBig: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME,
    marginRight: 8,
  },
  reviewCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  bottomBar: {
    marginTop: 24,
    marginBottom: 16, // Extra margin at bottom
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    // Make bottom bar simpler as per screenshot?
    // Screenshot shows simple "ab €35" and Buttons.
    // Use card style but removed background color/border to blend often?
    // Screenshot has separate container.
    // Keeping "card" style is fine, but maybe flatter.
    shadowOpacity: 0.05,
    elevation: 4,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 10,
  },
  btnPrimary: {
    backgroundColor: THEME,
    marginLeft: 0, // Reset
  },
  btnText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#fff',
  },
  priceBig: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME,
    marginLeft: 6,
  },
});