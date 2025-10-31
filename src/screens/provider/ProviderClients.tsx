import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Badge } from '../../components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/avatar';
import { http } from '../../api/http';
import { colors, spacing } from '../../theme/tokens';

type Client = {
  id: string;
  name: string;
  image?: string | null;
  isVIP?: boolean;
  phone?: string | null;
  appointments?: number;
  totalSpentCents?: number;
  lastVisitIso?: string | null;
};

function formatRelativeGerman(iso: string | Date | undefined | null): string {
  if (!iso) return '';
  try {
    const date = iso instanceof Date ? iso : new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) return 'gerade eben';
      return `vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;
    }
    if (diffDays < 7) return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `vor ${diffWeeks} ${diffWeeks === 1 ? 'Woche' : 'Wochen'}`;
    const diffMonths = Math.floor(diffDays / 30);
    return `vor ${diffMonths} ${diffMonths === 1 ? 'Monat' : 'Monaten'}`;
  } catch {
    return '';
  }
}

export function ProviderClients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    items: Client[];
    totalClients?: number;
    regularCustomers?: number;
    newThisWeek?: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await http.get('/providers/clients');
        if (!mounted) return;
        setData(res?.data || null);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Fehler beim Laden der Kunden';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredClients: Client[] = useMemo(() => {
    const items = ((data?.items || []) as Client[]).slice();
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => (c.name || '').toLowerCase().includes(q));
  }, [data, searchQuery]);

  const goToAddClient = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider/add-client'; } catch {}
    }
  };
  const goToClient = (id: string) => {
    if (Platform.OS === 'web') {
      try { window.location.hash = `/provider/clients/${id}`; } catch {}
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
      <ScrollView>
        {/* Header */}
        <View style={{ backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderColor: '#00000010' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Meine Kunden</Text>
            <Pressable onPress={goToAddClient} style={{ padding: 6 }} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
              <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
          {/* Search */}
          <View style={{ position: 'relative' }}>
            <Ionicons name="search-outline" size={18} color={colors.gray400} style={{ position: 'absolute', left: 10, top: 12 }} />
            <Input
              placeholder="Kunde suchen..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ paddingLeft: 36 }}
            />
          </View>
        </View>

        {/* Stats Overview */}
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Card style={{ width: '32%', alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontSize: 20, color: colors.primary, marginBottom: 4 }}>
                {data?.totalClients ?? (loading ? '…' : 0)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Kunden</Text>
            </Card>
            <Card style={{ width: '32%', alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontSize: 20, color: colors.primary, marginBottom: 4 }}>
                {data?.regularCustomers ?? (loading ? '…' : 0)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Stammkunden</Text>
            </Card>
            <Card style={{ width: '32%', alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontSize: 20, color: '#16A34A', marginBottom: 4 }}>
                {typeof data?.newThisWeek === 'number' ? `+${data?.newThisWeek}` : (loading ? '…' : '+0')}
              </Text>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Diese Woche</Text>
            </Card>
          </View>

          {/* Sort/Filter (placeholder chips) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }} contentContainerStyle={{ paddingRight: 8 }}>
            <Button title="Neueste" variant="ghost" style={{ marginRight: 8 }} />
            <Button title="A-Z" variant="ghost" style={{ marginRight: 8 }} />
            <Button title="Häufigste" variant="ghost" style={{ marginRight: 8 }} />
            <Button title="Stammkunden" variant="ghost" style={{ marginRight: 8 }} />
          </ScrollView>

          {/* Clients List */}
          {error ? (
            <Text style={{ textAlign: 'center', color: '#991B1B', marginBottom: 8 }}>{error}</Text>
          ) : null}

          <View>
            {filteredClients.map((client: Client) => (
              <Card key={client.id} style={{ marginBottom: 12 }}>
                <Pressable onPress={() => goToClient(client.id)} style={{ flexDirection: 'row' }} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
                  <Avatar size={56} style={{ marginRight: 12 }}>
                    {client.image ? (
                      <AvatarImage uri={client.image} />
                    ) : (
                      <AvatarFallback label={(client.name || 'K').slice(0, 2).toUpperCase()} />
                    )}
                  </Avatar>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700' }}>{client.name}</Text>
                      {client.isVIP ? (
                        <Badge style={{ marginLeft: 8, backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}>VIP</Badge>
                      ) : null}
                    </View>
                    {!!client.phone && (
                      <Pressable onPress={(e) => { e?.stopPropagation?.(); Linking.openURL(`tel:${client.phone}`); }} style={{ marginBottom: 6 }}>
                        <Text style={{ color: colors.gray600 }}>{client.phone}</Text>
                      </Pressable>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                        <Ionicons name="calendar-outline" size={12} color={colors.gray600} />
                        <Text style={{ fontSize: 12, color: colors.gray600, marginLeft: 4 }}>{client.appointments} Termine</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="card-outline" size={12} color={colors.gray600} />
                        <Text style={{ fontSize: 12, color: colors.gray600, marginLeft: 4 }}>€{(((client.totalSpentCents ?? 0) / 100)).toFixed(2)}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 4 }}>Letzter Termin: {formatRelativeGerman(client.lastVisitIso)}</Text>
                  </View>

                  <View style={{ alignSelf: 'center' }}>
                    <Ionicons name="star" size={20} color={client.isVIP ? '#F59E0B' : colors.gray300} />
                  </View>
                </Pressable>
              </Card>
            ))}
          </View>

          {/* Empty State */}
          {!loading && filteredClients.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>👥</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>Keine Kunden gefunden</Text>
              <Text style={{ color: colors.gray600, marginBottom: 12 }}>
                {searchQuery ? 'Versuche andere Suchbegriffe' : 'Kunden werden automatisch hinzugefügt'}
              </Text>
              {!!searchQuery && (
                <Button title="Filter zurücksetzen" variant="ghost" onPress={() => setSearchQuery('')} />
              )}
            </View>
          )}

          {loading && (
            <View>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gray200, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ height: 16, backgroundColor: colors.gray200, width: '35%', marginBottom: 8, borderRadius: 4 }} />
                      <View style={{ height: 12, backgroundColor: colors.gray200, width: '55%', marginBottom: 6, borderRadius: 4 }} />
                      <View style={{ height: 12, backgroundColor: colors.gray200, width: '70%', borderRadius: 4 }} />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProviderClients;