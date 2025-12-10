import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Badge } from '@/components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/avatar';
import { Switch } from 'react-native';
import { http } from '@/api/http';
import { colors, spacing, typography } from '@/theme/tokens';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { logger } from '@/services/logger';
import { API_CONFIG, MESSAGES } from '@/constants';
import { getErrorMessage } from '@/presentation/utils/errorHandler';
// Removed unused ProviderTabsParamList import

type NextAppointment = {
  time: string;
  client: string;
  hoursUntil: number;
};

type Stats = {
  todayCount: number;
  nextAppointment?: NextAppointment | null;
  weekEarningsCents: number;
  ratingAverage: number;
  reviewCount: number;
};

type Appointment = {
  id: string | number;
  time: string;
  hoursUntil: number;
  status: string;
  client: { name: string; image?: string | null };
  service: string;
  priceCents: number;
};

type Review = {
  id: string | number;
  client: string;
  rating: number;
  date: string;
  text: string;
  hasResponse?: boolean;
};

type DashboardData = {
  stats: Stats;
  todayAppointments: Appointment[];
  recentReviews: Review[];
};

function formatEuro(cents: number) {
  const euros = (cents || 0) / 100;
  try {
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(euros);
    }
  } catch {}
  // Fallback formatting
  const value = Math.round((euros + Number.EPSILON));
  return `€${value.toString()}`;
}

function safeLocaleDateString(date: Date, locale: string, options?: Intl.DateTimeFormatOptions) {
  try {
    return date.toLocaleDateString(locale, options);
  } catch {
    // Fallback: DD.MM.YYYY
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  }
}

function statusToBadge(status: string) {
  switch ((status || '').toUpperCase()) {
    case 'CONFIRMED':
      return { label: 'Bestätigt', color: colors.green600 };
    case 'PENDING':
      return { label: 'Ausstehend', color: colors.amber600 };
    case 'COMPLETED':
      return { label: 'Abgeschlossen', color: colors.gray600 };
    case 'CANCELLED':
      return { label: 'Storniert', color: colors.error };
    default:
      return { label: 'Status', color: colors.gray300 };
  }
}

