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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// --- Mock Data ---
const providerData = {
  id: '1',
  name: 'Aisha Mohammed',
  business: "Aisha's Braiding Studio",
  rating: 4.8,
  reviews: 234,
  address: 'Westenhellweg 102-106, 44137 Dortmund',
  distance: '1.2 km',
  verified: true,
  coverImage:
    'https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  profileImage:
    'https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
  badges: ['Salon', 'Mobil verfügbar', 'Verifiziert'],
  stats: [
    { label: 'Termine', value: '234' },
    { label: 'Jahre', value: '8' },
    { label: 'Response', value: '< 1 Std.' },
    { label: 'Empfehlung', value: '98%' },
  ],
  bio: "Willkommen bei Aisha's Braiding Studio! Mit über 8 Jahren Erfahrung im Haar-Flechten spezialisiere ich mich auf traditionelle und moderne Flechtechniken. Ich arbeite mit natürlichen Haarprodukten und lege großen Wert auf die Gesundheit Ihrer Haare.",
  specialties: ['Box Braids Expertin', 'Kinderfreundlich', 'Natürliche Haarpflege'],
  languages: ['Deutsch', 'Englisch', 'Französisch'],
  hours: [
    { day: 'Montag', hours: '09:00 - 18:00' },
    { day: 'Dienstag', hours: '09:00 - 18:00' },
    { day: 'Mittwoch', hours: '09:00 - 18:00' },
    { day: 'Donnerstag', hours: '09:00 - 20:00' },
    { day: 'Freitag', hours: '09:00 - 20:00' },
    { day: 'Samstag', hours: '10:00 - 16:00' },
    { day: 'Sonntag', hours: 'Geschlossen' },
  ],
};

type ServiceItem = { name: string; duration: string; price: string; description: string };
type ServiceCategory = { category: string; items: ServiceItem[] };

const services: ServiceCategory[] = [
  {
    category: 'Box Braids',
    items: [
      {
        name: 'Classic Box Braids',
        duration: '3-4 Std.',
        price: '€45 - €65',
        description: 'Traditionelle Box Braids in verschiedenen Größen',
      },
      {
        name: 'Knotless Box Braids',
        duration: '4-5 Std.',
        price: '€55 - €75',
        description: 'Schonende Knotless-Technik für natürlichen Look',
      },
    ],
  },
  {
    category: 'Cornrows',
    items: [
      {
        name: 'Simple Cornrows',
        duration: '2-3 Std.',
        price: '€35 - €50',
        description: 'Klassische Cornrows in geraden Linien',
      },
      {
        name: 'Design Cornrows',
        duration: '3-4 Std.',
        price: '€50 - €70',
        description: 'Kreative Muster und Designs',
      },
    ],
  },
];

const portfolioImages: string[] = [
  'https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
];

type Review = { id: number; name: string; rating: number; date: string; text: string; verified: boolean; style: string };
const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah M.',
    rating: 5,
    date: 'vor 2 Wochen',
    text:
      'Aisha ist fantastisch! Meine Box Braids sehen perfekt aus und sie war super schnell. Absolut empfehlenswert!',
    verified: true,
    style: 'Box Braids',
  },
  {
    id: 2,
    name: 'Lisa K.',
    rating: 5,
    date: 'vor 1 Monat',
    text:
      'Beste Braids ever! Super professionell, saubere Arbeit und sehr freundlich. Komme auf jeden Fall wieder!',
    verified: true,
    style: 'Knotless Braids',
  },
];

