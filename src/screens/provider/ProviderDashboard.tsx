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
import { useNavigation } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { logger } from '@/services/logger';
import { API_CONFIG, MESSAGES } from '@/constants';
import type { ProviderTabsParamList } from '@/navigation/types';

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
  const navigation = useNavigation();
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
        const msg = err instanceof Error ? err.message : MESSAGES.ERROR.UNKNOWN;
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
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
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
                      <Text style={{ fontSize: 22, marginBottom: 2 }}>{dashboard.stats.nextAppointment.time}</Text>
                      <Text style={{ fontSize: 12, color: colors.gray600 }}>mit {dashboard.stats.nextAppointment.client}</Text>
                      <Text style={styles.timeUntilText}>
                        In {Math.max(0, Math.floor(dashboard.stats.nextAppointment.hoursUntil))} Std. {Math.max(0, Math.round((dashboard.stats.nextAppointment.hoursUntil % 1) * 60))} Min.
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 12, color: colors.gray600 }}>Keine Termine heute</Text>
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
                  <Text style={[styles.statNumber, { color: colors.green600, marginBottom: 2 }]}>{formatEuro(dashboard?.stats?.weekEarningsCents || 0)}</Text>
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
            <View style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={styles.sectionTitle}>Heutiger Zeitplan</Text>
                <Pressable onPress={() => rootNavigationRef.current?.navigate('Kalender', { screen: 'ProviderCalendar', params: { targetDate: todayYmd, viewMode: 'day' } })}>
                  <Text style={styles.seeAllText}>Alle anzeigen</Text>
                </Pressable>
              </View>

              <View>
                {todayAppointments.map((appointment: Appointment) => (
                  <Card key={appointment.id} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ width: 8, alignItems: 'center', paddingTop: 4 }}>
                        <View style={styles.appointmentIndicator} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                          <View>
                            <Text style={{ fontSize: 12, color: colors.gray600 }}>{appointment.time}</Text>
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

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Avatar size={40}>
                            {appointment.client.image ? (
                              <AvatarImage uri={appointment.client.image} />
                            ) : (
                              <AvatarFallback label={(appointment.client.name || 'K').slice(0, 2).toUpperCase()} />
                            )}
                          </Avatar>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700' }}>{appointment.client.name}</Text>
                            <Text style={{ fontSize: 12, color: colors.gray600 }}>{appointment.service}</Text>
                          </View>
                          <Text style={styles.priceText}>{formatEuro(appointment.priceCents)}</Text>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                          {appointment.hoursUntil <= 0.5 && (
                            <Button title="Starten" style={[styles.actionButton, { backgroundColor: colors.green600 }]} />
                          )}
                          <Button title="Nachricht" variant="ghost" style={{ flex: 1, marginRight: 8 }} />
                          <Button title="Mehr" variant="ghost" />
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}

                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                  <View style={{ height: 48, borderLeftWidth: 2, borderStyle: 'dashed', borderColor: colors.gray300, marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: colors.gray500 }}>15:00 - 16:00 Frei</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Schnellaktionen</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {quickActions.map((qa) => (
                  <Card key={qa.label} style={{ width: '48%', paddingVertical: 16 }}>
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
                      style={{ alignItems: 'center' }}
                    >
                      <Ionicons name={qa.icon} size={24} color={colors.gray600} />
                      <Text style={{ fontSize: 12, color: colors.gray700, marginTop: 8 }}>{qa.label}</Text>
                    </Pressable>
                  </Card>
                ))}
              </View>
            </View>

            {/* Recent Reviews */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={styles.sectionTitle}>Neueste Bewertungen</Text>
                <Pressable onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderReviewsScreen' })}>
                  <Text style={styles.seeAllText}>Alle anzeigen</Text>
                </Pressable>
              </View>

              <View>
                {recentReviews.map((review: Review) => (
                  <Card key={review.id} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: '700' }}>{review.client}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 4 }}>
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Ionicons key={i} name="star" size={12} color={colors.amber600} style={styles.starIcon} />
                          ))}
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.gray500 }}>{safeLocaleDateString(new Date(review.date), 'de-DE')}</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: colors.gray700, marginBottom: 8 }}>{review.text}</Text>
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
            <View style={{ paddingHorizontal: 16 }}>
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
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.overlay,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  dateText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    padding: spacing.sm,
  },
  availabilityText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  availabilityDescription: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
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
  changeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  positiveChangeText: {
    color: colors.green600,
    fontSize: 11,
    marginLeft: spacing.xs,
  },
  timeUntilText: {
    color: colors.blue900,
    fontSize: typography.small.fontSize,
    marginTop: 2,
  },
  nettoText: {
    color: colors.gray500,
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  seeAllText: {
    color: colors.primary,
    fontSize: typography.small.fontSize,
  },
  appointmentIndicator: {
    backgroundColor: colors.green600,
    borderRadius: 1,
    height: '100%',
    width: 2,
  },
  priceText: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  starIcon: {
    marginRight: 2,
  },
  errorText: {
    color: colors.error,
  },
});
