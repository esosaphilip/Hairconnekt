import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Card from "@/components/Card";
import Badge from "@/components/badge";
import Avatar, { AvatarImage, AvatarFallback } from "@/components/avatar";
import Icon from "@/components/Icon";
import { colors } from "@/theme/tokens";

type NavigateFn = (route: string, params: Record<string, unknown>) => void;

const local = StyleSheet.create({
  badgeCompleted: { backgroundColor: colors.success },
  badgeCancelled: { backgroundColor: colors.error },
  badgeTextWhite: { color: colors.white, fontSize: 12 },
});

const sx = StyleSheet.create({
  bookingCard: { marginBottom: 12, padding: 16 },
  providerInfo: { flexDirection: 'row', marginBottom: 12 },
  providerAvatar: { flexShrink: 0, height: 64, marginRight: 12, width: 64 },
  providerImage: { height: '100%', resizeMode: 'cover', width: '100%' },
  detailsWrapper: { flex: 1, minWidth: 0 },
  nameStatusRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nameBusinessWrapper: { flex: 1, minWidth: 0 },
  providerName: { color: colors.gray800, fontSize: 16, fontWeight: 'bold' },
  providerBusiness: { color: colors.gray500, fontSize: 14 },
  serviceBadge: { alignSelf: 'flex-start', marginTop: 4 },
  bookingDetails: {},
  detailRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 8 },
  detailText: { color: colors.gray600, fontSize: 14, marginLeft: 8 },
  footer: {
    alignItems: 'center',
    borderTopColor: colors.gray200,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
  },
  priceText: { color: colors.primary, fontWeight: '600' },
  reviewStatus: { alignItems: 'center', flexDirection: 'row' },
  reviewText: { fontSize: 14, marginLeft: 4 },
  cancelStatus: {},
  cancelText: { color: colors.gray500, fontSize: 14 },
});

export function renderBookingCard(
  booking: Record<string, unknown>,
  navigate: NavigateFn,
) {
  const b = booking as Record<string, unknown>;
  const idStr = String(b["id"] ?? "");
  const providerName = typeof b["providerName"] === "string" ? (b["providerName"] as string) : "";
  const providerBusiness = typeof b["providerBusiness"] === "string" ? (b["providerBusiness"] as string) : null;
  const providerImage = typeof b["providerImage"] === "string" ? (b["providerImage"] as string) : undefined;
  const service = typeof b["service"] === "string" ? (b["service"] as string) : "Service";
  const dateStr = typeof b["date"] === "string" ? (b["date"] as string) : "";
  const timeStr = typeof b["time"] === "string" ? (b["time"] as string) : "";
  const durationStr = typeof b["duration"] === "string" ? (b["duration"] as string) : null;
  const locationStr = typeof b["location"] === "string" ? (b["location"] as string) : null;
  const priceStr = typeof b["price"] === "string" ? (b["price"] as string) : null;
  const status = typeof b["status"] === "string" ? (b["status"] as string) : "";
  const reviewed = !!b["reviewed"];
  const ratingNum = typeof b["rating"] === "number" ? (b["rating"] as number) : undefined;
  const cancelledByStr = typeof b["cancelledBy"] === "string" ? (b["cancelledBy"] as string) : null;

  const firstChar = providerName.length > 0 ? providerName.charAt(0) : "?";
  const fallbackLabel = firstChar.toUpperCase();

  const statusNode =
    status === "completed" ? (
      <Badge label="Abgeschlossen" style={local.badgeCompleted} textStyle={local.badgeTextWhite} />
    ) : status === "cancelled" ? (
      <Badge label="Storniert" style={local.badgeCancelled} textStyle={local.badgeTextWhite} />
    ) : null;

  return (
    <Card key={idStr} style={sx.bookingCard}>
      <TouchableOpacity onPress={() => navigate("AppointmentDetail", { id: idStr })} activeOpacity={0.8}>
        <View style={sx.providerInfo}>
          <Avatar size={64} style={sx.providerAvatar}>
            {providerImage ? (
              <AvatarImage uri={providerImage} style={sx.providerImage} />
            ) : (
              <AvatarFallback label={fallbackLabel} />
            )}
          </Avatar>
          <View style={sx.detailsWrapper}>
            <View style={sx.nameStatusRow}>
              <View style={sx.nameBusinessWrapper}>
                <Text style={sx.providerName} numberOfLines={1}>
                  {providerName}
                </Text>
                {providerBusiness && (
                  <Text style={sx.providerBusiness} numberOfLines={1}>
                    {providerBusiness}
                  </Text>
                )}
              </View>
              {statusNode}
            </View>
            <Badge variant="secondary" style={sx.serviceBadge}>
              {service}
            </Badge>
          </View>
        </View>

        <View style={sx.bookingDetails}>
          <View style={sx.detailRow}>
            <Icon name="calendar" size={16} color={colors.gray600} />
            <Text style={sx.detailText}>{dateStr}</Text>
          </View>
          <View style={sx.detailRow}>
            <Icon name="clock" size={16} color={colors.gray600} />
            <Text style={sx.detailText}>
              {timeStr} • {durationStr}
            </Text>
          </View>
          <View style={sx.detailRow}>
            <Icon name="map-pin" size={16} color={colors.gray600} />
            <Text style={sx.detailText}>{locationStr}</Text>
          </View>
        </View>

        <View style={sx.footer}>
          <Text style={sx.priceText}>{priceStr}</Text>
          {status === "completed" && reviewed && (
            <View style={sx.reviewStatus}>
              <Icon name="star" size={16} color={colors.accentGold} />
              <Text style={sx.reviewText}>Bewertet ({typeof ratingNum === "number" ? String(ratingNum) : ""})</Text>
            </View>
          )}
          {status === "cancelled" && (
            <View style={sx.cancelStatus}>
              <Text style={sx.cancelText}>
                {cancelledByStr === "client" ? "Von dir storniert" : "Vom Anbieter storniert"}
              </Text>
            </View>
          )}
          <Icon name="chevron-right" size={20} color={colors.gray400} />
        </View>
      </TouchableOpacity>
    </Card>
  );
}