export function ProviderDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [profile, setProfile] = useState<{ name?: string; avatarUrl?: string | null } | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [p, d] = await Promise.all([
          http.get(API_CONFIG.ENDPOINTS.PROVIDERS.ME),
          http.get(API_CONFIG.ENDPOINTS.PROVIDERS.DASHBOARD),
        ]);
        if (!mounted) return;
        setProfile(p?.data || null);
        setDashboard(d?.data || null);
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        if (mounted) setError(msg);
        logger.error('Failed to load dashboard:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const todayLabel = useMemo(() => safeLocaleDateString(new Date(), 'de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);

  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayYmd = useMemo(() => toYMD(new Date()), []);

  const todayAppointments: Appointment[] = (dashboard?.todayAppointments ?? []) as Appointment[];
  const recentReviews: Review[] = (dashboard?.recentReviews ?? []) as Review[];
  const quickActions: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Blockierte Zeit', icon: 'close-outline' },
    { label: 'Termin erstellen', icon: 'add-outline' },
    { label: 'Dienste bearbeiten', icon: 'create-outline' },
    { label: 'Verfügbarkeit', icon: 'time-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && !dashboard ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.welcomeText}>
                  Willkommen zurück{profile?.name ? `, ${profile.name}!` : '!'} 👋
                </Text>
                <Text style={styles.dateText}>{todayLabel}</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable style={styles.headerActionButton}>
                  <Ionicons name="notifications-outline" size={22} color={colors.gray700} />
                </Pressable>
                <Pressable style={styles.headerActionButton}>
                  <Ionicons name="settings-outline" size={22} color={colors.gray700} />
                </Pressable>
              </View>
            </View>

            {/* Availability Toggle */}
            <Card>
              <View style={styles.rowBetweenCenter}>
                <View>
                  <Text style={[styles.availabilityText, { color: isAvailable ? colors.green600 : colors.gray600 }]}>
                    {isAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
                  </Text>
                  <Text style={styles.availabilityDescription}>
                    {isAvailable ? 'Kunden können dich jetzt buchen' : 'Du erscheinst nicht in den Suchergebnissen'}
                  </Text>
                </View>
                <Switch value={isAvailable} onValueChange={setIsAvailable} />
              </View>
            </Card>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Kalender', { screen: 'ProviderCalendar', params: { targetDate: todayYmd, viewMode: 'day' } })}
              >
                <View style={styles.statHeader}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} style={styles.statIcon} />
                  <Text style={styles.statLabel}>Termine heute</Text>
                </View>
                <View style={styles.rowEndBetween}>
                  <View>
                    <Text style={styles.statNumber}>
                      {dashboard?.stats?.todayCount ?? 0}
                    </Text>
                    <View style={styles.changeRow}>
                      <Ionicons name="arrow-up-outline" size={12} color={colors.green600} />
                      <Text style={styles.positiveChangeText}>+2 vs. gestern</Text>
                    </View>
                  </View>
                </View>
              </Card>

              <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Kalender', { screen: 'ProviderCalendar', params: { targetDate: todayYmd, viewMode: 'day' } })}
              >
                <View style={styles.statHeader}>
                  <Ionicons name="time-outline" size={16} color={colors.blue600} style={styles.statIcon} />
                  <Text style={styles.statLabel}>Nächster Termin</Text>
                </View>
                <View>
                  {dashboard?.stats?.nextAppointment ? (
                    <>
                      <Text style={styles.nextTimeText}>{dashboard.stats.nextAppointment.time}</Text>
                      <Text style={styles.smallMutedText}>mit {dashboard.stats.nextAppointment.client}</Text>
                      <Text style={styles.timeUntilText}>
                        In {Math.max(0, Math.floor(dashboard.stats.nextAppointment.hoursUntil))} Std. {Math.max(0, Math.round((dashboard.stats.nextAppointment.hoursUntil % 1) * 60))} Min.
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.smallMutedText}>Keine Termine heute</Text>
                  )}
                </View>
              </Card>

              <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderAnalyticsScreen' })}
              >
                <View style={styles.statHeader}>
                  <Ionicons name="cash-outline" size={16} color={colors.green600} style={styles.statIcon} />
                  <Text style={styles.statLabel}>Diese Woche</Text>
                </View>
                <View>
                  <Text style={[styles.statNumber, styles.mb2, { color: colors.green600 }]}>{formatEuro(dashboard?.stats?.weekEarningsCents || 0)}</Text>
                  <Text style={styles.nettoText}>(netto)</Text>
                  <View style={styles.changeRow}>
                    <Ionicons name="arrow-up-outline" size={12} color={colors.green600} />
                    <Text style={styles.positiveChangeText}>+18%</Text>
                  </View>
                </View>
              </Card>

              <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderReviewsScreen' })}
              >
                <View style={styles.statHeader}>
                  <Ionicons name="star-outline" size={16} color={colors.amber600} style={styles.statIcon} />
                  <Text style={styles.statLabel}>Bewertung</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 22, marginBottom: 2 }}>{(dashboard?.stats?.ratingAverage ?? 0).toFixed(1)} ★</Text>
                  <Text style={{ fontSize: 12, color: colors.gray600 }}>{dashboard?.stats?.reviewCount ?? 0} Bewertungen</Text>
                  <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 2 }}>→ Stabil</Text>
                </View>
              </Card>
            </View>

            {/* Today's Schedule */}
                <View style={styles.mbMd}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Heutiger Zeitplan</Text>
                <Pressable onPress={() => rootNavigationRef.current?.navigate('Kalender', { screen: 'ProviderCalendar', params: { targetDate: todayYmd, viewMode: 'day' } })}>
                  <Text style={styles.seeAllText}>Alle anzeigen</Text>
                </Pressable>
              </View>

              <View>
                {todayAppointments.map((appointment: Appointment) => (
                  <Card key={appointment.id} style={styles.cardMb12}>
                    <View style={styles.row}>
                      <View style={styles.indicatorContainer}>
                        <View style={styles.appointmentIndicator} />
                      </View>
                      <View style={styles.flex1}>
                        <View style={styles.appointmentHeaderRow}>
                          <View>
                            <Text style={styles.smallMutedText}>{appointment.time}</Text>
                            {appointment.hoursUntil <= 3 && (
                              <Text style={styles.timeUntilText}>
                                In {Math.max(0, Math.floor(appointment.hoursUntil))} Std. {Math.max(0, Math.round((appointment.hoursUntil % 1) * 60))} Min.
                              </Text>
                            )}
                          </View>
                          {(() => {
                            const b = statusToBadge(appointment.status);
                            return (
                              <Badge style={{ backgroundColor: b.color, borderColor: b.color }}>
                                {b.label}
                              </Badge>
                            );
                          })()}
                        </View>

                        <View style={styles.appointmentRow}>
                          <Avatar size={40}>
                            {appointment.client.image ? (
                              <AvatarImage uri={appointment.client.image} />
                            ) : (
                              <AvatarFallback label={(appointment.client.name || 'K').slice(0, 2).toUpperCase()} />
                            )}
                          </Avatar>
                          <View style={styles.clientInfo}>
                            <Text style={styles.clientName}>{appointment.client.name}</Text>
                            <Text style={styles.smallMutedText}>{appointment.service}</Text>
                          </View>
                          <Text style={styles.priceText}>{formatEuro(appointment.priceCents)}</Text>
                        </View>

                        <View style={styles.row}>
                          {appointment.hoursUntil <= 0.5 && (
                            <Button title="Starten" style={[styles.actionButton, { backgroundColor: colors.green600 }]} />
                          )}
                          <Button title="Nachricht" variant="ghost" style={styles.ghostButtonWide} />
                          <Button title="Mehr" variant="ghost" />
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}

                <View style={styles.dashedRow}>
                  <View style={styles.dashedDivider} />
                  <Text style={styles.smallGrayText}>15:00 - 16:00 Frei</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
              <View style={styles.mbMd}>
              <Text style={[styles.sectionTitle, styles.mbSm]}>Schnellaktionen</Text>
              <View style={styles.quickActionsRow}>
                {quickActions.map((qa) => (
                  <Card key={qa.label} style={styles.quickActionCard}>
                    <Pressable
                      onPress={() => {
                        switch (qa.label) {
                          case 'Blockierte Zeit':
                            rootNavigationRef.current?.navigate('Kalender', { screen: 'BlockTimeScreen' });
                            break;
                          case 'Termin erstellen':
                            rootNavigationRef.current?.navigate('Kalender', { screen: 'CreateAppointmentScreen' });
                            break;
                          case 'Dienste bearbeiten':
                            rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderServicesScreen' });
                            break;
                          case 'Verfügbarkeit':
                            rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderAvailabilityScreen' });
                            break;
                          default:
                            break;
                        }
                      }}
                      style={styles.centered}
                    >
                      <Ionicons name={qa.icon} size={24} color={colors.gray600} />
                      <Text style={styles.quickActionLabel}>{qa.label}</Text>
                    </Pressable>
                  </Card>
                ))}
              </View>
              </View>

            {/* Recent Reviews */}
            <View>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Neueste Bewertungen</Text>
                <Pressable onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderReviewsScreen' })}>
                  <Text style={styles.seeAllText}>Alle anzeigen</Text>
                </Pressable>
              </View>

              <View>
                {recentReviews.map((review: Review) => (
                  <Card key={review.id} style={styles.cardMb12}>
                    <View style={styles.reviewHeaderRow}>
                      <View>
                        <Text style={styles.reviewClientName}>{review.client}</Text>
                        <View style={styles.reviewStarsRow}>
                          {Array.from({ length: review.rating }).map((_, i) => (
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
                        onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderReviewsScreen', params: { initialFilter: 'unresponded', focusReviewId: review.id } })}
                      />
                    )}
                  </Card>
                ))}
              </View>
            </View>
          </View>

          {!!error && (
            <View style={styles.errorContainerPadding}>
              <Card>
                <Text style={styles.errorText}>{error}</Text>
              </Card>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appointmentHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appointmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardMb12: {
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  appointmentIndicator: {
    backgroundColor: colors.green600,
    borderRadius: 1,
    height: '100%',
    width: 2,
  },
  centered: {
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  availabilityDescription: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  availabilityText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
  },
  changeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  dashedDivider: {
    borderColor: colors.gray300,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    height: 48,
    marginRight: 8,
  },
  dashedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dateText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  errorText: {
    color: colors.error,
  },
  errorContainerPadding: {
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.overlay,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerActionButton: {
    padding: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  indicatorContainer: {
    alignItems: 'center',
    paddingTop: 4,
    width: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  mb2: {
    marginBottom: 2,
  },
  mbMd: {
    marginBottom: spacing.md,
  },
  mbSm: {
    marginBottom: spacing.sm,
  },
  nettoText: {
    color: colors.gray500,
    fontSize: 10,
  },
  nextTimeText: {
    fontSize: 22,
    marginBottom: 2,
  },
  positiveChangeText: {
    color: colors.green600,
    fontSize: 11,
    marginLeft: spacing.xs,
  },
  priceText: {
    color: colors.primary,
    fontWeight: '700',
  },
  ghostButtonWide: {
    flex: 1,
  },
  quickActionCard: {
    paddingVertical: 16,
    width: '48%',
  },
  quickActionLabel: {
    color: colors.gray700,
    fontSize: 12,
    marginTop: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  rowBetweenCenter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowEndBetween: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: typography.small.fontSize,
  },
  smallGrayText: {
    color: colors.gray500,
    fontSize: 12,
  },
  smallMutedText: {
    color: colors.gray600,
    fontSize: 12,
  },
  starIcon: {
    marginRight: 2,
  },
  statCard: {
    width: '48%',
  },
  statHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 6,
  },
  statIcon: {
    marginRight: spacing.xs,
  },
  statLabel: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  statNumber: {
    color: colors.primary,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  reviewClientName: {
    fontSize: 16,
    fontWeight: '700',
  },
  reviewHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewText: {
    color: colors.gray700,
    fontSize: 14,
    marginBottom: 8,
  },
  timeUntilText: {
    color: colors.blue900,
    fontSize: typography.small.fontSize,
    marginTop: 2,
  },
  welcomeText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
});
