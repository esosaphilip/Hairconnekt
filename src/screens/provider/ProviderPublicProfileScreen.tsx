import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Clipboard, // For Share/Copy link functionality
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { Badge } from '../../components/badge';
import Avatar, { AvatarImage } from '../../components/avatar';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

// --- Static Data (Replicated) ---
const services = [
  { id: 1, name: "Box Braids", duration: "3-4 Std.", price: "€85 - €95", popular: true, },
  { id: 2, name: "Knotless Braids", duration: "4-5 Std.", price: "€95 - €110", popular: true, },
  { id: 3, name: "Cornrows", duration: "2-3 Std.", price: "€55 - €75", popular: false, },
  { id: 4, name: "Senegalese Twists", duration: "4-5 Std.", price: "€95 - €115", popular: false, },
];

const portfolio = [
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
  "https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400",
  "https://images.unsplash.com/photo-1605980413361-8f8b5630a0a7?w=400",
];

const reviews = [
  { id: 1, client: "Sarah M.", rating: 5, text: "Fantastisch! Meine Box Braids sehen perfekt aus und Aisha war super professionell.", date: "vor 2 Tagen", service: "Box Braids" },
  { id: 2, client: "Maria K.", rating: 5, text: "Sehr professionell und freundlich. Komme definitiv wieder!", date: "vor 5 Tagen", service: "Cornrows" },
];

