import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { clientBraiderApi } from '@/api/clientBraider';
import { IBraider } from '@/domain/models/braider';
import { colors } from '@/theme/tokens'; // Assuming tokens available

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{provider.businessName || provider.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => Alert.alert('Teilen')} style={styles.headerIconButton}>
            <Ionicons name="share-outline" size={20} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFavorite((p) => !p)} style={styles.headerIconButton}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#F43F5E' : '#111827'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image + Avatar */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: provider.coverImage || provider.imageUrl }} style={styles.heroImage} />
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: provider.profileImage || provider.imageUrl }} style={styles.avatarImage} />
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            )}
          </View>
        </View>

        {/* Title & Rating */}
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
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewsText}>({provider.reviewCount} Bewertungen)</Text>
          </View>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={16} color="#8B4513" />
            <Text style={styles.distanceText}>{provider.address || (provider.distanceKm ? `${provider.distanceKm.toFixed(1)} km entfernt` : 'Entfernung unbekannt')}</Text>
          </View>
        </View>

        {/* Badges */}
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Über mich</Text>
            <Text style={styles.cardText}>{provider.bio || 'Keine Beschreibung verfügbar.'}</Text>

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Spezialisierungen</Text>
            {provider.specialties.map((s, i) => (
              <View key={i} style={styles.rowWithIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.cardText}>{s}</Text>
              </View>
            ))}

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Sprachen</Text>
            <View style={styles.badgesRow}>
              {(provider.languages || []).map((lang, i) => (
                <View key={i} style={[styles.badge, styles.badgeOutline]}>
                  <Text style={[styles.badgeText, { color: '#374151' }]}>{lang}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Öffnungszeiten</Text>
            {(provider.hours || []).map((h, i) => (
              <View key={i} style={styles.rowBetween}>
                <Text style={[styles.cardText, h.day === 'Montag' && styles.boldText]}>{h.day}</Text>
                <Text style={[styles.cardText, h.hours === 'Geschlossen' ? styles.closedText : styles.boldText]}>{h.hours}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.section}>
            {(provider.services || []).map((cat, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.cardTitle}>{cat.category}</Text>
                {cat.items.map((service, sIdx) => {
                  const active = selectedServices.includes(service.name);
                  return (
                    <TouchableOpacity key={sIdx} onPress={() => toggleService(service.name)} style={[styles.serviceItem, active && styles.serviceItemActive]}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.servicePrice}>{service.price}</Text>
                      </View>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                      <View style={styles.rowWithIcon}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.serviceMeta}>{service.duration}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'gallery' && (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Portfolio</Text>
              <Text style={styles.cardText}>({(provider.portfolioImages || []).length} Bilder)</Text>
            </View>
            <View style={styles.galleryGrid}>
              {(provider.portfolioImages || []).map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.galleryImage} />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bewertungsübersicht</Text>
            <View style={styles.rowWithIcon}>
              <Text style={styles.ratingBig}>{provider.rating}</Text>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.cardText}>{provider.reviewCount} Gesamtbewertungen</Text>
            </View>

            {(provider.reviews || []).map((review) => (
              <View key={review.id} style={[styles.reviewCard, styles.card]}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowWithIcon}>
                    <Ionicons name="person-circle-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.boldText}>{review.name}</Text>
                  </View>
                  <Text style={styles.cardText}>{review.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                  ))}
                </View>
                <Text style={[styles.cardText, { marginTop: 6 }]}>{review.text}</Text>
                <View style={[styles.badge, styles.badgeOutline, { alignSelf: 'flex-start', marginTop: 8 }]}>
                  <Text style={[styles.badgeText, { color: '#8B4513' }]}>{review.style}</Text>
                </View>
              </View>
            ))}
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
    </SafeAreaView>
  );
}

const THEME = '#8B4513';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#F3F4F6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  heroWrapper: {
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -24,
    left: 16,
    width: 72,
    height: 72,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: {
    marginTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 6,
    marginRight: 6,
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#6B7280',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    color: THEME,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
    marginTop: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
  },
  tabButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    color: '#374151',
  },
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  boldText: {
    fontWeight: '600',
    color: '#111827',
  },
  closedText: {
    fontWeight: '600',
    color: '#EF4444',
  },
  serviceItem: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  serviceItemActive: {
    borderColor: THEME,
    backgroundColor: '#F8F1EC',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  serviceMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryImage: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  ratingBig: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME,
    marginRight: 6,
  },
  reviewCard: {
    marginTop: 10,
  },
  bottomBar: {
    marginTop: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  btnPrimary: {
    backgroundColor: THEME,
    marginLeft: 8,
  },
  btnText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#fff',
  },
  priceBig: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME,
    marginLeft: 6,
  },
});