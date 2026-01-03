import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from '@react-navigation/native';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Icon from '@/components/Icon';
import { colors, spacing, typography, shadows, radii, FONT_SIZES } from '@/theme/tokens';
import { clientBraiderApi } from '../../api/clientBraider';

// Screen width for responsive grid calculation
const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const cardMargin = spacing.sm;
const cardPadding = spacing.md;
const cardWidth = Math.floor((screenWidth - cardPadding * 2 - (numColumns - 1) * cardMargin) / numColumns);

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
};

// --- CLIENT SIDE GROUPING LOGIC ---
const CATEGORY_GROUPS = {
  "Braids": ['box-braids', 'cornrows', 'knotless-braids', 'fulani-braids', 'goddess-braids', 'crochet-braids', 'tribal-braids', 'kids-braids'],
  "Twists": ['twists', 'senegalese-twists', 'passion-twists', 'marley-twists'],
  "Locs": ['locs', 'faux-locs'],
  "Natural": ['natural-styling', 'silk-press', 'bantu-knots', 'ponytail'],
  "Extensions": ['weave', 'wig-install', 'braided-updo'],
};

const FILTER_PILLS = ["Alle", "Braids", "Twists", "Locs", "Natural", "Extensions"];

// --- Custom Component for Category Item ---
type StyleCardProps = {
  category: CategoryItem;
  onPress: () => void;
};

const StyleCard = ({ category, onPress }: StyleCardProps) => {
  return (
    <TouchableOpacity
      style={styles.styleCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: category.iconUrl || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80' }}
          style={styles.styleImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <View style={styles.imageContent}>
          <Text style={styles.styleName}>{category.name}</Text>
        </View>
      </View>

      <View style={styles.styleFooter}>
        <Text style={styles.popularityText}>Jetzt entdecken</Text>
        <Icon name="chevron-right" size={18} color={colors.gray600} />
      </View>
    </TouchableOpacity>
  );
};


// --- Main Component ---
type NavParams = {
  Tabs: { screen: 'Search'; params?: { initialTerm?: string; initialFilter?: string } };
};

export function AllStylesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: { category?: string } }, 'params'>>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Alle");

  useEffect(() => {
    if (route.params?.category) {
      // Allow case-insensitive matching for robustness
      const target = route.params.category;
      const matched = FILTER_PILLS.find(p => p.toLowerCase() === target.toLowerCase());
      if (matched) {
        setSelectedFilter(matched);
      }
    }
  }, [route.params?.category]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await clientBraiderApi.getCategories();
        console.log('Fetched Categories:', cats.map(c => `${c.name} (${c.slug})`));
        setCategories(cats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter Logic
  const filteredCategories = React.useMemo(() => {
    if (selectedFilter === "Alle") return categories;

    // Get slugs allowed for this group
    const allowedSlugs = CATEGORY_GROUPS[selectedFilter as keyof typeof CATEGORY_GROUPS] || [];
    return categories.filter(c =>
      allowedSlugs.includes(c.slug) ||
      c.name.toLowerCase().includes(selectedFilter.toLowerCase())
    );
  }, [categories, selectedFilter]);


  // Function to render each item in the FlatList
  const renderStyleItem: ListRenderItem<CategoryItem> = ({ item }) => (
    <StyleCard
      category={item}
      onPress={() => navigation.navigate('Search', { initialFilter: `cat:${item.slug}` })}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search" size={48} color={colors.gray300} />
      <Text style={styles.emptyText}>Keine Styles gefunden</Text>
      <Text style={styles.emptySubtext}>
        Versuche es mit einer anderen Kategorie oder wähle 'Alle' oben aus.
      </Text>
    </View>
  );


  if (loading) {
    return (
      <View style={[styles.flexContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Alle Styles</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Horizontal Filter Pills (Restored) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterContainer}
        >
          {FILTER_PILLS.map((filter) => (
            <Button
              key={filter}
              title={filter}
              size="sm"
              variant={selectedFilter === filter ? "default" : "outline"}
              onPress={() => setSelectedFilter(filter)}
              style={selectedFilter === filter ? styles.activeCategoryButton : styles.inactiveCategoryButton}
              textStyle={selectedFilter === filter ? styles.activeCategoryText : styles.inactiveCategoryText}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredCategories.length} Style{filteredCategories.length !== 1 ? "s" : ""} gefunden
        </Text>

        {/* Styles Grid using FlatList */}
        <FlatList
          data={filteredCategories}
          renderItem={renderStyleItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyText: {
    color: colors.gray800,
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.gray500,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.md,
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
