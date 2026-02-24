import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { useProviderGate } from '@/hooks/useProviderGate';
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
import { IClient } from '@/domain/models/client';

import type { ProviderClientsStackScreenProps } from '@/navigation/types';

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

// ... imports

type FilterType = 'all' | 'repeat' | 'new';
type SortType = 'recent' | 'az';

export function ProviderClients() {
  const navigation = useNavigation<ProviderClientsStackScreenProps<'ProviderClients'>['navigation']>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    items: IClient[]; // Use Domain Model
    totalClients?: number;
    regularCustomers?: number;
    newThisWeek?: number;
  } | null>(null);



  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use existing API call from http or newer providerClientsApi
      // Using http as it was before to match structure expected by filteredClients
      const res = await http.get('/providers/me/clients');
      // If res.data is expected structure { success: true, data: { items: [], ... } }
      // Or just { items: [] }
      const payload = res?.data;
      if (payload && payload.data) {
        setData(payload.data);
      } else {
        setData(payload || { items: [] });
      }
    } catch (err) {
      setError('Fehler beim Laden der Kunden.');
    } finally {
      setLoading(false);
    }
  };

  const goToClient = (clientId: string) => {
    // Navigation to Detail
    // @ts-ignore - stack params might need update
    navigation.navigate('ClientDetailScreen', { clientId });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation]);

  const filteredClients: IClient[] = useMemo(() => {
    let items = ((data?.items || []) as IClient[]).slice();

    // 1. Search
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      items = items.filter((c) => (c.name || '').toLowerCase().includes(q));
    }

    // 2. Filter
    if (activeFilter === 'repeat') {
      // Logic: Regular/Repeat customers (e.g. >= 2 apps or isVIP)
      // The stat card says "Stammkunden" (Regular), backend usually defines this.
      // Let's use isVIP or appointments > 1
      items = items.filter(c => c.isVIP || c.appointments >= 2);
    } else if (activeFilter === 'new') {
      // "New" logic: Joined recently? Or last visit recently?
      // Let's use lastVisitRelative containing "Tag" or "Woche" or "gerade eben"
      // Better: Use lastVisitIso compare?
      // Should match "newThisWeek" logic roughly.
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      items = items.filter(c => c.lastVisitIso && new Date(c.lastVisitIso) >= oneWeekAgo);
    }

    // 3. Sort
    items.sort((a, b) => {
      if (activeSort === 'az') {
        return (a.name || '').localeCompare(b.name || '');
      } else {
        // Recent (default)
        return (b.lastVisitIso || '').localeCompare(a.lastVisitIso || '');
      }
    });

    return items;
  }, [data, searchQuery, activeFilter, activeSort]);

  // ... (rest of methods)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header ... */}
        {/* Search ... */}
        {/* Stats ... */}
        <View style={styles.statsContainer}>
          {/* ... stats cards ... */}

          {/* Sort/Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            <Button
              title="Neueste"
              variant={activeSort === 'recent' ? 'primary' : 'ghost'}
              onPress={() => setActiveSort('recent')}
              style={styles.filterButton}
              textStyle={{ fontSize: 13 }}
            />
            <Button
              title="A-Z"
              variant={activeSort === 'az' ? 'primary' : 'ghost'}
              onPress={() => setActiveSort('az')}
              style={styles.filterButton}
              textStyle={{ fontSize: 13 }}
            />
            <View style={{ width: 1, backgroundColor: colors.gray300, height: 20, marginHorizontal: 8, alignSelf: 'center' }} />
            <Button
              title="Alle"
              variant={activeFilter === 'all' ? 'primary' : 'ghost'}
              onPress={() => setActiveFilter('all')}
              style={styles.filterButton}
              textStyle={{ fontSize: 13 }}
            />
            <Button
              title="Stammkunden"
              variant={activeFilter === 'repeat' ? 'primary' : 'ghost'}
              onPress={() => setActiveFilter('repeat')}
              style={styles.filterButton}
              textStyle={{ fontSize: 13 }}
            />
            <Button
              title="Neu"
              variant={activeFilter === 'new' ? 'primary' : 'ghost'}
              onPress={() => setActiveFilter('new')}
              style={styles.filterButton}
              textStyle={{ fontSize: 13 }}
            />
          </ScrollView>

          {/* Clients List */}
          {error ? (
            <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Erneut versuchen" onPress={load} />
            </View>
          ) : null}

          <View>
            {filteredClients.map((client: IClient) => (
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
