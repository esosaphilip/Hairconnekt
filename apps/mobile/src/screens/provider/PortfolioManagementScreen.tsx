import React, { useState } from 'react';
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

// Screen width for responsive grid calculation
const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const cardMargin = SPACING.xs; // Margin around the card
const listPadding = SPACING.md; // Padding inside the main scroll view
const cardWidth = (screenWidth - listPadding * 2 - (numColumns - 1) * cardMargin) / numColumns;


// --- Mock Portfolio Data (Replicated) ---
const mockPortfolio = [
  { id: "1", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400", title: "Box Braids - Medium Length", category: "Box Braids", views: 245, likes: 32, createdAt: "2025-01-15" },
  { id: "2", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400", title: "Knotless Braids - Long", category: "Knotless Braids", views: 189, likes: 28, createdAt: "2025-01-10" },
  { id: "3", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400", title: "Cornrows Styles", category: "Cornrows", views: 167, likes: 21, createdAt: "2025-01-05" },
  { id: "4", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400", title: "Senegalese Twists", category: "Twists", views: 198, likes: 25, createdAt: "2024-12-28" },
  { id: "5", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400", title: "Wedding Hairstyle", category: "Special Occasion", views: 312, likes: 45, createdAt: "2024-12-20" },
  { id: "6", image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400", title: "Passion Twists - Burgundy", category: "Passion Twists", views: 221, likes: 34, createdAt: "2024-12-15" },
];


// --- Main Component ---
type PortfolioItem = {
  id: string;
  image: string;
  title: string;
  category: string;
  views: number;
  likes: number;
  createdAt: string;
};

export function PortfolioManagementScreen() {
  const navigation = useNavigation<any>();
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>(mockPortfolio); // Use state to simulate deletion

  // Calculate stats
  const totalViews = portfolioData.reduce((sum, item) => sum + item.views, 0);
  const totalLikes = portfolioData.reduce((sum, item) => sum + item.likes, 0);
  
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

  const handleDelete = (id: string) => {
    setPortfolioData(portfolioData.filter(item => item.id !== id));
    Alert.alert("Erfolg", "Portfolio-Bild gelöscht");
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
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Badge title={item.category} variant="outline" style={styles.itemBadge} />
          <View style={styles.itemStats}>
            <View style={styles.statRow}>
              <Icon name="eye" size={12} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.heartIcon}>❤️</Text>
              <Text style={styles.statText}>{item.likes}</Text>
            </View>
          </View>
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
              <Text style={styles.headerSubtitle}>{portfolioData.length} Bilder</Text>
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

      {/* Stats */}
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
          <Text style={styles.statValue}>{portfolioData.length}</Text>
          <Text style={styles.statLabel}>Bilder</Text>
        </View>
      </View>

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
    backgroundColor: COLORS.background || '#F9FAFB',
    flex: 1,
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomColor: COLORS.border || '#E5E7EB',
    borderBottomWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.md || 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm || 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
  },
  addButton: {
    backgroundColor: COLORS.primary || '#8B4513',
  },
  // --- Stats Styles ---
  statsContainer: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: COLORS.primary || '#8B4513',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
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
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // aspect-square
    position: 'relative',
  },
  portfolioImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlayButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
    position: 'absolute',
    right: SPACING.xs,
    top: SPACING.xs,
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
    alignItems: 'center',
    color: COLORS.textSecondary,
    flexDirection: 'row',
    fontSize: FONT_SIZES.small || 12,
    justifyContent: 'space-between',
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  statText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
  },
  heartIcon: {
    fontSize: FONT_SIZES.small || 12,
  },
  // --- Empty State Styles ---
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl * 2,
  },
  emptyIconCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.border || '#F3F4F6',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: SPACING.md,
    width: 96,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    height: 48,
  },
});