import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Avatar, Badge } from '../ui';
import Icon from '../components/Icon';
import { normalizeUrl } from '../utils/url';
import type { ProviderSummary } from '../services/providers';

export type ProviderCardProps = {
  data: ProviderSummary;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPress?: (id: string) => void;
  formatCurrency?: (eur: number) => string; // optional formatter for priceFromCents
};

export default function ProviderCard({ data, isFavorite, onToggleFavorite, onPress, formatCurrency }: ProviderCardProps) {
  const handlePress = () => onPress?.(data.id);
  const handleToggle = () => onToggleFavorite?.(data.id);

  const priceText = (() => {
    if (typeof data.priceFromCents === 'number' && data.priceFromCents >= 0) {
      const euros = data.priceFromCents / 100;
      return formatCurrency ? `ab ${formatCurrency(euros)}` : `ab €${euros.toFixed(2)}`;
    }
    if (data.priceLabel) return data.priceLabel;
    return 'Preis auf Anfrage';
  })();

  const distanceText = typeof data.distanceKm === 'number' ? `${data.distanceKm.toFixed(1)} km entfernt` : undefined;

  return (
    <Card style={styles.card}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.touchable}>
        {onToggleFavorite && (
          <TouchableOpacity onPress={handleToggle} style={styles.favoriteButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#EC4899' : '#9CA3AF'} />
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Avatar size={64} style={styles.avatarWrapper}>
              {data.imageUrl ? (
                <Image source={{ uri: normalizeUrl(data.imageUrl) }} style={styles.avatarImage} testID="provider-card-image" />
              ) : (
                <View style={[styles.fallbackAvatar, styles.avatarWrapper]}>
                  <Text style={styles.fallbackText}>{(data.name || '?').charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </Avatar>
            {data.verified && (
              <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓</Text></View>
            )}
          </View>

          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>{data.name}</Text>
            {data.business ? <Text style={styles.business} numberOfLines={1}>{data.business}</Text> : null}
            <View style={styles.row}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.rating}>{typeof data.rating === 'number' ? Math.round(data.rating * 10) / 10 : '–'}</Text>
              <Text style={styles.reviews}>({typeof data.reviews === 'number' ? data.reviews : 0})</Text>
            </View>
            {distanceText && (
              <View style={styles.row}>
                <Icon name="map-pin" size={12} color="#6B7280" />
                <Text style={styles.distance}>{distanceText}</Text>
              </View>
            )}
            {!!data.specialties?.length && (
              <View style={styles.specialties}>
                {(data.specialties || []).slice(0, 3).map((s, idx) => (
                  <Badge
                    key={idx}
                    backgroundColor="#F43F5E"
                    borderColor="#F43F5E"
                    textColor="#ffffff"
                    textStyle={styles.badgeText}
                    style={{ backgroundColor: '#F43F5E', borderColor: '#F43F5E' }}
                  >
                    {s}
                  </Badge>
                ))}
              </View>
            )}
            <View style={styles.footer}>
              <Text style={styles.price}>{priceText}</Text>
              {data.available ? (
                <Badge variant="success" textStyle={styles.badgeText}>Verfügbar heute</Badge>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0 },
  touchable: { padding: 16, position: 'relative' },
  favoriteButton: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },
  content: { flexDirection: 'row', gap: 12 },
  avatarContainer: { position: 'relative' },
  avatarWrapper: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  fallbackAvatar: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontSize: 24, fontWeight: 'bold', color: '#6B7280' },
  verifiedBadge: { position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, backgroundColor: '#3B82F6', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  details: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  business: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 14, color: '#1F2937' },
  reviews: { fontSize: 14, color: '#9CA3AF' },
  distance: { fontSize: 14, color: '#6B7280' },
  specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  badgeText: { fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { color: '#8B4513', fontWeight: '600' },
});