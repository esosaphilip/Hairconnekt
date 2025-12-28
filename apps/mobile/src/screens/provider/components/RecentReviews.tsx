import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { colors } from '@/theme/tokens';
import { styles } from '../ProviderDashboard.styles';
import { Review, safeLocaleDateString } from '../hooks/useProviderDashboard';
import { rootNavigationRef } from '@/navigation/rootNavigation';

interface RecentReviewsProps {
    reviews: Review[];
}

export const RecentReviews: React.FC<RecentReviewsProps> = ({ reviews }) => {
    return (
        <View>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Neueste Bewertungen</Text>
                <Pressable onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderReviewsScreen' })}>
                    <Text style={styles.seeAllText}>Alle anzeigen</Text>
                </Pressable>
            </View>

            <View>
                {reviews.map((review) => (
                    <Card key={review.id} style={styles.cardMb12}>
                        <View style={styles.reviewHeaderRow}>
                            <View>
                                <Text style={styles.reviewClientName}>{review.client}</Text>
                                <View style={styles.reviewStarsRow}>
                                    {Array.from({ length: Math.floor(review.rating) }).map((_, i) => (
                                        <Ionicons key={i} name="star" size={12} color={colors.amber600} style={styles.starIcon} />
                                    ))}
                                </View>
                            </View>
                            <Text style={styles.smallGrayText}>{safeLocaleDateString(new Date(review.date), 'de-DE')}</Text>
                        </View>
                        <Text style={styles.reviewText}>{review.text}</Text>
                        {!review.hasResponse && (
                            <Button
                                title="Antworten"
                                variant="ghost"
                                onPress={() => rootNavigationRef.current?.navigate('Mehr', {
                                    screen: 'ProviderReviewsScreen',
                                    params: { initialFilter: 'unresponded', focusReviewId: review.id }
                                })}
                            />
                        )}
                    </Card>
                ))}
                {reviews.length === 0 && (
                    <Text style={styles.smallGrayText}>Keine neuen Bewertungen</Text>
                )}
            </View>
        </View>
    );
};
