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
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import { Badge } from '@/components/badge';
import Icon from '@/components/Icon';
import { colors, spacing, typography, shadows, radii, FONT_SIZES } from '@/theme/tokens';
import { logger } from '@/services/logger';
import { MESSAGES } from '@/constants';

// Screen width for responsive grid calculation
const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const cardMargin = spacing.sm;
const cardPadding = spacing.md;
const cardWidth = Math.floor((screenWidth - cardPadding * 2 - (numColumns - 1) * cardMargin) / numColumns);


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
              <Icon name="clock" size={12} color={colors.white} />
              <Text style={styles.styleDurationText}>{style.duration}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.styleFooter}>
        <Text style={styles.popularityText}>{style.popularity}</Text>
        <Icon name="chevron-right" size={18} color={colors.gray600} />
      </View>
    </TouchableOpacity>
  );
};


// --- Main Component ---
type NavParams = {
  Tabs: { screen: 'Search'; params?: { initialTerm?: string } };
};

export function AllStylesScreen() {
  const navigation = useNavigation<NavigationProp<NavParams>>();
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  const filteredStyles =
    selectedCategory === "Alle"
      ? allStyles
      : allStyles.filter((style) => style.category === selectedCategory);

  // Function to render each item in the FlatList
  const renderStyleItem: ListRenderItem<StyleItem> = ({ item }) => (
    <StyleCard
      style={item}
      // Navigate into the client Tabs -> Search screen and pre-fill the term
      onPress={() => navigation.navigate('Tabs', { screen: 'Search', params: { initialTerm: item.name } })}
    />
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Alle Styles</Text>
          {/* Replace bare icon button with labeled button for better clarity */}
          <Button
            title="Filter"
            size="sm"
            variant="outline"
            icon="filter"
            onPress={() => { /* TODO: Open filter modal/screen */ }}
          />
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
              textStyle={selectedCategory === category ? styles.activeCategoryText : styles.inactiveCategoryText}
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


const styles = StyleSheet.create({
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeCategoryText: {
    color: colors.white,
  },
  categoryBadge: {
    backgroundColor: colors.white,
    borderWidth: 0,
    marginBottom: spacing.xs,
    opacity: 0.2,
  },
  categoryBadgeText: {
    color: colors.white,
    fontSize: typography.small.fontSize * 0.9,
  },
  categoryFilterContainer: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: cardPadding,
    paddingTop: spacing.md,
  },
  flexContainer: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  gridContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    ...shadows.sm,
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    elevation: 2,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md * 1.5,
    zIndex: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: '600',
  },
  imageContainer: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    height: cardWidth * (4 / 3),
    overflow: 'hidden',
    position: 'relative',
  },
  imageContent: {
    bottom: 0,
    left: 0,
    padding: spacing.sm,
    position: 'absolute',
    right: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  inactiveCategoryButton: {
    borderColor: colors.gray200,
  },
  inactiveCategoryText: {
    color: colors.gray800,
  },
  popularityText: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  resultsCount: {
    color: colors.gray600,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: cardMargin,
  },
  styleCard: {
    ...shadows.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    elevation: 3,
    overflow: 'hidden',
    width: cardWidth,
  },
  styleDuration: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs / 2,
  },
  styleDurationText: {
    color: colors.white,
    fontSize: typography.small.fontSize,
  },
  styleFooter: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  styleImage: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    height: '100%',
    width: '100%',
  },
  styleMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    fontSize: typography.small.fontSize,
    justifyContent: 'space-between',
  },
  styleName: {
    color: colors.white,
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs / 2,
  },
  stylePrice: {
    color: colors.white,
    fontSize: typography.small.fontSize,
  },
});
