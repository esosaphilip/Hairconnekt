import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import IconButton from '../../components/IconButton';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { http } from '../../api/http';
import { getAuthBundle } from '../../auth/tokenStorage';

// Screen width for responsive grid calculation
const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const cardMargin = SPACING.xs; // Margin around the card
const listPadding = SPACING.md; // Padding inside the main scroll view
const cardWidth = (screenWidth - listPadding * 2 - (numColumns - 1) * cardMargin) / numColumns;


// Load portfolio items from backend


// --- Main Component ---
type PortfolioItem = {
  id: string;
  image: string;
  title?: string;
  category?: string;
  createdAt?: string;
};

export function PortfolioManagementScreen() {
  const navigation = useNavigation<any>();
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Try 'me' endpoint first, fallback to ID-based if needed (though me should work)
        let res;
        try {
          res = await http.get('/providers/me/portfolio', { params: { limit: 50, sort: 'latest' } });
        } catch (err) {
          // Fallback to explicit ID if 'me' fails (e.g. backend issue)
          const bundle = await getAuthBundle();
          const providerId = bundle?.user?.id;
          if (providerId) {
            res = await http.get(`/providers/${providerId}/portfolio`, { params: { limit: 50, sort: 'latest' } });
          } else {
            throw err;
          }
        }

        const payload = res?.data;
        // Robust unpacking: check for { success: true, data: { items: [] } } vs { items: [] }
        let list = [];
        if (payload && typeof payload === 'object') {
          if ('data' in payload && (payload as any).data && 'items' in (payload as any).data) {
            list = (payload as any).data.items;
          } else if ('items' in payload) {
            list = (payload as any).items;
          } else if (Array.isArray(payload)) {
            list = payload;
          }
        }

        type RawPortfolioItem = { id: string; imageUrl?: string; title?: string; category?: string; uploadedAt?: string };
        const items = Array.isArray(list) ? (list as RawPortfolioItem[]) : [];
        const mapped = items.map((it) => ({ id: it.id, image: it.imageUrl || '', title: it.title, category: it.category, createdAt: it.uploadedAt }));
        if (active) setPortfolioData(mapped.filter((x) => !!x.image));
      } catch (e) {
        const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Fehler beim Laden des Portfolios';
        if (active) setError(String(msg));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Calculate stats
  const totalViews = portfolioData.length;
  const totalLikes = 0;

  // --- Delete Logic (Replaces AlertDialog and toast) ---
  const confirmDelete = (item: PortfolioItem) => {
    Alert.alert(
      "Bild löschen?",
      `Möchtest du das Bild "${item.title}" wirklich aus deinem Portfolio löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
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

  // --- Render Item for FlatList ---
  const renderItem = ({ item }: { item: PortfolioItem }) => (
    <View style={styles.gridItemWrapper}>
      <Card style={styles.portfolioCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.portfolioImage}
            resizeMode="cover"
          />
          {/* Action Buttons Overlay */}
          <View style={styles.imageOverlayButtons}>
            {/* Delete Button (Wraps native action) */}
            <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
              <Icon name="trash-2" size={16} color={COLORS.danger} />
            </TouchableOpacity>
            {/* Optional: Edit Button */}
            {/* <TouchableOpacity onPress={() => navigate("UploadPortfolioScreen", { id: item.id })} style={styles.editButton}>
              <Icon name="edit" size={16} color={COLORS.text} />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.cardContent}>
          {!!item.title && <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>}
          {!!item.category && <Badge title={item.category} variant="outline" style={styles.itemBadge} />}
        </View>
      </Card>
    </View>
  );


  // --- Empty State Component ---
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
        onPress={() => {
          console.log("Navigating to UploadPortfolioScreen from EmptyState...");
          navigation.navigate("UploadPortfolioScreen");
        }}
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
              <Text style={styles.headerSubtitle}>{portfolioData.length} Bilder</Text>
            </View>
          </View>
          <Button
            title="Hinzufügen"
            icon="plus"
            onPress={() => {
              console.log("Navigating to UploadPortfolioScreen...");
              navigation.navigate("UploadPortfolioScreen");
            }}
            style={styles.addButton}
          />
        </View>
      </View>

      {error && (
        <View style={styles.statsContainer}>
          <Text style={styles.statLabel}>{error}</Text>
        </View>
      )}

      {/* Portfolio Grid */}
      <FlatList
        data={portfolioData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListEmptyComponent={EmptyState}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
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
  },
  // --- Stats Styles ---
  statsContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary || '#8B4513',
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Portfolio Grid Styles ---
  listContent: {
    padding: SPACING.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm, // Add vertical spacing between rows
  },
  gridItemWrapper: {
    width: cardWidth,
  },
  portfolioCard: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // aspect-square
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayButtons: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  deleteButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // white/90
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  cardContent: {
    padding: SPACING.sm,
  },
  itemTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  itemBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  statText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  heartIcon: {
    fontSize: FONT_SIZES.small || 12,
  },
  // --- Empty State Styles ---
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl * 2,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.border || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  uploadButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    height: 48,
  },
});
