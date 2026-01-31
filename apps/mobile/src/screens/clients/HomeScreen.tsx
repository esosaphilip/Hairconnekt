import { rootNavigationRef } from '@/navigation/rootNavigation';
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Button, Card, Input } from "@/ui";
import Icon from "@/components/Icon";
import { normalizeUrl } from "@/utils/url";
import { colors, spacing } from "@/theme/tokens";
import { useLocation } from "@/context/LocationContext";
import { styles } from "./HomeScreen.styles";
import { useHomeScreen } from "./hooks/useHomeScreen";
import { PopularStyleCard } from "./components/PopularStyleCard";
import { NearbyBraiderCard } from "./components/NearbyBraiderCard";

const quickActions = [
  { iconName: "flash", key: "urgent", color: colors.orange500 },
  { iconName: "car", key: "mobileService", color: colors.blue600 },
  { iconName: "gift", key: "vouchers", color: colors.purple600 },
  { iconName: "heart", key: "favorites", color: colors.pink500 },
  { iconName: "sparkles", key: "newBraiders", color: colors.amber600 },
];

import { useNavigation } from '@react-navigation/native';

export function HomeScreen() {
  const {
    t,
    displayName,
    initials,
    isAuthenticated,
    popularCategories,
    nearby,
    nearbyLoading,
    nearbyError,
    favorites,
    formatCurrency,
    handleLocationPress,
    handleToggleFavorite,
    user
  } = useHomeScreen();

  const { location } = useLocation();
  const navigation = useNavigation();
  const isNavigating = React.useRef(false);

  const handleNotificationPress = React.useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    // @ts-ignore
    navigation.navigate('Tabs', { screen: 'Profile', params: { screen: 'Notifications' } });

    // Reset guard after delay
    setTimeout(() => {
      isNavigating.current = false;
    }, 1500);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            {isAuthenticated ? (
              <View style={styles.userInfo}>
                <Avatar
                  size={40}
                  style={styles.initialsAvatar}
                  source={user?.profilePictureUrl ? { uri: normalizeUrl(user.profilePictureUrl) } : undefined}
                >
                  <Text style={styles.initialsText}>{initials}</Text>
                </Avatar>
                <View>
                  <Text style={styles.greetingText}>{t('screens.home.hello')}</Text>
                  <Text style={styles.displayName}>{displayName}</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.greetingText}>{t('screens.home.welcomeTo')}</Text>
                <Text style={styles.displayName}>HairConnekt 👋</Text>
              </View>
            )}
            <View style={styles.headerActions}>
              {!isAuthenticated && (
                <Button
                  size="small"
                  variant="outline"
                  onPress={() => rootNavigationRef.current?.navigate('Login')}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                  icon={<Icon name="person" size={16} color={colors.primary} style={{ marginRight: spacing.xs }} />}
                >
                  {t('common.actions.logIn')}
                </Button>
              )}
              {isAuthenticated && (
                <TouchableOpacity
                  style={styles.notificationButton}
                  testID="notification-bell"
                  onPress={handleNotificationPress}
                >
                  <Icon name="notifications" size={24} color={colors.gray700} />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLocationPress}
            style={styles.locationButton}
            activeOpacity={0.7}
          >
            <Icon name="map-pin" size={16} color={colors.gray700} />
            <Text style={styles.locationText}>
              {location?.label || location?.city || t('screens.home.location.select')}
            </Text>
            <Icon name="chevron-right" size={16} color={colors.gray700} />
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity
            onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Search' })}
            style={styles.searchBarWrapper}
            activeOpacity={1}
          >
            <Input
              placeholder={t('screens.home.searchPlaceholder')}
              editable={false}
              style={styles.searchBarInput}
              leftIcon={<Icon name="funnel-outline" size={20} color={colors.gray400} />}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="funnel-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Verification Banner */}
        {isAuthenticated && (user?.emailVerified === false || user?.phoneVerified === false) && (
          <Card style={styles.verificationCard}>
            <View style={styles.verificationContent}>
              <Icon name="alert-circle" size={20} color={colors.amber600} />
              <View style={styles.verificationTextWrapper}>
                <Text style={styles.verificationText}>
                  {t('screens.home.verification.promptWithWhich', { which: t(user?.emailVerified === false ? 'screens.home.verification.email' : 'screens.home.verification.phone') })}
                </Text>
                <Button
                  size="small"
                  onPress={() => rootNavigationRef.current?.navigate('Verify')}
                  style={styles.verifyButton}
                  textStyle={styles.verifyButtonText}
                >
                  {t('screens.home.verification.verifyNow')}
                </Button>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <FlatList
            data={quickActions}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.key === "urgent") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Search', params: { urgent: true } });
                  } else if (item.key === "mobileService") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Search', params: { mobileService: true } });
                  } else if (item.key === "vouchers") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'Vouchers' } });
                  } else if (item.key === "favorites") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Profile', params: { screen: 'Favorites' } });
                  } else if (item.key === "newBraiders") {
                    rootNavigationRef.current?.navigate('Tabs', { screen: 'Search', params: { newProviders: true } });
                  }
                }}
              >
                <View style={[styles.quickActionButton, { backgroundColor: item.color }]}>
                  <Icon name={item.iconName} size={24} color={colors.white} />
                </View>
                <Text style={styles.quickActionLabel}>{t(`screens.home.quickActions.${item.key}`)}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Popular Styles */}
        <View style={styles.popularStylesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('screens.home.popularStylesTitle')}</Text>
            <TouchableOpacity
              onPress={() => rootNavigationRef.current?.navigate('AllStyles')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>{t('screens.home.seeAll')}</Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularCategories}
            keyExtractor={(item) => `style-${item.id}`}
            renderItem={({ item }) => (
              <PopularStyleCard item={item} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularStylesList}
          />
        </View>

        {/* Nearby Braiders */}
        <View style={styles.nearbyBraidersSection}>
          <Text style={styles.sectionTitle}>{t('screens.home.nearbyTitle')}</Text>
          {nearbyLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>{t('screens.home.loadingNearby')}</Text>
            </View>
          )}
          {nearbyError && (
            <Text style={styles.errorText}>{nearbyError}</Text>
          )}
          <View style={styles.nearbyList}>
            {(nearby || []).map((braider) => (
              <View key={`nearby-${braider.id}`}>
                <NearbyBraiderCard
                  braider={braider}
                  isFavorite={favorites.includes(braider.id)}
                  onToggleFavorite={handleToggleFavorite}
                  formatCurrency={formatCurrency}
                />
              </View>
            ))}
            {!nearbyLoading && (nearby?.length || 0) === 0 && !nearbyError && (
              <Text style={styles.noDataText}>{t('screens.home.noNearbyFound')}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
