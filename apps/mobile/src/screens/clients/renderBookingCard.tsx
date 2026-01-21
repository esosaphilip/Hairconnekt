import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Card from "@/components/Card";
import Badge from "@/components/badge";
import Avatar, { AvatarImage, AvatarFallback } from "@/components/avatar";
import Icon from "@/components/Icon";
import { colors } from "@/theme/tokens";

import { IBooking } from "@/domain/models/booking";

type NavigateFn = (route: any, params?: any) => void;

const local = StyleSheet.create({
  badgeCompleted: { backgroundColor: colors.success },
  badgeCancelled: { backgroundColor: colors.error },
  badgeTextWhite: { color: colors.white, fontSize: 12 },
});

export function renderBookingCard(
  booking: IBooking,
  navigate: NavigateFn,
) {
  const b = booking;
  const idStr = b.id;
  const providerName = b.providerName;
  const providerBusiness = b.providerBusiness || '';
  const providerImage = b.providerImage;
  const service = b.serviceName;
  const dateStr = b.date; // e.g. "Freitag, 1. Nov."
  const timeStr = b.time; // e.g. "10:00 - 13:00 Uhr"
  const durationStr = b.duration; // "3 Std." or similar if available
  const locationStr = b.location || 'Keine Adresse';
  const priceStr = b.price || '';
  const status = b.status;
  const ratingNum = b.rating || 4.8; // Default to 4.8 if missing for visuals

  // Calculate relative time
  const now = new Date();
  const start = new Date(b.startTime);
  const diffMs = start.getTime() - now.getTime();
  const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));

  let relativeTime = "";
  if (diffHrs > 0 && diffHrs < 24) {
    relativeTime = `In ${diffHrs} Std.`;
  } else if (diffHrs < 0) {
    relativeTime = ""; // Don't show for past/started
  } else {
    relativeTime = ""; // Don't show for > 24h (date is enough)
  }

  const firstChar = providerName.length > 0 ? providerName.charAt(0) : "?";
  const fallbackLabel = firstChar.toUpperCase();

  const isConfirmed = status === 'upcoming' || status === 'confirmed';
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';

  const badgeLabel = isConfirmed ? 'Bestätigt' : isCancelled ? 'Storniert' : 'Abgeschlossen';
  const badgeStyle = isConfirmed
    ? { backgroundColor: colors.success }
    : isCancelled
      ? { backgroundColor: colors.error }
      : { backgroundColor: colors.gray100 };
  const badgeTextColor = isConfirmed || isCancelled ? colors.white : colors.gray800;

  // Tag style for services (Red/Pink background)
  const tagStyle = { backgroundColor: '#F43F5E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' as const };
  const tagText = { color: 'white', fontSize: 12, fontWeight: '600' as const };


  return (
    <Card key={idStr} style={sx.bookingCard}>
      <TouchableOpacity onPress={() => navigate("AppointmentDetail", { id: idStr })} activeOpacity={0.9}>

        {/* Header: Date and Badge */}
        <View style={sx.headerRow}>
          <Text style={sx.dateText}>{dateStr}</Text>
          <Badge
            label={badgeLabel}
            style={[sx.statusBadge, badgeStyle]}
            textStyle={{ color: badgeTextColor }}
          />
        </View>

        {/* Time Info */}
        <View style={sx.timeRow}>
          <Text style={sx.timeText}>{timeStr}</Text>
          {isConfirmed && <Text style={sx.relativeTime}>{relativeTime}</Text>}
        </View>

        {/* Provider Info */}
        <View style={sx.providerContainer}>
          <Avatar size={48} style={sx.providerAvatar}>
            {providerImage ? (
              <AvatarImage uri={providerImage} style={sx.providerImage} />
            ) : (
              <AvatarFallback label={fallbackLabel} />
            )}
          </Avatar>
          <View style={sx.providerTexts}>
            <Text style={sx.providerName} numberOfLines={1}>{providerName}</Text>
            <Text style={sx.providerBusiness} numberOfLines={1}>{providerBusiness}</Text>
            <View style={sx.ratingRow}>
              <Icon name="star" size={14} color={colors.accentGold} />
              <Text style={sx.ratingText}>{ratingNum}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={sx.locationRow}>
          <Icon name="map-pin" size={14} color={colors.gray500} />
          <Text style={sx.locationText} numberOfLines={1}>{locationStr}</Text>
        </View>

        {/* Service Tags */}
        <View style={sx.tagsRow}>
          <View style={tagStyle}>
            <Text style={tagText}>{service}</Text>
          </View>
        </View>

        {/* Footer: Price and Actions */}
        <View style={sx.footer}>
          <Text style={sx.priceText}>{priceStr}</Text>

          <View style={sx.actions}>
            <TouchableOpacity style={sx.msgButton}>
              <Icon name="message-square" size={16} color={colors.gray800} />
              <Text style={sx.msgButtonText}>Nachricht</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sx.moreButton}>
              <Icon name="ellipsis-horizontal" size={20} color={colors.gray800} />
            </TouchableOpacity>
          </View>
        </View>

      </TouchableOpacity>
    </Card>
  );
}

const sx = StyleSheet.create({
  bookingCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  timeRow: {
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#4B5563',
  },
  relativeTime: {
    fontSize: 14,
    color: '#D97706', // Orange-ish
    fontWeight: '500',
    marginTop: 2,
  },
  providerContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  providerAvatar: {
    height: 48,
    width: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  providerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  providerTexts: {
    justifyContent: 'center',
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  providerBusiness: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827', // or primary
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  msgButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  msgButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  moreButton: {
    padding: 6,
  },
});
