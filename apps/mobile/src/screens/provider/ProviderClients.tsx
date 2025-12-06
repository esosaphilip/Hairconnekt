import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Badge } from '@/components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/avatar';
import { http } from '@/api/http';
import { colors, spacing, typography } from '@/theme/tokens';
import { API_CONFIG } from '@/constants';
import { MESSAGES } from '@/constants';
import { showError } from '@/presentation/utils/errorHandler';
import type { ProviderClientsStackScreenProps } from '@/navigation/types';

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
  const navigation = useNavigation<ProviderClientsStackScreenProps<'ProviderClients'>['navigation']>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    items: Client[];
    totalClients?: number;
    regularCustomers?: number;
    newThisWeek?: number;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get(API_CONFIG.ENDPOINTS.PROVIDERS.CLIENTS);
      setData(res?.data || null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : MESSAGES.ERROR.LOAD_FAILED;
      setError(message);
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
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
    // TODO: Navigate to add client screen when implemented
    // navigation.navigate('AddClient');
  };

  const goToClient = (id: string) => {
    navigation.navigate('ProviderClientDetail', { id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Meine Kunden</Text>
            <Pressable onPress={goToAddClient} style={styles.addButton} accessibilityRole="button">
              <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={colors.gray400} style={styles.searchIcon} />
            <Input
              placeholder="Kunde suchen..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{data?.totalClients ?? (loading ? '…' : 0)}</Text>
              <Text style={styles.statLabel}>Kunden</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{data?.regularCustomers ?? (loading ? '…' : 0)}</Text>
              <Text style={styles.statLabel}>Stammkunden</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNumber, styles.statNumberGreen]}>
                {typeof data?.newThisWeek === 'number' ? `+${data?.newThisWeek}` : (loading ? '…' : '+0')}
              </Text>
              <Text style={styles.statLabel}>Diese Woche</Text>
            </Card>
          </View>

          {/* Sort/Filter (placeholder chips) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            <Button title="Neueste" variant="ghost" style={styles.filterButton} />
            <Button title="A-Z" variant="ghost" style={styles.filterButton} />
            <Button title="Häufigste" variant="ghost" style={styles.filterButton} />
            <Button title="Stammkunden" variant="ghost" style={styles.filterButton} />
          </ScrollView>

          {/* Clients List */}
          {error ? (
            <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Erneut versuchen" onPress={load} />
            </View>
          ) : null}

          <View>
            {filteredClients.map((client: Client) => (
              <Card key={client.id} style={styles.clientCard}>
                <Pressable onPress={() => goToClient(client.id)} style={styles.clientRow} accessibilityRole="button">
                  <Avatar size={56} style={styles.avatar}>
                    {client.image ? (
                      <AvatarImage uri={client.image} />
                    ) : (
                      <AvatarFallback label={(client.name || 'K').slice(0, 2).toUpperCase()} />
                    )}
                  </Avatar>

                  <View style={styles.clientInfo}>
                    <View style={styles.clientHeader}>
                      <Text numberOfLines={1} style={styles.clientName}>{client.name}</Text>
                      {client.isVIP ? (
                        <Badge style={styles.vipBadge} title="VIP" />
                      ) : null}
                    </View>
                    {!!client.phone && (
                      <Pressable onPress={(e) => { e?.stopPropagation?.(); Linking.openURL(`tel:${client.phone}`); }} style={styles.phoneContainer}>
                        <Text style={styles.phoneText}>{client.phone}</Text>
                      </Pressable>
                    )}
                    <View style={styles.clientMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color={colors.gray600} />
                        <Text style={styles.metaText}>{client.appointments ?? 0} Termine</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="card-outline" size={12} color={colors.gray600} />
                        <Text style={styles.metaText}>€{(((client.totalSpentCents ?? 0) / 100)).toFixed(2)}</Text>
                      </View>
                    </View>
                    <Text style={styles.lastVisitText}>Letzter Termin: {formatRelativeGerman(client.lastVisitIso)}</Text>
                  </View>

                  <View style={styles.starContainer}>
                    <Ionicons name="star" size={20} color={client.isVIP ? colors.amber600 : colors.gray300} />
                  </View>
                </Pressable>
              </Card>
            ))}
          </View>

          {/* Empty State */}
          {!loading && filteredClients.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyTitle}>Keine Kunden gefunden</Text>
              <Text style={styles.emptyText}>
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
                <Card key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonRow}>
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonContent}>
                      <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                      <View style={[styles.skeletonLine, styles.skeletonLineMedium]} />
                      <View style={[styles.skeletonLine, styles.skeletonLineLong]} />
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

const styles = StyleSheet.create({
  addButton: {
    padding: spacing.xs,
  },
  avatar: {
    marginRight: spacing.sm,
  },
  clientCard: {
    marginBottom: spacing.sm,
  },
  clientHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  clientInfo: {
    flex: 1,
    minWidth: 0,
  },
  clientMeta: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  clientName: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  clientRow: {
    flexDirection: 'row',
  },
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.gray600,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  filterButton: {
    marginRight: spacing.sm,
  },
  filterContent: {
    paddingRight: spacing.sm,
  },
  filterScroll: {
    marginBottom: spacing.sm,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  lastVisitText: {
    color: colors.gray500,
    fontSize: typography.small.fontSize,
    marginTop: spacing.xs,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  metaText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
    marginLeft: spacing.xs,
  },
  phoneContainer: {
    marginBottom: spacing.xs,
  },
  phoneText: {
    color: colors.gray600,
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    left: spacing.sm,
    position: 'absolute',
    top: 12,
  },
  searchInput: {
    paddingLeft: 36,
  },
  skeletonAvatar: {
    backgroundColor: colors.gray200,
    borderRadius: 28,
    height: 56,
    marginRight: spacing.sm,
    width: 56,
  },
  skeletonCard: {
    marginBottom: spacing.sm,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonLine: {
    backgroundColor: colors.gray200,
    borderRadius: 4,
    height: 12,
    marginBottom: spacing.xs,
  },
  skeletonLineLong: {
    width: '70%',
  },
  skeletonLineMedium: {
    marginBottom: spacing.xs,
    width: '55%',
  },
  skeletonLineShort: {
    height: 16,
    marginBottom: spacing.sm,
    width: '35%',
  },
  skeletonRow: {
    flexDirection: 'row',
  },
  starContainer: {
    alignSelf: 'center',
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    width: '32%',
  },
  statLabel: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  statNumber: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statNumberGreen: {
    color: colors.success,
  },
  statsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  vipBadge: {
    backgroundColor: colors.amber600,
    borderColor: colors.amber600,
    marginLeft: spacing.sm,
  },
});

export default ProviderClients;