// --- Main Component ---
export function ProviderPublicProfileScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'services' | 'portfolio' | 'reviews'

  // Function to handle sharing link
  const handleShare = () => {
    Clipboard.setString("https://app.example.com/aisha-braiding-studio");
    Alert.alert("Link kopiert!", "Der Profil-Link wurde in die Zwischenablage kopiert.");
  };

  // --- Tab Content Renderers ---

  const renderAboutTab = () => (
    <View style={styles.tabContentContainer}>
      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Über uns</Text>
        <Text style={styles.bodyText}>
          Hallo! Ich bin Aisha und habe über 10 Jahre Erfahrung mit afrikanischen
          Flechtfrisuren. Meine Leidenschaft ist es, jedem Kunden einen
          individuellen Look zu kreieren, der perfekt zu ihm passt.
        </Text>
      </Card>

      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Spezialisierungen</Text>
        <View style={styles.badgeWrap}>
          <Badge title="Box Braids" variant="secondary" />
          <Badge title="Cornrows" variant="secondary" />
          <Badge title="Senegalese Twists" variant="secondary" />
          <Badge title="Knotless Braids" variant="secondary" />
          <Badge title="Passion Twists" variant="secondary" />
        </View>
      </Card>

      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Was uns auszeichnet</Text>
        <View style={styles.featureList}>
          {[
            "Über 10 Jahre Erfahrung",
            "Nur hochwertige Produkte",
            "Entspannte Atmosphäre",
            "Kostenlose Nachbesserung innerhalb 7 Tagen",
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check" size={20} color={COLORS.success} style={styles.checkIcon} />
              <Text style={styles.bodyText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.tabCard}>
        <Text style={styles.cardTitle}>Öffnungszeiten</Text>
        <View style={styles.hoursList}>
          {[
            { day: 'Montag', time: '9:00 - 20:00', closed: false },
            { day: 'Dienstag', time: '9:00 - 20:00', closed: false },
            { day: 'Mittwoch', time: '9:00 - 20:00', closed: false },
            { day: 'Donnerstag', time: '9:00 - 20:00', closed: false },
            { day: 'Freitag', time: '9:00 - 20:00', closed: false },
            { day: 'Samstag', time: '9:00 - 20:00', closed: false },
            { day: 'Sonntag', time: 'Geschlossen', closed: true },
          ].map((item, index) => (
            <View key={index} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{item.day}</Text>
              <Text style={item.closed ? styles.hoursTimeClosed : styles.hoursTimeOpen}>
                {item.time}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.tabContentContainer}>
      {services.map((service) => (
        <Card key={service.id} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceInfo}>
              <View style={styles.serviceTitleRow}>
                <Text style={styles.serviceName}>{service.name}</Text>
                {service.popular && (
                  <Badge title="Beliebt" color="red" />
                )}
              </View>
              <Text style={styles.serviceDuration}>{service.duration}</Text>
            </View>
            <Text style={styles.servicePrice}>{service.price}</Text>
          </View>
          <Button
            title="Buchen"
            size="sm"
            onPress={() => navigation.navigate("BookingFlowScreen", { serviceId: service.id })}
            style={styles.bookButton}
          />
        </Card>
      ))}
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={styles.portfolioGrid}>
      {portfolio.map((image, index) => (
        <TouchableOpacity key={index} style={styles.portfolioItem} onPress={() => { /* View Image Modal */ }}>
          <Image
            source={{ uri: image }}
            style={styles.portfolioImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContentContainer}>
      {reviews.map((review) => (
        <Card key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View>
              <Text style={styles.reviewClient}>{review.client}</Text>
              <View style={styles.starRow}>
                {[...Array(review.rating)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={12}
                    color={COLORS.amber}
                    fill={COLORS.amber}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
          <Badge title={review.service} variant="secondary" style={styles.reviewServiceBadge} />
          <Text style={styles.reviewText}>{review.text}</Text>
        </Card>
      ))}
      <Button
        title="Alle Bewertungen anzeigen"
        variant="outline"
        onPress={() => navigation.navigate("ProviderReviewsScreen")}
        style={styles.viewAllReviewsButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header (Always Visible) */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Öffentliches Profil</Text>
          <IconButton name="share-2" onPress={handleShare} />
        </View>
        <Text style={styles.headerSubtitle}>So sehen dich potenzielle Kunden</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileSummary}>
            <Avatar size={80}>
              <AvatarImage uri="https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=200" />
            </Avatar>
            <View style={styles.summaryTextContainer}>
              <View style={styles.businessTitleRow}>
                <Text style={styles.businessName}>Aisha's Braiding Studio</Text>
                <TouchableOpacity onPress={() => { /* Navigate to edit profile/dashboard */ }} style={{ marginLeft: SPACING.xs }}>
                   {/* For provider's own screen, show link to dashboard/edit */}
                   <Icon name="edit" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.ownerName}>von Aisha Mensah</Text>
              
              <View style={styles.badgeRow}>
                <Badge title="Pro" color="amber" />
                <Badge title="Verifiziert" variant="outline" />
              </View>
              
              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color={COLORS.amber} fill={COLORS.amber} />
                <Text style={styles.ratingValue}>4.8</Text>
                <Text style={styles.reviewCountText}>(234 Bewertungen)</Text>
              </View>
            </View>
          </View>

          <View style={styles.locationInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-pin" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>Kantstraße 42, 10625 Berlin (2.3 km)</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="clock" size={16} color={COLORS.textSecondary} />
              <Text style={styles.openText}>Geöffnet · Schließt um 20:00</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button title="Jetzt buchen" onPress={() => navigation.navigate("BookingFlowScreen")} style={styles.bookNowButton} />
            <IconButton name="message-circle" onPress={() => navigation.navigate("ChatScreen")} style={styles.iconButtonOutline} color={COLORS.textSecondary} />
            <IconButton name="heart" onPress={() => { /* Toggle favorite */ }} style={styles.iconButtonOutline} color={COLORS.textSecondary} />
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsList}>
            {['about', 'services', 'portfolio', 'reviews'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabTrigger, activeTab === tab && styles.tabTriggerActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'about' && 'Über'}
                  {tab === 'services' && 'Services'}
                  {tab === 'portfolio' && 'Portfolio'}
                  {tab === 'reviews' && 'Bewertungen'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContentWrapper}>
            {activeTab === 'about' && renderAboutTab()}
            {activeTab === 'services' && renderServicesTab()}
            {activeTab === 'portfolio' && renderPortfolioTab()}
            {activeTab === 'reviews' && renderReviewsTab()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Fixed Header Styles ---
  fixedHeader: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Profile Header ---
  scrollContent: {
    paddingBottom: SPACING.lg || 24,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xs, // Separator from tabs
  },
  profileSummary: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryTextContainer: {
    flex: 1,
  },
  businessTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontSize: FONT_SIZES.h3 || 20,
    fontWeight: 'bold',
  },
  ownerName: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  ratingValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  reviewCountText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  locationInfo: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  openText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.success || '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bookNowButton: {
    flex: 1,
    backgroundColor: COLORS.primary || '#8B4513',
    height: 48,
  },
  // --- Tabs Styles ---
  tabsContainer: {
    backgroundColor: COLORS.white,
    // No top margin needed since it follows the profile header
  },
  tabsList: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  tabTrigger: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabTriggerActive: {
    borderBottomColor: COLORS.primary || '#8B4513',
  },
  tabText: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContentWrapper: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  // --- About Tab Styles ---
  tabContentContainer: {
    gap: SPACING.md,
  },
  tabCard: {
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  bodyText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  featureList: {
    gap: SPACING.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  checkIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  hoursList: {
    gap: SPACING.xs,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: FONT_SIZES.body || 14,
  },
  hoursDay: {
    color: COLORS.textSecondary,
  },
  hoursTimeOpen: {
    color: COLORS.text,
  },
  hoursTimeClosed: {
    color: COLORS.danger || '#EF4444',
  },
  // --- Services Tab Styles ---
  serviceCard: {
    padding: SPACING.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  serviceName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  serviceDuration: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  servicePrice: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.primary || '#8B4513',
    fontWeight: 'bold',
  },
  bookButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  // --- Portfolio Tab Styles ---
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  portfolioItem: {
    width: (Dimensions.get('window').width - SPACING.md * 2 - SPACING.sm) / 2, // Calculate for 2 columns
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  // --- Reviews Tab Styles ---
  reviewCard: {
    padding: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewClient: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  reviewDate: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  reviewServiceBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
  },
  viewAllReviewsButton: {
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
  }
});