import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// --- Theme and Constants ---
const THEME_COLOR = '#8B4513';
const ACCENT_COLOR = '#FF6B6B';
const RESET_COLOR = '#FF6B6B';
const CARD_BG = 'white';
const PADDING = 24;

// --- Data Structure (Unchanged) ---
const sections = [
  {
    title: 'Entry & Onboarding',
    icon: 'sparkles', // Ionicons equivalent for Sparkles
    color: ACCENT_COLOR,
    screens: [
      { name: 'Splash Screen', path: 'Splash' },
      { name: 'Client Onboarding', path: 'Onboarding' },
      { name: 'Location Selection', path: 'Location' },
      { name: 'Welcome Screen', path: 'Home' }, // Assuming '/' navigates to Home
    ]
  },
  {
    title: 'Client App',
    icon: 'person', // Ionicons equivalent for User
    color: THEME_COLOR,
    screens: [
      { name: 'Home Screen', path: 'Home' },
      { name: 'Search Screen', path: 'Search' },
      { name: 'Appointments', path: 'Appointments' },
      { name: 'Messages', path: 'Messages' },
      { name: 'Profile', path: 'Profile' },
      { name: 'All Styles', path: 'AllStyles' },
    ]
  },
  {
    title: 'Provider App',
    icon: 'briefcase', // Ionicons equivalent for Briefcase
    color: THEME_COLOR,
    screens: [
      { name: 'Provider Welcome', path: 'ProviderOnboarding' },
      { name: 'Provider Tutorial', path: 'ProviderTutorial' },
      { name: 'Provider Dashboard', path: 'ProviderDashboard' },
      { name: 'Provider Calendar', path: 'ProviderCalendar' },
      { name: 'Provider Clients', path: 'ProviderClients' },
      { name: 'Provider Earnings', path: 'ProviderEarnings' },
      { name: 'Provider More', path: 'ProviderMore' },
    ]
  },
  {
    title: 'Legal & Help',
    icon: 'shield-checkmark', // Ionicons equivalent for Shield
    color: '#4A90E2',
    screens: [
      { name: 'Privacy & Security', path: 'Privacy' },
      { name: 'Terms & Conditions', path: 'Terms' },
      { name: 'Privacy Policy', path: 'PrivacyPolicy' },
      { name: 'Impressum', path: 'Imprint' },
      { name: 'User Manual', path: 'UserManual' },
      { name: 'Support', path: 'Support' },
      { name: 'Delete Account', path: 'DeleteAccount' },
    ]
  }
];

// --- Helper Components ---

// RN Card Component
const Card = ({ children, style }: any) => (
  <View style={[styles.cardBase, style]}>
    {children}
  </View>
);

// RN Button Component (Simplified)
const CustomButton = ({ title, onPress, style }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.buttonBase, style]}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

// --- Main Component ---
export function ScreenNavigator() {
  const navigation = useNavigation<any>(); // use 'any' since we don't know the exact navigator type

  const totalScreens = sections.reduce((acc, section) => acc + section.screens.length, 0);

  const handleClearStorage = () => {
    Alert.alert(
      "App-Status zurücksetzen",
      "Möchten Sie den gesamten App-Status (simuliert) löschen und zur Splash Screen zurückkehren?",
      [
        {
          text: "Abbrechen",
          style: "cancel"
        },
        {
          text: "Zurücksetzen",
          onPress: () => {
            // In a real app: await AsyncStorage.clear();
            console.log("Simulating: App state cleared from storage.");
            navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }], // Ensure 'Splash' is a known route name
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="home-outline" size={40} color="white" />
          </View>
          <Text style={styles.headerTitle}>HairConnekt Screen Navigator</Text>
          <Text style={styles.headerSubtitle}>
            Navigieren Sie zu jedem Bildschirm in der App (Simulierte Routen)
          </Text>
        </View>

        {/* Reset Button */}
        <Card style={styles.resetCard}>
          <View style={styles.resetContent}>
            <View>
              <Text style={styles.resetTitle}>App-Status zurücksetzen</Text>
              <Text style={styles.resetSubtitle}>
                Löschen Sie den Speicher und starten Sie vom Splash Screen neu
              </Text>
            </View>
            <CustomButton 
              title="Reset"
              onPress={handleClearStorage}
              style={styles.resetButton}
            />
          </View>
        </Card>

        {/* Screen Sections */}
        <View style={styles.sectionsContainer}>
          {sections.map((section) => {
            return (
              <Card key={section.title} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View 
                    style={[styles.sectionIconWrapper, { backgroundColor: `${section.color}15` }]}
                  >
                    <Ionicons name={section.icon as any} size={24} color={section.color} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionSubtitle}>
                      {section.screens.length} Screens
                    </Text>
                  </View>
                </View>

                <View style={styles.screenList}>
                  {section.screens.map((screen) => (
                    <TouchableOpacity
                      key={screen.path}
                      onPress={() => navigation.navigate(screen.path)}
                      style={styles.screenListItem}
                    >
                      <Text style={styles.screenListName}>
                        {screen.name}
                      </Text>
                      <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            );
          })}
        </View>

        {/* Footer Stats */}
        <Card style={styles.footerCard}>
          <View style={styles.footerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalScreens}</Text>
              <Text style={styles.statLabel}>Gesamt Screens</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>75+</Text>
              <Text style={styles.statLabel}>Komponenten</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>✅</Text>
              <Text style={styles.statLabel}>Vollständig</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1, // from-gray-50
  },
  container: {
    alignSelf: 'center', // mx-auto equivalent
    maxWidth: 600, // max-w-2xl equivalent
    padding: PADDING,
    paddingBottom: 50,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIconWrapper: {
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: 16,
    elevation: 8,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: 80,
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },

  // Card Base Style
  cardBase: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Reset Button/Card
  resetCard: {
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderWidth: 2,
    marginBottom: 24,
    padding: 16,
  },
  resetContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resetSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: RESET_COLOR,
    borderRadius: 8,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // Sections Container
  sectionsContainer: {
    gap: 24,
  },
  sectionCard: {
    padding: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomColor: '#F3F4F6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
  },
  sectionIconWrapper: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Screen List
  screenList: {
    gap: 8,
  },
  screenListItem: {
    width: '100%',
    padding: 12,
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenListName: {
    color: '#4B5563',
    fontSize: 16,
  },

  // Footer Stats
  footerCard: {
    backgroundColor: THEME_COLOR,
    marginTop: 32,
    padding: 24,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  
  // Custom Button Styles
  buttonBase: {
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
