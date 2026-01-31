import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppImage } from '@/components/AppImage';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';

import IconButton from '../../components/IconButton';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { http } from '../../api/http';
import { API_BASE_URL } from '../../config';
import { getAuthBundle } from '../../auth/tokenStorage';

// Screen width for responsive grid calculation
const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const cardMargin = SPACING.sm;
const listPadding = SPACING.md;
const cardWidth = (screenWidth - listPadding * 2 - (numColumns - 1) * cardMargin) / numColumns;

type PortfolioItem = {
  id: string;
  image: string;
  title?: string;
  category?: string;
  createdAt?: string;
  views: number;
  likes: number;
};

// Local URL logic removed in favor of AppImage


export function PortfolioManagementScreen() {
  const navigation = useNavigation<any>();
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const res = await http.get('/providers/me/portfolio', { params: { limit: 50, sort: 'latest' } });
      const payload = res?.data;

      let list = [];
      if (payload && typeof payload === 'object') {
        if ('data' in payload && (payload as any).data && 'items' in (payload as any).data) { // Standard backend response
          list = (payload as any).data.items;
        } else if ('items' in payload) { // Direct service response
          list = (payload as any).items;
        } else if (Array.isArray(payload)) {
          list = payload;
        }
      }

      type RawPortfolioItem = {
        id: string;
        imageUrl?: string;
        caption?: string;
        title?: string;
        category?: any;
        uploadedAt?: string;
        viewCount?: number;
        likeCount?: number;
      };

      const items = Array.isArray(list) ? (list as RawPortfolioItem[]) : [];
      const mapped: PortfolioItem[] = items.map((it) => ({
        id: it.id,
        image: it.imageUrl || '',
        title: it.caption || it.title || '',
        category: typeof it.category === 'object' ? (it.category?.nameDe || it.category?.nameEn || '') : String(it.category || ''),
        createdAt: it.uploadedAt,
        views: it.viewCount || 0,
        likes: it.likeCount || 0,
      }));
      setPortfolioData(mapped.filter((x) => !!x.image));
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Fehler beim Laden des Portfolios';
      setError(String(msg));
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Calculate stats
  const totalViews = portfolioData.reduce((acc, item) => acc + item.views, 0);
  const totalLikes = portfolioData.reduce((acc, item) => acc + item.likes, 0);
  const totalImages = portfolioData.length;

  const confirmDelete = (item: PortfolioItem) => {
    Alert.alert(
      "Bild löschen?",
      `Möchtest du das Bild "${item.title || 'Portfolio Bild'}" wirklich aus deinem Portfolio löschen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          onPress: () => handleDelete(item.id),
          style: "destructive",
        },
      ]
    );
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      try {
        await http.delete(`/providers/portfolio/${id}`);
      } catch {
        await http.delete(`/portfolio/${id}`);
      }
      setPortfolioData(portfolioData.filter(item => item.id !== id));
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Löschen fehlgeschlagen';
      Alert.alert('Fehler', String(msg));
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: PortfolioItem }) => (
    <View style={styles.gridItemWrapper}>
      <Card style={styles.portfolioCard}>
        <View style={styles.imageContainer}>
          <AppImage
            uri={item.image}
            style={styles.portfolioImage}
            resizeMode="cover"
          />
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
            <Icon name="trash" size={16} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          {!!item.title && <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>}
          {!!item.category && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
          )}

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Icon name="eye" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metricText}>{item.views}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="heart" size={14} color={COLORS.danger} />
              <Text style={styles.metricText}>{item.likes}</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Icon name="plus" size={48} color={COLORS.border} />
      </View>
      <Text style={styles.emptyTitle}>Noch keine Portfolio-Bilder</Text>
      <Text style={styles.emptySubtitle}>
        Zeige deine besten Arbeiten und gewinne mehr Kunden
      </Text>
      <Button
        title="Erstes Bild hochladen"
        onPress={() => navigation.navigate("UploadPortfolioScreen")}
        style={styles.uploadButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
            <View>
              <Text style={styles.headerTitle}>Portfolio</Text>
              <Text style={styles.headerSubtitle}>{totalImages} Bilder</Text>
            </View>
          </View>
          <Button
            title="Hinzufügen"
            icon="plus"
            onPress={() => navigation.navigate("UploadPortfolioScreen")}
            style={styles.addButton}
          />
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalViews}</Text>
          <Text style={styles.statLabel}>Aufrufe gesamt</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalLikes}</Text>
          <Text style={styles.statLabel}>Likes gesamt</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalImages}</Text>
          <Text style={styles.statLabel}>Bilder</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Portfolio Grid */}
      <FlatList
        data={portfolioData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListEmptyComponent={loading ? null : EmptyState}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={COLORS.primary} />
        }
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  addButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    height: 40,
    borderRadius: 8,
  },
  statsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary || '#8B4513',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridItemWrapper: {
    width: cardWidth,
  },
  portfolioCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    padding: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardContent: {
    padding: SPACING.sm,
  },
  itemTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#111',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.danger,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl * 2,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
