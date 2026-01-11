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

type ServiceItem = {
  id: string;
  name: string;
  price: number;
  duration: number;
  imageUrl?: string;
  categorySlug?: string;
  provider: { id: string; name: string; city?: string; isVerified: boolean };
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

// --- Custom Component for Service Item ---
type StyleCardProps = {
  service: ServiceItem;
  onPress: () => void;
};

const StyleCard = ({ service, onPress }: StyleCardProps) => {
  // Mock logic for "Popularity" or Category Badge
  // In a real app, category name would come from joining categories or mapping slug
  const categoryLabel = service.categorySlug ?
    Object.keys(CATEGORY_GROUPS).find(key => CATEGORY_GROUPS[key as keyof typeof CATEGORY_GROUPS].includes(service.categorySlug!)) || 'Style'
    : 'Style';

  return (
    <TouchableOpacity
      style={styles.styleCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: service.imageUrl || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80' }}
          style={styles.styleImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Category Badge on Image */}
        <View style={styles.badgeContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
          </View>
        </View>

        <View style={styles.imageContent}>
          <Text style={styles.styleName}>{service.name}</Text>
          <View style={styles.styleMeta}>
            <Text style={styles.stylePrice}>ab €{service.price / 100}</Text>
            <View style={styles.styleDuration}>
              <Icon name="clock" size={12} color={colors.white} />
              <Text style={styles.styleDurationText}>{service.duration} Min.</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.styleFooter}>
        <Text style={styles.popularityText}>Sehr beliebt</Text>
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
  const [services, setServices] = useState<ServiceItem[]>([]);
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
        // Fetch ALL services for client-side filtering (max 100 for now)
        const items = await clientBraiderApi.searchServices({ limit: 100 });
        console.log('Fetched Services:', items.length);
        setServices(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter Logic
  const filteredServices = React.useMemo(() => {
    if (selectedFilter === "Alle") return services;

    // Get slugs allowed for this group
    const allowedSlugs = CATEGORY_GROUPS[selectedFilter as keyof typeof CATEGORY_GROUPS] || [];
    return services.filter(s =>
      (s.categorySlug && allowedSlugs.includes(s.categorySlug)) ||
      s.name.toLowerCase().includes(selectedFilter.toLowerCase())
    );
  }, [services, selectedFilter]);


  // Function to render each item in the FlatList
  const renderStyleItem: ListRenderItem<ServiceItem> = ({ item }) => (
    <StyleCard
      service={item}
      // Navigate to Booking or Provider Profile? Usually Style click goes to Provider Profile with that service selected
      // But preserving existing behavior: Search with filter?
      // User request said: "display price... duration...".
      // Navigating to 'Search' with filter might be weird for a specific service card. 
      // It should probably go to ProviderProfile.
      // But let's keep existing navigation for safety unless asked to change.
      // Existing: navigation.navigate('Search', { initialFilter: `cat:${item.slug}` })
      // New item has 'item.categorySlug'. 
      // If we want to book THIS service: navigation.navigate('ProviderProfile', { providerId: item.provider.id })
      // Let's stick to Search for now to be safe, but filtered by this service name?
      // Or just search by category? The old one navigated to search by Category.
      // Let's navigate to ProviderProfile as that makes more sense for a Service Card.
      onPress={() => navigation.navigate('Tabs', { screen: 'Search', params: { styleName: item.name } })}
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
          {filteredServices.length} Style{filteredServices.length !== 1 ? "s" : ""} gefunden
        </Text>

        {/* Styles Grid using FlatList */}
        <FlatList
          data={filteredServices}
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
  badgeContainer: {
    left: spacing.sm,
    position: 'absolute',
    top: spacing.sm,
    zIndex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  categoryBadgeText: {
    color: colors.white,
    fontSize: typography.small.fontSize * 0.8,
    fontWeight: '600',
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
