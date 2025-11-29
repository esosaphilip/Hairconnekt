import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert, // Replaces web 'alert'
  Dimensions,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation, useRoute } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { Badge } from '../../components/badge';
import Avatar, { AvatarImage } from '../../components/avatar';
import Textarea from '../../components/textarea'; // Custom multiline Input component
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { http } from '../../api/http';

// Screen width for responsive layout
const screenWidth = Dimensions.get('window').width;

// --- Utility ---
function formatDateDE(d: string | Date) {
  try {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return typeof d === 'string' ? d : '';
  }
}

// --- Review Item Component ---
type Review = {
  id: number | string;
  client: { name: string; image?: string | null; verified: boolean };
  rating: number;
  date: string;
  service?: string;
  text: string;
  helpful: number;
  hasResponse: boolean;
  response?: { text: string; date: string };
  images: string[];
};

type ReviewItemProps = {
  review: Review;
  respondingTo: string | number | null;
  responseText: string;
  setResponseText: (t: string) => void;
  handleSubmitResponse: (id: string | number) => void;
  setRespondingTo: (id: string | number | null) => void;
};

const ReviewItem = ({ review, respondingTo, responseText, setResponseText, handleSubmitResponse, setRespondingTo }: ReviewItemProps) => {
  const isResponding = String(respondingTo) === String(review.id) && !review.hasResponse;

  return (
    <Card style={styles.reviewCard}>
      {/* Client Info */}
      <View style={styles.clientInfoRow}>
        <Avatar size={48}>
          <AvatarImage uri={review.client.image || undefined} />
        </Avatar>
        <View style={styles.clientTextContainer}>
          <View style={styles.nameBadgeRow}>
            <Text style={styles.clientName}>{review.client.name}</Text>
            {review.client.verified && (
              <Badge title="Verifiziert" variant="outline" />
            )}
          </View>
          <View style={styles.ratingDateRow}>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon
                  key={i}
                  name="star"
                  size={12}
                  color={i <= review.rating ? COLORS.amber : COLORS.border}
                  fill={i <= review.rating ? COLORS.amber : 'transparent'}
                />
              ))}
            </View>
            <Text style={styles.dateText}>·</Text>
            <Text style={styles.dateText}>{review.date}</Text>
          </View>
        </View>
      </View>

      {/* Service Tag */}
      {review.service ? (
        <Badge title={review.service} variant="secondary" style={styles.serviceBadge} />
      ) : null}

      {/* Review Text */}
      <Text style={styles.reviewText}>{review.text}</Text>

      {/* Helpful Count */}
      <View style={styles.helpfulRow}>
        <Icon name="thumbs-up" size={12} color={COLORS.textSecondary} />
        <Text style={styles.helpfulText}>{review.helpful} fanden das hilfreich</Text>
      </View>

      {/* Provider Response */}
      {review.hasResponse && review.response && (
        <View style={styles.providerResponseContainer}>
          <View style={styles.responseHeader}>
            <Icon name="message-circle" size={16} color={COLORS.primary} />
            <Text style={styles.responseTitle}>Antwort von Aisha's Braiding Studio</Text>
          </View>
          <Text style={styles.responseText}>{review.response.text}</Text>
          <Text style={styles.responseDate}>{review.response.date}</Text>
        </View>
      )}

      {/* Response Form/Button */}
      {!review.hasResponse && isResponding ? (
        <View style={styles.responseForm}>
          <Textarea
            placeholder="Deine Antwort..."
            value={responseText}
            onChangeText={setResponseText}
            numberOfLines={3}
            style={styles.responseInput}
          />
          <View style={styles.responseFormActions}>
            <Button
              title="Antwort senden"
              size="sm"
              onPress={() => handleSubmitResponse(review.id)}
              style={styles.submitButton}
            />
            <Button
              title="Abbrechen"
              size="sm"
              variant="outline"
              onPress={() => {
                setRespondingTo(null);
                setResponseText("");
              }}
            />
          </View>
        </View>
      ) : !review.hasResponse ? (
        <Button
          title="Antworten"
          size="sm"
          variant="outline"
          icon="message-circle"
          onPress={() => setRespondingTo(review.id)}
          style={styles.replyButton}
        />
      ) : null}
    </Card>
  );
};


