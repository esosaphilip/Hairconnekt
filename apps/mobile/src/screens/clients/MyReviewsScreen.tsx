import React, { useEffect, useMemo, useState } from 'react';
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
import Icon from '../../components/Icon';

// Custom Components (assumed to be available)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar from '../../components/avatar';
import { Badge } from '../../components/badge';
import { spacing } from '../../theme/tokens';
import { http } from '@/api/http';
import { useAuth } from '../../auth/AuthContext';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { useI18n } from '@/i18n';

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const AMBER_COLOR = '#FBBF24'; // fill-amber-400
const GRAY_300 = '#D1D5DB';
const GRAY_TEXT = '#6B7280';

// --- Types ---
type MyReviewItem = {
  id: string;
  providerName: string;
  providerBusiness: string | null;
  providerImage: string | null;
  rating: number;
  date: string;
  service: string | null;
  review: string;
  helpfulCount: number;
  providerId: string | null;
  isAnonymous: boolean;
};

type ReviewItemProps = { review: MyReviewItem };

// Utility: locale-aware date formatting
function formatDate(d: string | Date, locale: string): string {
  try {
    const date = typeof d === 'string' ? new Date(d) : d;
    const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(localeTag, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return typeof d === 'string' ? d : '';
  }
}

export function MyReviewsScreen() {
  const navigation = useNavigation();
  const { tokens, user, logout } = useAuth();
  const { t, locale } = useI18n();
  const isAuthenticated = !!tokens?.accessToken;
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const navigateTo = (screen: string) => {
    // @ts-ignore
    navigation.navigate(screen);
  };

  useEffect(() => {
    let mounted = true;
    async function fetchMyReviews() {
      // If not authenticated, avoid calling the API and show a friendly prompt
      if (!isAuthenticated) {
        if (mounted) {
          setReviews([]);
          setError(null);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await http.get('/reviews/mine');
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped = list.map((r: any) => ({
          id: r.id,
          providerName: r.provider?.name || t('common.provider'),
          providerBusiness: null,
          providerImage: r.provider?.avatarUrl || null,
          rating: r.rating ?? 0,
          date: r.createdAt ? formatDate(r.createdAt, locale) : '',
          service: null,
          review: r.comment ?? '',
          helpfulCount: 0,
          providerId: r.provider?.id || null,
          isAnonymous: !!r.isAnonymous,
        }));
        if (mounted) setReviews(mapped);
      } catch (err: any) {
        const is401 = err?.response?.status === 401 || String(err?.message || '').includes('401');
        const msg = is401 ? t('screens.myReviews.loginPrompt') : (err?.response?.data?.message || err?.message || '');
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchMyReviews();
    return () => { mounted = false; };
  }, [isAuthenticated, locale]);

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return '0.0';
    const avg = reviews.reduce((sum, review: MyReviewItem) => sum + (Number(review.rating) || 0), 0) / reviews.length;
    return avg.toFixed(1);
  }, [reviews]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? AMBER_COLOR : GRAY_300}
          />
        ))}
      </View>
    );
  };

  const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
    const handlePress = () => {
      // Navigate to provider public profile (root-level route)
      if (review.providerId) {
        rootNavigationRef.current?.navigate('ProviderDetail', { id: String(review.providerId) });
      }
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
              source={review.providerImage ? { uri: review.providerImage } : undefined}
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
            <Icon name="calendar" size={16} color="#6B7280" />
            <Text style={styles.dateText}>{review.date}</Text>
          </View>
        </View>

        {/* Service */}
        {review.service ? (
          <Badge
            title={review.service}
            style={styles.serviceBadge}
            color="#F3F4F6" // bg-gray-100 for secondary
            textColor="#4B5563"
          />
        ) : null}

        {/* Review Text */}
        <Text style={styles.reviewText}>{review.review}</Text>

        {/* Helpful Count */}
        {!!review.helpfulCount && review.helpfulCount > 0 ? (
          <View style={styles.helpfulContainer}>
            <Icon name="thumbs-up" size={16} color="#6B7280" />
            <Text style={styles.helpfulText}>
              {t('screens.myReviews.helpfulCount', { count: review.helpfulCount })}
            </Text>
          </View>
        ) : null}
      </Card>
    );
  };

  // Unauthenticated state: prompt user to login instead of showing a 401 error
  if (!isAuthenticated && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.lg, alignItems: 'center' }}>
          <Text style={{ textAlign: 'center', marginBottom: spacing.md }}>{t('screens.myReviews.loginPrompt', {})}</Text>
          <Button title={t('common.actions.login', {})} onPress={() => {
            // Navigate to login without automatic logout
            rootNavigationRef.current?.navigate('Login');
          }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#4B5563" />
          </Pressable>
          <Text style={styles.screenTitle}>{t('screens.myReviews.title')}</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
            <Text style={{ color: '#B91C1C' }}>{String(error)}</Text>
          </View>
        ) : null}
        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviews.length > 0 ? avgRating : '0.0'}</Text>
            <View style={styles.starRowCenter}>
              {renderStars(reviews.length > 0 ? Math.round(Number(avgRating)) : 0)}
            </View>
            <Text style={styles.statLabel}>{t('screens.myReviews.average')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviews.length}</Text>
            <Text style={styles.statLabel}>{t('screens.myReviews.countLabel')}</Text>
          </View>
        </View>

        {/* Reviews List */}
        {loading ? (
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
            <Text>{t('common.loading')}</Text>
          </View>
        ) : reviews.length > 0 ? (
          <View style={styles.reviewsList}>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="star-outline" size={40} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>{t('screens.myReviews.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('screens.myReviews.emptySubtitle')}
            </Text>
            <Button
              title={t('screens.myReviews.goToSearch')}
              onPress={() => {
                // Navigate to the Search tab and ensure SearchScreen is active
                try {
                  rootNavigationRef.current?.navigate?.('Tabs', {
                    screen: 'SearchStack',
                    params: { screen: 'SearchScreen' },
                  });
                } catch (e) {
                  // Fallback: try direct navigate to SearchScreen (if registered at current level)
                  // @ts-ignore
                  navigateTo('SearchScreen');
                }
              }}
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
    backgroundColor: '#F9FAFB',
    flex: 1, // bg-gray-50
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    marginLeft: -spacing.xs,
    padding: spacing.xs,
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
    color: GRAY_TEXT,
    fontSize: 14,
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
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, // space-y-3
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
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  providerText: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerBusiness: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Rating and Date
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  starContainer: {
    flexDirection: 'row',
    gap: spacing.xs / 2,
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs / 2,
  },
  dateText: {
    color: '#6B7280',
    fontSize: 14,
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs / 2,
  },
  helpfulText: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Empty State
  emptyContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 48, // py-12
    alignItems: 'center',
  },
  emptyIconContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: GRAY_TEXT,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: PRIMARY_COLOR,
  },
});