export default function ProviderProfile() {
  const navigation = useNavigation<any>();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'gallery' | 'reviews'>('overview');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    // Simulate favorite status init
    setIsFavorite(false);
  }, []);

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{providerData.business}</Text>
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
          <Image source={{ uri: providerData.coverImage }} style={styles.heroImage} />
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: providerData.profileImage }} style={styles.avatarImage} />
            {providerData.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            )}
          </View>
        </View>

        {/* Title & Rating */}
        <View style={styles.section}>
          <Text style={styles.title}>{providerData.business}</Text>
          <Text style={styles.subtitle}>von {providerData.name}</Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(providerData.rating) ? 'star' : 'star-outline'}
                size={16}
                color={i < Math.floor(providerData.rating) ? '#F59E0B' : '#D1D5DB'}
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={styles.ratingText}>{providerData.rating}</Text>
            <Text style={styles.reviewsText}>({providerData.reviews} Bewertungen)</Text>
          </View>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={16} color="#8B4513" />
            <Text style={styles.distanceText}>{providerData.distance} entfernt</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={[styles.section, styles.badgesRow]}>
          {providerData.badges.map((badge, idx) => (
            <View key={idx} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={[styles.section, styles.statsRow]}>
          {providerData.stats.map((stat, idx) => (
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
            <Text style={styles.cardText}>{providerData.bio}</Text>

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Spezialisierungen</Text>
            {providerData.specialties.map((s, i) => (
              <View key={i} style={styles.rowWithIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.cardText}>{s}</Text>
              </View>
            ))}

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Sprachen</Text>
            <View style={styles.badgesRow}>
              {providerData.languages.map((lang, i) => (
                <View key={i} style={[styles.badge, styles.badgeOutline]}>
                  <Text style={[styles.badgeText, { color: '#374151' }]}>{lang}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Öffnungszeiten</Text>
            {providerData.hours.map((h, i) => (
              <View key={i} style={styles.rowBetween}>
                <Text style={[styles.cardText, h.day === 'Montag' && styles.boldText]}>{h.day}</Text>
                <Text style={[styles.cardText, h.hours === 'Geschlossen' ? styles.closedText : styles.boldText]}>{h.hours}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.section}>
            {services.map((cat, idx) => (
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
              <Text style={styles.cardText}>({portfolioImages.length} Bilder)</Text>
            </View>
            <View style={styles.galleryGrid}>
              {portfolioImages.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.galleryImage} />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bewertungsübersicht</Text>
            <View style={styles.rowWithIcon}>
              <Text style={styles.ratingBig}>{providerData.rating}</Text>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.cardText}>{providerData.reviews} Gesamtbewertungen</Text>
            </View>

            {reviews.map((review) => (
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
            <Text style={styles.priceBig}>€35</Text>
          </View>
          <View style={styles.rowBetween}>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => Alert.alert('Nachricht')}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
              <Text style={styles.btnText}>Nachricht</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('Booking', { id: providerData.id })}>
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
  avatarImage: {
    borderColor: '#fff',
    borderRadius: 36,
    borderWidth: 3,
    height: 72,
    width: 72,
  },
  avatarWrapper: {
    bottom: -24,
    height: 72,
    left: 16,
    position: 'absolute',
    width: 72,
  },
  badge: {
    backgroundColor: THEME,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOutline: {
    backgroundColor: '#fff',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  boldText: {
    color: '#111827',
    fontWeight: '600',
  },
  bottomBar: {
    marginTop: 20,
  },
  btn: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    marginRight: 8,
  },
  btnPrimary: {
    backgroundColor: THEME,
    marginLeft: 8,
  },
  btnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    marginTop: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardText: {
    color: '#374151',
    fontSize: 13,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  closedText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  distanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  distanceText: {
    color: '#6B7280',
    fontSize: 13,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryImage: {
    aspectRatio: 1,
    borderRadius: 8,
    width: '31%',
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    padding: 6,
  },
  headerTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  heroImage: {
    borderRadius: 12,
    height: 180,
    width: '100%',
  },
  heroWrapper: {
    marginBottom: 16,
  },
  priceBig: {
    color: THEME,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 6,
  },
  ratingBig: {
    color: THEME,
    fontSize: 28,
    fontWeight: '800',
    marginRight: 6,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  ratingText: {
    color: '#111827',
    fontSize: 14,
    marginLeft: 6,
    marginRight: 6,
  },
  reviewCard: {
    marginTop: 10,
  },
  reviewsText: {
    color: '#6B7280',
    fontSize: 12,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rowWithIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  serviceDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  serviceItem: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 8,
    padding: 10,
  },
  serviceItemActive: {
    backgroundColor: '#F8F1EC',
    borderColor: THEME,
  },
  serviceMeta: {
    color: '#6B7280',
    fontSize: 12,
  },
  serviceName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  servicePrice: {
    color: THEME,
    fontSize: 16,
    fontWeight: '700',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    width: '23%',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 11,
  },
  statValue: {
    color: THEME,
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
  },
  tabButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#111827',
  },
  tabsList: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 20,
    padding: 4,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    bottom: -4,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 20,
  },
});