import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  Calendar,
} from 'lucide-react-native';

// Custom Components (assumed to be available)
import Text from '../components/Text';
import Button from '../components/Button';
import Card from '../components/Card';
import Avatar from '../components/avatar'; // Custom Avatar component
import { Badge } from '../components/badge'; // Custom Badge component
import { spacing } from '../theme/tokens';

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const AMBER_COLOR = '#FBBF24'; // fill-amber-400
const GRAY_300 = '#D1D5DB';
const GRAY_TEXT = '#6B7280';

// --- Mock Data (kept identical) ---
const reviews = [
  {
    id: 1,
    providerName: "Aisha Mohammed",
    providerBusiness: "Aisha's Braiding Studio",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "15. Okt 2025",
    service: "Box Braids",
    review: "Absolut fantastisch! Aisha ist sehr professionell und hat wunderschöne Box Braids gemacht. Ich komme definitiv wieder!",
    helpfulCount: 12,
  },
  {
    id: 2,
    providerName: "Fatima Hassan",
    providerBusiness: "Natural Hair Lounge",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "8. Okt 2025",
    service: "Cornrows",
    review: "Sehr zufrieden mit dem Ergebnis. Fatima nimmt sich Zeit und arbeitet sehr sorgfältig.",
    helpfulCount: 8,
  },
  {
    id: 3,
    providerName: "Lina Okafor",
    providerBusiness: null,
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 4,
    date: "1. Okt 2025",
    service: "Senegalese Twists",
    review: "Gute Arbeit, aber die Wartezeit war etwas länger als erwartet.",
    helpfulCount: 5,
  },
  {
    id: 4,
    providerName: "Sarah Williams",
    providerBusiness: "Braids & Beauty",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "24. Sep 2025",
    service: "Knotless Braids",
    review: "Perfekt! Die Braids sehen großartig aus und halten super.",
    helpfulCount: 15,
  },
  {
    id: 5,
    providerName: "Amina Johnson",
    providerBusiness: "Amina's Hair Art",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "18. Sep 2025",
    service: "Faux Locs",
    review: "Amina ist eine echte Künstlerin! Die Locs sind perfekt und sehen so natürlich aus.",
    helpfulCount: 10,
  },
];

export function MyReviewsScreen() {
  const navigation = useNavigation();

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const navigateTo = (screen: string) => {
    // @ts-ignore
    navigation.navigate(screen);
  };

  const avgRating = useMemo(() => {
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    ).toFixed(1);
  }, []);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? AMBER_COLOR : GRAY_300}
            // In RN, we use fill prop for Lucide icons' fill capability
            fill={star <= rating ? AMBER_COLOR : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const ReviewItem = ({ review }: { review: typeof reviews[0] }) => {
    const handlePress = () => {
      // Navigate to provider profile screen
      navigateTo(`ProviderProfile/${review.id}`);
    };

    return (
      <Card style={styles.reviewCard}>
        {/* Provider Info */}
        <Pressable
          style={styles.providerInfo}
          onPress={handlePress}
        >
          <Avatar style={styles.providerAvatar}>
            {/* ImageWithFallback replaced by standard Image */}
            <Image
              source={{ uri: review.providerImage }}
              style={styles.avatarImage}
            />
          </Avatar>
          <View style={styles.providerText}>
            <Text style={styles.providerName}>{review.providerName}</Text>
            {review.providerBusiness && (
              <Text style={styles.providerBusiness}>
                {review.providerBusiness}
              </Text>
            )}
          </View>
        </Pressable>

        {/* Rating & Date */}
        <View style={styles.ratingRow}>
          {renderStars(review.rating)}
          <View style={styles.dateContainer}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.dateText}>{review.date}</Text>
          </View>
        </View>

        {/* Service */}
        <Badge
          title={review.service}
          style={styles.serviceBadge}
          color="#F3F4F6" // bg-gray-100 for secondary
          textColor="#4B5563"
        />

        {/* Review Text */}
        <Text style={styles.reviewText}>{review.review}</Text>

        {/* Helpful Count */}
        <View style={styles.helpfulContainer}>
          <ThumbsUp size={16} color="#6B7280" />
          <Text style={styles.helpfulText}>
            {review.helpfulCount} Personen fanden dies hilfreich
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#4B5563" />
          </Pressable>
          <Text style={styles.screenTitle}>Meine Bewertungen</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviews.length > 0 ? avgRating : '0.0'}</Text>
            <View style={styles.starRowCenter}>
              {renderStars(reviews.length > 0 ? 5 : 0)}
            </View>
            <Text style={styles.statLabel}>Durchschnitt</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Bewertungen</Text>
          </View>
        </View>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <View style={styles.reviewsList}>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Star size={40} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Noch keine Bewertungen</Text>
            <Text style={styles.emptySubtitle}>
              Buche deinen ersten Termin und bewerte deinen Braider!
            </Text>
            <Button
              title="Braider finden"
              onPress={() => navigateTo('SearchScreen')}
              style={styles.emptyButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for RN ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholderView: {
    width: 24,
  },

  // Stats Overview
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs, // mt-2
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl, // gap-8
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32, // text-4xl
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
  statDivider: {
    height: 64, // h-16
    width: 1, // w-px
    backgroundColor: '#E5E7EB', // bg-gray-200
  },
  starRowCenter: {
    justifyContent: 'center',
    marginBottom: spacing.xs / 2,
  },

  // Reviews List
  reviewsList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm, // space-y-3
  },
  reviewCard: {
    padding: spacing.md,
  },

  // Review Item Details
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // gap-3
    marginBottom: spacing.sm,
  },
  providerAvatar: {
    width: 48, // w-12 h-12
    height: 48,
    borderRadius: 24,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  providerText: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerBusiness: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Rating and Date
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  starContainer: {
    flexDirection: 'row',
    gap: spacing.xs / 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Review Text and Helpful
  serviceBadge: {
    marginBottom: spacing.xs,
    // Assuming Badge variant="secondary" handles styling
  },
  reviewText: {
    color: '#374151', // text-gray-700
    marginBottom: spacing.sm,
  },
  helpfulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  helpfulText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Empty State
  emptyContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 48, // py-12
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: GRAY_TEXT,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: PRIMARY_COLOR,
  },
});