// --- Main Component ---
export function ProviderReviews() {
  const [filter, setFilter] = useState<string>("all");
  const [respondingTo, setRespondingTo] = useState<string | number | null>(null);
  const [responseText, setResponseText] = useState<string>("");
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Initialize filter/responding state from route params when provided
  useEffect(() => {
    const params = (route as any)?.params || {};
    const allowedFilters = ["all", "unresponded", "5stars", "with-photos"];
    if (typeof params?.initialFilter === 'string' && allowedFilters.includes(params.initialFilter)) {
      setFilter(params.initialFilter);
    }
    if (typeof params?.focusReviewId === 'number' || typeof params?.focusReviewId === 'string') {
      setRespondingTo(params.focusReviewId);
    }
  }, [route]);

  // Fetch provider reviews
  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await http.get('/reviews/provider');
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped: Review[] = list.map((r: any) => ({
          id: r.id,
          client: r.isAnonymous
            ? { name: 'Anonym', image: null, verified: false }
            : { name: r.client?.name ?? 'Kunde', image: r.client?.avatarUrl ?? null, verified: true },
          rating: r.rating ?? 0,
          date: r.createdAt ? formatDateDE(r.createdAt) : '',
          service: Array.isArray(r.appointment?.services) && r.appointment.services.length > 0
            ? r.appointment.services[0]?.name
            : undefined,
          text: r.comment ?? '',
          helpful: 0,
          hasResponse: !!r.providerResponse,
          response: r.providerResponse ? { text: r.providerResponse, date: formatDateDE(r.createdAt) } : undefined,
          images: Array.isArray(r.images) ? r.images.map((img: any) => img.url) : [],
        }));
        if (mounted) setReviewsData(mapped);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Fehler beim Laden der Bewertungen';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReviews();
    return () => { mounted = false; };
  }, []);

  const filteredReviews = reviewsData.filter(review => {
    if (filter === "unresponded") return !review.hasResponse;
    if (filter === "5stars") return review.rating === 5;
    if (filter === "with-photos") return review.images.length > 0;
    return true;
  });

  const handleSubmitResponse = async (reviewId: number | string) => {
    const payload = { reviewId: String(reviewId), response: responseText.trim() };
    if (!payload.response) {
      Alert.alert('Fehler', 'Bitte gib eine Antwort ein.');
      return;
    }
    try {
      const res = await http.post('/reviews/respond', payload);
      const updated = res?.data;
      // Optimistically update local state
      setReviewsData((prev) => prev.map((r) => {
        if (String(r.id) === String(reviewId)) {
          return {
            ...r,
            hasResponse: true,
            response: { text: payload.response, date: formatDateDE(new Date()) },
          };
        }
        return r;
      }));
      Alert.alert('Erfolg', 'Antwort gesendet.');
      setRespondingTo(null);
      setResponseText('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Fehler beim Senden der Antwort';
      Alert.alert('Fehler', msg);
    }
  };
  
  // Header component including the overall stats and filter chips
  const ListHeader = () => (
      <View style={{ paddingHorizontal: SPACING.md }}>
        {/* Overall Rating Card */}
        <Card style={styles.overallRatingCard}>
          <View style={styles.overallRatingContent}>
            <View style={styles.ratingSummary}>
              <Text style={styles.averageRating}>4.8</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={16}
                    color={i <= 4.8 ? COLORS.amber : COLORS.border}
                    fill={i <= 4.8 ? COLORS.amber : 'transparent'}
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>234 Bewertungen</Text>
            </View>

            <View style={styles.ratingDistribution}>
              {/* Rating Distribution */}
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = stars === 5 ? 77 : stars === 4 ? 17 : stars === 3 ? 4 : 1;
                return (
                  <View key={stars} style={styles.distributionRow}>
                    <Text style={styles.distributionStars}>{stars}★</Text>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.distributionPercent}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.trendingRow}>
            <Icon name="trending-up" size={16} color={COLORS.success} />
            <Text style={styles.trendingText}>+0.2 diesen Monat</Text>
          </View>
        </Card>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContainer}
        >
          {(() => {
            const labels = ["Alle", "Unbeantwortet", "5 Sterne", "Mit Fotos"] as const;
            const map: Record<typeof labels[number], string> = {
              "Alle": "all",
              "Unbeantwortet": "unresponded",
              "5 Sterne": "5stars",
              "Mit Fotos": "with-photos",
            };
            return labels.map((label) => {
              const key = map[label];
              const isActive = filter === key;
              return (
                <Button
                  key={key}
                  title={label}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onPress={() => setFilter(key)}
                  style={isActive ? styles.activeButton : styles.inactiveButton}
                />
              );
            });
          })()}
        </ScrollView>
      </View>
  );

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Icon name="star" size={64} color={COLORS.border} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>Keine Bewertungen gefunden</Text>
        <Text style={styles.emptySubtitle}>
            {filter === "all"
              ? "Noch keine Bewertungen vorhanden"
              : "Keine Bewertungen in dieser Kategorie"}
        </Text>
        {filter !== "all" && (
            <Button title="Alle Bewertungen anzeigen" variant="outline" onPress={() => setFilter("all")} style={{ marginTop: SPACING.md }} />
        )}
    </View>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header (Always visible) */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Bewertungen</Text>
          <IconButton name="filter" onPress={() => Alert.alert("Filter", "Öffne erweitertes Filter-Modal")} />
        </View>
      </View>
      {loading ? (
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
          <Text style={{ color: COLORS.textSecondary }}>Lade Bewertungen…</Text>
        </View>
      ) : error ? (
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
          <Text style={{ color: '#EF4444' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          renderItem={({ item }) => (
            <ReviewItem
              review={item}
              respondingTo={respondingTo}
              responseText={responseText}
              setResponseText={setResponseText}
              handleSubmitResponse={handleSubmitResponse}
              setRespondingTo={setRespondingTo}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    backgroundColor: COLORS.background || '#F9FAFB',
    flex: 1,
  },
  // --- Fixed Header Styles ---
  fixedHeader: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomColor: COLORS.border || '#E5E7EB',
    borderBottomWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- List Content (Header + Items) ---
  listContent: {
    paddingBottom: SPACING.lg || 24,
    // Note: Horizontal padding is handled in ListHeaderComponent and List items
  },
  // --- Overall Rating Card ---
  overallRatingCard: {
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  overallRatingContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.md,
  },
  ratingSummary: {
    alignItems: 'center',
    borderRightColor: COLORS.border,
    borderRightWidth: 1,
    paddingRight: SPACING.sm,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  reviewCount: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
    marginTop: SPACING.xs / 2,
  },
  ratingDistribution: {
    flex: 1,
  },
  distributionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  distributionStars: {
    fontSize: FONT_SIZES.small || 12,
    textAlign: 'right',
    width: 25,
  },
  progressBarBackground: {
    backgroundColor: COLORS.border || '#E5E7EB',
    borderRadius: 4,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: COLORS.amber || '#FBBF24',
    height: '100%',
  },
  distributionPercent: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
    textAlign: 'right',
    width: 35,
  },
  trendingRow: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  trendingText: {
    color: COLORS.success || '#10B981',
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  // --- Filter Chips ---
  filterChipsContainer: {
    gap: SPACING.xs,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  activeButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    borderColor: COLORS.primary || '#8B4513',
  },
  inactiveButton: {
    borderColor: COLORS.border || '#E5E7EB',
  },
  filterBadge: {
    marginLeft: SPACING.xs,
  },
  // --- Review Item Styles ---
  reviewCard: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    padding: SPACING.md, // Add horizontal margin to align with header padding
  },
  clientInfoRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  clientTextContainer: {
    flex: 1,
  },
  nameBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  clientName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  ratingDateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
    marginTop: SPACING.xs / 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  dateText: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
  },
  serviceBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewText: {
    color: COLORS.text || '#1F2937',
    fontSize: FONT_SIZES.body || 14,
    marginBottom: SPACING.sm,
  },
  helpfulRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  helpfulText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
  },
  // --- Provider Response Styles ---
  providerResponseContainer: {
    backgroundColor: COLORS.background || '#F9FAFB',
    borderRadius: 8,
    padding: SPACING.sm,
    marginLeft: SPACING.md, // Indent for hierarchy
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  responseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  responseTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  responseText: {
    color: COLORS.text || '#1F2937',
    fontSize: FONT_SIZES.body || 14,
    marginBottom: SPACING.xs,
  },
  responseDate: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
  },
  // --- Response Form Styles ---
  responseForm: {
    backgroundColor: COLORS.background || '#F9FAFB',
    borderRadius: 8,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
  },
  responseInput: {
    marginBottom: SPACING.sm,
  },
  responseFormActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'flex-start',
  },
  replyButton: {
    alignSelf: 'flex-start',
    borderColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  // --- Empty State Styles ---
  emptyContainer: {
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
      color: COLORS.border || '#D1D5DB',
      marginBottom: SPACING.md,
  },
  emptyTitle: {
      fontSize: FONT_SIZES.h4 || 18,
      fontWeight: 'bold',
      marginBottom: SPACING.xs,
  },
  emptySubtitle: {
      color: COLORS.textSecondary || '#6B7280',
      fontSize: FONT_SIZES.body || 14,
      textAlign: 'center',
  },
});