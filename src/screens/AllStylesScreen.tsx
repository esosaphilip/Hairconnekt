import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import type { ListRenderItem } from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button'; // Custom Button component
import IconButton from '../components/IconButton'; // Custom component for icon buttons
import { Badge } from '../components/badge'; // Custom Badge component (normalized import)
import Icon from '../components/Icon'; // Component for handling icons (e.g., using react-native-vector-icons)
import { COLORS, SPACING, FONT_SIZES } from '../theme/tokens'; // Assumed custom tokens/styles

// Screen width for responsive grid calculation
const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const cardMargin = SPACING.sm || 8; // Margin around the card
const cardPadding = SPACING.md || 16; // Padding inside the main scroll view
const cardWidth = (screenWidth - cardPadding * 2 - (numColumns - 1) * cardMargin) / numColumns;


// --- Mock Data (Remains the same) ---
type StyleItem = {
  id: number;
  name: string;
  category: string;
  price: string;
  duration: string;
  popularity: string;
  image: string;
};

const allStyles: StyleItem[] = [
  {
    id: 1,
    name: "Box Braids",
    category: "Braids",
    price: "ab €45",
    duration: "3-4 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 2,
    name: "Cornrows",
    category: "Braids",
    price: "ab €35",
    duration: "2-3 Std.",
    popularity: "Beliebt",
    image: "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 3,
    name: "Senegalese Twists",
    category: "Twists",
    price: "ab €55",
    duration: "4-5 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 4,
    name: "Knotless Braids",
    category: "Braids",
    price: "ab €50",
    duration: "4-5 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 5,
    name: "Faux Locs",
    category: "Locs",
    price: "ab €65",
    duration: "5-6 Std.",
    popularity: "Beliebt",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 6,
    name: "Passion Twists",
    category: "Twists",
    price: "ab €60",
    duration: "4-5 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 7,
    name: "Goddess Braids",
    category: "Braids",
    price: "ab €40",
    duration: "2-3 Std.",
    popularity: "Beliebt",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 8,
    name: "Fulani Braids",
    category: "Braids",
    price: "ab €45",
    duration: "3-4 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

const categories = ["Alle", "Braids", "Twists", "Locs"];

// --- Custom Component for Style Item (Replaces Card) ---
type StyleCardProps = {
  style: StyleItem;
  onPress: () => void;
};

const StyleCard = ({ style, onPress }: StyleCardProps) => {
  return (
    <TouchableOpacity
      style={styles.styleCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {/* Replaced ImageWithFallback with standard Image */}
        <Image
          source={{ uri: style.image }}
          style={styles.styleImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <View style={styles.imageContent}>
          <Badge
            title={style.category}
            variant="secondary"
            style={styles.categoryBadge}
            textStyle={styles.categoryBadgeText}
          />
          <Text style={styles.styleName}>{style.name}</Text>
          <View style={styles.styleMeta}>
            <Text style={styles.stylePrice}>{style.price}</Text>
            <View style={styles.styleDuration}>
              <Icon name="clock" size={12} color={COLORS.white} />
              <Text style={styles.styleDurationText}>{style.duration}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.styleFooter}>
        <Text style={styles.popularityText}>{style.popularity}</Text>
        <Icon name="chevron-right" size={18} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};


// --- Main Component ---
export function AllStylesScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  const filteredStyles =
    selectedCategory === "Alle"
      ? allStyles
      : allStyles.filter((style) => style.category === selectedCategory);

  // Function to render each item in the FlatList
  const renderStyleItem: ListRenderItem<StyleItem> = ({ item }) => (
    <StyleCard
      style={item}
      onPress={() => (navigation as any).navigate("SearchScreen", { styleName: item.name })}
    />
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Alle Styles</Text>
          <IconButton name="filter" onPress={() => { /* Open filter modal/screen */ }} />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterContainer}
        >
          {categories.map((category) => (
            <Button
              key={category}
              title={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onPress={() => setSelectedCategory(category)}
              style={selectedCategory === category ? styles.activeCategoryButton : styles.inactiveCategoryButton}
              textStyle={selectedCategory === category ? styles.activeCategoryText : null}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredStyles.length} Style{filteredStyles.length !== 1 ? "s" : ""} gefunden
        </Text>

        {/* Styles Grid using FlatList */}
        <FlatList
          data={filteredStyles}
          renderItem={renderStyleItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Header Styles (Simulating sticky behavior by placing outside the FlatList) ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingTop: SPACING.md * 1.5 || 24, // Matches the web's pt-6
    paddingBottom: SPACING.sm || 8,
    paddingHorizontal: SPACING.md || 16,
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
    marginBottom: SPACING.md || 16,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- Category Filter Styles ---
  categoryFilterContainer: {
    gap: SPACING.xs || 4,
    paddingBottom: SPACING.xs || 4,
  },
  // Assuming Button component handles size="sm" and variant="outline"
  activeCategoryButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    borderColor: COLORS.primary || '#8B4513',
  },
  activeCategoryText: {
    color: COLORS.white,
  },
  inactiveCategoryButton: {
    borderColor: COLORS.border || '#E5E7EB',
  },
  // --- Content & Grid Styles ---
  contentContainer: {
    flex: 1,
    paddingHorizontal: cardPadding,
    paddingTop: SPACING.md,
  },
  resultsCount: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.md || 16,
  },
  // Styles for FlatList columns
  gridContent: {
    paddingBottom: SPACING.xl || 32, // Ensure space at the bottom
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: cardMargin,
  },
  // --- Style Card Styles (Replaces web Card/div structure) ---
  styleCard: {
    width: cardWidth,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    // Basic shadow for card elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    height: cardWidth * (4/3), // Adjusted height to look good in 2-column grid
    position: 'relative',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Simulate gradient-to-t from-black/60
  },
  imageContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // white/20
    borderWidth: 0,
    marginBottom: SPACING.xs,
  },
  categoryBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small * 0.9,
    // backdrop-blur-sm is not directly supported, relying on opacity
  },
  styleName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs / 2,
  },
  styleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: FONT_SIZES.small || 12,
  },
  stylePrice: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small || 12,
  },
  styleDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2 || 2,
  },
  styleDurationText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small || 12,
  },
  styleFooter: {
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  popularityText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
});