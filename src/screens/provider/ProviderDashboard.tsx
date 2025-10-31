import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Badge } from '../../components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/avatar';
import { Switch } from '../../components/switch';
import { http } from '../../api/http';
import { colors, spacing } from '../../theme/tokens';

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
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(euros);
}

function statusToBadge(status: string) {
  switch ((status || '').toUpperCase()) {
    case 'CONFIRMED':
      return { label: 'Bestätigt', color: '#22C55E' };
    case 'PENDING':
      return { label: 'Ausstehend', color: '#EAB308' };
    case 'COMPLETED':
      return { label: 'Abgeschlossen', color: '#6B7280' };
    case 'CANCELLED':
      return { label: 'Storniert', color: '#EF4444' };
    default:
      return { label: 'Status', color: '#D1D5DB' };
  }
}

export function ProviderDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [p, d] = await Promise.all([
          http.get('/providers/me'),
          http.get('/providers/dashboard'),
        ]);
        if (!mounted) return;
        setProfile(p?.data || null);
        setDashboard(d?.data || null);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Fehler beim Laden';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const todayLabel = useMemo(() => new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);

  const todayAppointments: Appointment[] = (dashboard?.todayAppointments ?? []) as Appointment[];
  const recentReviews: Review[] = (dashboard?.recentReviews ?? []) as Review[];
  const quickActions: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Blockierte Zeit', icon: 'close-outline' },
    { label: 'Termin erstellen', icon: 'add-outline' },
    { label: 'Dienste bearbeiten', icon: 'create-outline' },
    { label: 'Verfügbarkeit', icon: 'time-outline' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
      {loading && !dashboard ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView>
          {/* Header */}
          <View style={{ backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#00000010' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>
                  Willkommen zurück{profile?.user?.firstName ? `, ${profile.user.firstName}!` : '!'} 👋
                </Text>
                <Text style={{ fontSize: 12, color: colors.gray600 }}>{todayLabel}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Pressable style={{ padding: 8 }}>
                  <Ionicons name="notifications-outline" size={22} color={colors.gray700} />
                </Pressable>
                <Pressable style={{ padding: 8 }}>
                  <Ionicons name="settings-outline" size={22} color={colors.gray700} />
                </Pressable>
              </View>
            </View>

            {/* Availability Toggle */}
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: isAvailable ? '#16A34A' : colors.gray600 }}>
                    {isAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.gray600 }}>
                    {isAvailable ? 'Kunden können dich jetzt buchen' : 'Du erscheinst nicht in den Suchergebnissen'}
                  </Text>
                </View>
                <Switch value={isAvailable} onValueChange={setIsAvailable} />
              </View>
            </Card>
          </View>

          {/* Stats Grid */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 }}>
              <Card style={{ width: '48%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="calendar-outline" size={16} color={colors.brown || '#8B4513'} />
                  <Text style={{ fontSize: 12, color: colors.gray600, marginLeft: 6 }}>Termine heute</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 22, color: colors.brown || '#8B4513', marginBottom: 4 }}>
                      {dashboard?.stats?.todayCount ?? 0}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="arrow-up-outline" size={12} color={'#16A34A'} />
                      <Text style={{ fontSize: 11, color: '#16A34A', marginLeft: 4 }}>+2 vs. gestern</Text>
                    </View>
                  </View>
                </View>
              </Card>

              <Card style={{ width: '48%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="time-outline" size={16} color={'#3B82F6'} />
                  <Text style={{ fontSize: 12, color: colors.gray600, marginLeft: 6 }}>Nächster Termin</Text>
                </View>
                <View>
                  {dashboard?.stats?.nextAppointment ? (
                    <>
                      <Text style={{ fontSize: 22, marginBottom: 2 }}>{dashboard.stats.nextAppointment.time}</Text>
                      <Text style={{ fontSize: 12, color: colors.gray600 }}>mit {dashboard.stats.nextAppointment.client}</Text>
                      <Text style={{ fontSize: 12, color: '#2563EB', marginTop: 2 }}>
                        In {Math.max(0, Math.floor(dashboard.stats.nextAppointment.hoursUntil))} Std. {Math.max(0, Math.round((dashboard.stats.nextAppointment.hoursUntil % 1) * 60))} Min.
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 12, color: colors.gray600 }}>Keine Termine heute</Text>
                  )}
                </View>
              </Card>

              <Card style={{ width: '48%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="cash-outline" size={16} color={'#16A34A'} />
                  <Text style={{ fontSize: 12, color: colors.gray600, marginLeft: 6 }}>Diese Woche</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 22, color: '#16A34A', marginBottom: 2 }}>{formatEuro(dashboard?.stats?.weekEarningsCents || 0)}</Text>
                  <Text style={{ fontSize: 10, color: colors.gray500 }}>(netto)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="arrow-up-outline" size={12} color={'#16A34A'} />
                    <Text style={{ fontSize: 11, color: '#16A34A', marginLeft: 4 }}>+18%</Text>
                  </View>
                </View>
              </Card>

              <Card style={{ width: '48%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="star-outline" size={16} color={'#F59E0B'} />
                  <Text style={{ fontSize: 12, color: colors.gray600, marginLeft: 6 }}>Bewertung</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 22, marginBottom: 2 }}>{(dashboard?.stats?.ratingAverage ?? 0).toFixed(1)} ★</Text>
                  <Text style={{ fontSize: 12, color: colors.gray600 }}>{dashboard?.stats?.reviewCount ?? 0} Bewertungen</Text>
                  <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 2 }}>→ Stabil</Text>
                </View>
              </Card>
            </View>

            {/* Today's Schedule */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Heutiger Zeitplan</Text>
                <Pressable onPress={() => {}}>
                  <Text style={{ fontSize: 12, color: colors.brown || '#8B4513' }}>Alle anzeigen</Text>
                </Pressable>
              </View>

              <View>
                {todayAppointments.map((appointment: Appointment) => (
                  <Card key={appointment.id} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ width: 8, alignItems: 'center', paddingTop: 4 }}>
                        <View style={{ width: 2, height: '100%', backgroundColor: '#22C55E', borderRadius: 1 }} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                          <View>
                            <Text style={{ fontSize: 12, color: colors.gray600 }}>{appointment.time}</Text>
                            {appointment.hoursUntil <= 3 && (
                              <Text style={{ fontSize: 12, color: '#2563EB' }}>
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
                          <Text style={{ color: colors.brown || '#8B4513', fontWeight: '700' }}>{formatEuro(appointment.priceCents)}</Text>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                          {appointment.hoursUntil <= 0.5 && (
                            <Button title="Starten" style={{ flex: 1, marginRight: 8, backgroundColor: '#22C55E' }} />
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
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Schnellaktionen</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {quickActions.map((qa) => (
                  <Card key={qa.label} style={{ width: '48%', paddingVertical: 16 }}>
                    <Pressable onPress={() => {}} style={{ alignItems: 'center' }}>
                      <Ionicons name={qa.icon} size={24} color={colors.gray600} />
                      <Text style={{ fontSize: 12, color: colors.gray700, marginTop: 8 }}>{qa.label}</Text>
                    </Pressable>
                  </Card>
                ))}
              </View>
            </View>

            {/* Recent Reviews */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Neueste Bewertungen</Text>
                <Pressable onPress={() => {}}>
                  <Text style={{ fontSize: 12, color: colors.brown || '#8B4513' }}>Alle anzeigen</Text>
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
                            <Ionicons key={i} name="star" size={12} color={'#F59E0B'} style={{ marginRight: 2 }} />
                          ))}
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.gray500 }}>{new Date(review.date).toLocaleDateString('de-DE')}</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: colors.gray700, marginBottom: 8 }}>{review.text}</Text>
                    {!review.hasResponse && (
                      <Button title="Antworten" variant="ghost" onPress={() => {}} />
                    )}
                  </Card>
                ))}
              </View>
            </View>
          </View>

          {!!error && (
            <View style={{ paddingHorizontal: 16 }}>
              <Card>
                <Text style={{ color: '#991B1B' }}>{error}</Text>
              </Card>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
