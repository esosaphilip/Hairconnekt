import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
// import { useAuth } from '../../auth/AuthContext'; // Assuming context is available
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import Avatar, { AvatarImage } from '../../components/avatar';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

// --- Menu Data (Icons adapted to string names for the custom Icon component) ---
const menuSections = [
  {
    title: "Business Management",
    items: [
      {
        icon: "user",
        label: "Mein Profil",
        path: "ProviderProfileScreen",
        badge: null,
      },
      {
        icon: "eye",
        label: "Öffentliches Profil anzeigen",
        path: "ProviderPublicProfileScreen",
        badge: null,
      },
      {
        icon: "dollar-sign",
        label: "Services & Preise",
        path: "ProviderServicesScreen",
        badge: "12",
      },
      {
        icon: "camera",
        label: "Portfolio verwalten",
        path: "ProviderPortfolioScreen",
        badge: "42",
      },
    ],
  },
  {
    title: "Finanzen",
    items: [
      {
        icon: "dollar-sign",
        label: "Einnahmen & Auszahlungen",
        path: "TransactionsScreen",
        badge: "€1,245",
      },
      {
        icon: "bar-chart",
        label: "Statistiken & Berichte",
        path: "ProviderAnalyticsScreen",
        badge: null,
      },
      {
        icon: "gift",
        label: "Gutscheine & Angebote",
        path: "ProviderVouchersScreen",
        badge: "3",
      },
      {
        icon: "credit-card",
        label: "Abonnement & Gebühren",
        path: "ProviderSubscriptionScreen",
        badge: "Pro",
      },
    ],
  },
  {
    title: "Feedback",
    items: [
      {
        icon: "star",
        label: "Bewertungen",
        path: "ProviderReviewsScreen",
        badge: "4.8 ★",
      },
    ],
  },
  {
    title: "Einstellungen",
    items: [
      {
        icon: "settings",
        label: "Einstellungen",
        path: "ProviderSettingsScreen",
        badge: null,
      },
      {
        icon: "help-circle",
        label: "Hilfe & Support",
        path: "ProviderHelpScreen",
        badge: null,
      },
    ],
  },
];

// --- Helper Component for Menu Item (Replaces Web Button + Div Structure) ---
type MenuItemData = { icon: string; label: string; path: string; badge?: string | null };
const MenuItem = ({ item, onPress }: { item: MenuItemData; onPress: (path: string) => void }) => (
  <TouchableOpacity
    key={item.label}
    onPress={() => onPress(item.path)}
    style={styles.menuItem}
    activeOpacity={0.7}
  >
    <View style={styles.menuIconCircle}>
      <Icon name={item.icon} size={20} color={COLORS.textSecondary} />
    </View>
    <Text style={styles.menuLabel}>{item.label}</Text>
    {item.badge && (
      <Badge title={item.badge} variant="secondary" />
    )}
    <Icon name="chevron-right" size={20} color={COLORS.border} />
  </TouchableOpacity>
);

// --- Main Component ---
export function ProviderMore() {
  const navigation = useNavigation<any>();
  // const { logout } = useAuth(); // Uncomment in a real app

  const handleLogout = () => {
    // Replaces browser 'confirm' with native Alert
    Alert.alert(
      "Abmelden",
      "Möchtest du dich wirklich abmelden?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Abmelden",
          onPress: () => {
            // logout(); // Uncomment in a real app
            navigation.navigate("LoginScreen"); // Navigate to login screen
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Profile */}
        <View style={styles.profileHeader}>
          <Text style={styles.screenTitle}>Mehr</Text>

          {/* Profile Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ProviderProfileScreen")}
            activeOpacity={0.8}
          >
            <Card style={styles.profileCard}>
              <View style={styles.profileSummary}>
                <Avatar size={64}>
                  <AvatarImage source={{ uri: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100" }} />
                </Avatar>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.profileName}>Aisha Mensah</Text>
                  <Text style={styles.profileStudio}>Aisha's Braiding Studio</Text>
                  <View style={styles.profileBadgeRow}>
                    <Badge title="Pro" color="amber" />
                    <Badge title="Verifiziert" variant="outline" />
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.border} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSectionsContainer}>
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {section.title}
              </Text>
              <Card style={styles.cardContainer}>
                {section.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <MenuItem item={item} onPress={(path) => navigation.navigate(path)} />
                    {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </Card>
            </View>
          ))}

          {/* Logout */}
          <Card style={styles.logoutCard}>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <View style={styles.logoutIconCircle}>
                <Icon name="log-out" size={20} color={COLORS.danger} />
              </View>
              <Text style={styles.logoutLabel}>Abmelden</Text>
            </TouchableOpacity>
          </Card>
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>HairConnekt Provider v1.0.0</Text>
          <Text style={styles.versionText}>© 2025 HairConnekt GmbH</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  // --- Profile Header Styles ---
  profileHeader: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingTop: SPACING.md || 16,
    paddingBottom: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
  },
  screenTitle: {
    fontSize: FONT_SIZES.h3 || 20,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  profileCard: {
    padding: SPACING.md,
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
  },
  profileStudio: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  profileBadgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  // --- Menu Sections Styles ---
  menuSectionsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.lg || 24,
  },
  section: {
    // Container for title + card
  },
  sectionTitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#E5E7EB',
    marginLeft: 50 + SPACING.sm * 2, // Indent past the icon circle + spacing
  },
  menuItem: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border || '#F3F4F6', // gray-100
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
  },
  // --- Logout Styles ---
  logoutCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  logoutButton: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  logoutIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger + '10' || '#fee2e2', // red-50
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoutLabel: {
    flex: 1,
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.danger || '#EF4444', // red-600
  },
  // --- Version Info ---
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  versionText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
});