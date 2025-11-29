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
    flex: 1,
    backgroundColor: '#F9FAFB', // from-gray-50
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
    width: 80,
    height: 80,
    backgroundColor: THEME_COLOR,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Card Base Style
  cardBase: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Reset Button/Card
  resetCard: {
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  resetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  resetButton: {
    backgroundColor: RESET_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 40,
  },

  // Sections Container
  sectionsContainer: {
    gap: 24,
  },
  sectionCard: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
    fontSize: 16,
    color: '#4B5563',
  },

  // Footer Stats
  footerCard: {
    marginTop: 32,
    padding: 24,
    backgroundColor: THEME_COLOR,
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
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Custom Button Styles
  buttonBase: {
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
