import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { Badge } from '../../components/badge';
import Avatar, { AvatarImage } from '../../components/avatar';
import Textarea from '../../components/textarea'; // Custom multiline Input component
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

// Screen width for responsive layout
const screenWidth = Dimensions.get('window').width;

// --- Mock Data (Simplified to use RN image source format) ---
const reviews = [
  {
    id: 1,
    client: {
      name: "Sarah Müller",
      image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100",
      verified: true,
    },
    rating: 5,
    date: "vor 2 Tagen",
    service: "Box Braids",
    text: "Fantastisch! Meine Box Braids sehen perfekt aus und Aisha war super professionell. Die Atmosphäre war sehr entspannt und ich habe mich sehr wohl gefühlt. Kann ich nur weiterempfehlen!",
    helpful: 12,
    hasResponse: false,
    images: [],
  },
  {
    id: 2,
    client: {
      name: "Maria König",
      image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100",
      verified: true,
    },
    rating: 5,
    date: "vor 5 Tagen",
    service: "Cornrows",
    text: "Sehr professionell und freundlich. Die Cornrows halten super und sehen toll aus. Komme definitiv wieder!",
    helpful: 8,
    hasResponse: true,
    response: {
      text: "Vielen Dank für deine tolle Bewertung, Maria! Es war mir eine Freude, dich zu bedienen. Bis bald! 😊",
      date: "vor 5 Tagen",
    },
    images: [],
  },
  {
    id: 3,
    client: {
      name: "Lisa Werner",
      image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100",
      verified: true,
    },
    rating: 4,
    date: "vor 1 Woche",
    service: "Senegalese Twists",
    text: "Sehr schöne Arbeit, aber die Wartezeit war etwas länger als erwartet. Ansonsten bin ich sehr zufrieden mit dem Ergebnis!",
    helpful: 5,
    hasResponse: true,
    response: {
      text: "Danke für dein Feedback, Lisa! Entschuldige die Wartezeit - ich arbeite daran, meine Zeitplanung zu verbessern. Freut mich, dass dir das Ergebnis gefällt!",
      date: "vor 1 Woche",
    },
    images: [],
  },
];

// --- Review Item Component ---
type Review = {
  id: number;
  client: { name: string; image: string; verified: boolean };
  rating: number;
  date: string;
  service: string;
  text: string;
  helpful: number;
  hasResponse: boolean;
  response?: { text: string; date: string };
  images: string[];
};

type ReviewItemProps = {
  review: Review;
  respondingTo: number | null;
  responseText: string;
  setResponseText: (t: string) => void;
  handleSubmitResponse: (id: number) => void;
  setRespondingTo: (id: number | null) => void;
};

const ReviewItem = ({ review, respondingTo, responseText, setResponseText, handleSubmitResponse, setRespondingTo }: ReviewItemProps) => {
  const isResponding = respondingTo === review.id && !review.hasResponse;

  return (
    <Card style={styles.reviewCard}>
      {/* Client Info */}
      <View style={styles.clientInfoRow}>
        <Avatar size={48}>
          <AvatarImage source={{ uri: review.client.image }} />
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
      <Badge title={review.service} variant="secondary" style={styles.serviceBadge} />

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
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState<string>("");
  const navigation = useNavigation<any>();

  const filteredReviews = reviews.filter(review => {
    if (filter === "unresponded") return !review.hasResponse;
    if (filter === "5stars") return review.rating === 5;
    if (filter === "with-photos") return review.images.length > 0;
    return true;
  });

  const handleSubmitResponse = (reviewId: number) => {
    // Mock submit logic
    Alert.alert("Erfolg", `Antwort gesendet für Bewertung #${reviewId}`);
    setRespondingTo(null);
    setResponseText("");
    // In a real app, you'd update the local state or refetch data here.
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
          {["Alle", "Unbeantwortet", "5 Sterne", "Mit Fotos"].map((f) => {
            const key = f.toLowerCase().replace(/ /g, '-').replace('ä', 'a').replace('ö', 'o');
            return (
                <Button
                    key={key}
                    title={f}
                    size="sm"
                    variant={filter === key ? "default" : "outline"}
                    onPress={() => setFilter(key)}
                    style={filter === key ? styles.activeButton : styles.inactiveButton}
                />
            );
          })}
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
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
      />
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  overallRatingContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  ratingSummary: {
    alignItems: 'center',
    paddingRight: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  reviewCount: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    marginTop: SPACING.xs / 2,
  },
  ratingDistribution: {
    flex: 1,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  distributionStars: {
    fontSize: FONT_SIZES.small || 12,
    width: 25,
    textAlign: 'right',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border || '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.amber || '#FBBF24',
  },
  distributionPercent: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    width: 35,
    textAlign: 'right',
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trendingText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.success || '#10B981',
    fontWeight: '500',
  },
  // --- Filter Chips ---
  filterChipsContainer: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
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
    padding: SPACING.md,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md, // Add horizontal margin to align with header padding
  },
  clientInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  clientTextContainer: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  clientName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  ratingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
    marginTop: SPACING.xs / 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  dateText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  serviceBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
    marginBottom: SPACING.sm,
  },
  helpfulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  helpfulText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  responseTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  responseText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
    marginBottom: SPACING.xs,
  },
  responseDate: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Response Form Styles ---
  responseForm: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background || '#F9FAFB',
    borderRadius: 8,
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
    marginTop: SPACING.xs,
    borderColor: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  // --- Empty State Styles ---
  emptyContainer: {
      paddingVertical: SPACING.xl * 2,
      paddingHorizontal: SPACING.md,
      alignItems: 'center',
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
      fontSize: FONT_SIZES.body || 14,
      color: COLORS.textSecondary || '#6B7280',
      textAlign: 'center',
  },
});