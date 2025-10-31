import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator, // For loading state in the button
} from 'react-native';
// Assuming React Navigation is used for mobile routing
import { useNavigation, NavigationProp } from '@react-navigation/native';
// Assuming custom components for consistency
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import Text from '../components/Text';

// **Icon Library Convention** (Using react-native-vector-icons is common)
// I'll define a simple Icon type for the placeholders to resolve the TS error
// Property 'style' is missing in type '{ size: number; color: string; }' but required...
type IconProps = { size: number; color: string; style?: any };
const MapPinIcon = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>📍</Text>;
const SearchIcon = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>🔍</Text>;
const ChevronRightIcon = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>▶️</Text>;
const NavigationIcon = (props: IconProps) => <Text style={{ color: props.color, fontSize: props.size, ...props.style }}>🧭</Text>;

// --- Mock Data and Constants ---

const germanCities = [
  { name: 'Berlin', state: 'Berlin', population: '3.7M' },
  { name: 'Hamburg', state: 'Hamburg', population: '1.9M' },
  { name: 'München', state: 'Bayern', population: '1.5M' },
  { name: 'Köln', state: 'Nordrhein-Westfalen', population: '1.1M' },
  { name: 'Frankfurt', state: 'Hessen', population: '760K' },
  // ... rest of the cities
];

const COLORS = {
  primary: '#8B4513', // Brown
  secondary: '#FF6B6B', // Red for Geolocation
  white: '#FFFFFF',
  text: '#1F2937', 
  textSecondary: '#6B7280', 
  border: '#E5E7EB', 
  background: '#F9FAFB', 
  gray400: '#9CA3AF',
};
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Define the root stack param list if you were using TypeScript with React Navigation
type RootStackParamList = {
  Home: undefined;
  // Add other screens here
};

// --- Refactored Component ---

export function LocationSelectionScreen() {
  // Use the correct type for navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const filteredCities = germanCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCity = (cityName: string) => {
    // In React Native, we typically pass data via navigation or use a global state manager.
    // We would use an async storage solution (like @react-native-async-storage/async-storage) 
    // instead of the web's localStorage.
    console.log(`City selected: ${cityName}`); 
    
    // Navigate to the home screen (or equivalent)
    navigation.navigate('Home');
  };

  const handleUseCurrentLocation = async () => {
    // 💡 RN Best Practice: Use a library like 'expo-location' or 'react-native-geolocation-service'
    // after requesting permission via 'react-native-permissions' or 'expo-permissions'.
    
    setIsLoadingLocation(true);
    
    try {
      // **Mocking Geolocation API call** (Replace with actual native code)
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const detectedCity = 'Berlin'; // Mock the reverse geocoding result

      // For a real app, you'd use a state management solution to set the city.
      
      Alert.alert('Standort ermittelt', `Ihr Standort wurde auf ${detectedCity} gesetzt.`);
      
      navigation.navigate('Home');
      
    } catch (error) {
      // The error handling is crucial in RN for permission denials, timeouts, etc.
      console.error('Geolocation Error:', error);
      Alert.alert(
        'Standort konnte nicht ermittelt werden', 
        'Überprüfen Sie Ihre Standorterlaubnis und Internetverbindung.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    // SafeAreaView is essential for iPhone notch/status bar
    <SafeAreaView style={styles.safeArea}>
      {/* ScrollView is used to ensure the content is scrollable on smaller screens */}
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Important for inputs within a ScrollView
      >
        {/* Header (Replaces the gradient/styled web div) */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <MapPinIcon size={32} color={COLORS.primary} style={styles.iconFix} /> 
          </View>
          <Text style={styles.headerTitle}>
            Wo möchten Sie einen Friseur finden?
          </Text>
          <Text style={styles.headerSubtitle}>
            Wählen Sie Ihre Stadt, um lokale Friseure zu entdecken
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          
          {/* Current Location Button (Replaces the web button/div structure) */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            style={styles.locationButton}
            disabled={isLoadingLocation}
            activeOpacity={0.7}
          >
            {/* The icon and text are styled to mimic the layout */}
            <View style={styles.locationIconContainer}>
              {isLoadingLocation ? (
                <ActivityIndicator color={COLORS.secondary} size="small" />
              ) : (
                <NavigationIcon size={24} color={COLORS.secondary} style={styles.iconFix} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationText}>
                {isLoadingLocation ? 'Standort wird ermittelt...' : 'Aktuellen Standort verwenden'}
              </Text>
              <Text style={styles.locationSubText}>Schnell und genau</Text>
            </View>
          </TouchableOpacity>

          {/* Divider (Simplified from the complex web markup) */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oder</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Search Input (Combined input and search icon into a single View) */}
          <View style={styles.searchContainer}>
            <SearchIcon size={20} color={COLORS.gray400} style={styles.searchIcon} />
            <Input
              placeholder="Stadt suchen..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              // The style is applied via the Input component's internal styles if it's custom,
              // or merged with `style` if it supports it. I'll include the necessary RN styles here.
              style={styles.searchInput} 
            />
          </View>

          {/* Cities List */}
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Beliebte Städte</Text>
            {/* List rendering with TouchableOpacity for pressable items */}
            <View style={styles.cityList}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city.name}
                  onPress={() => handleSelectCity(city.name)}
                  style={styles.cityItem}
                  activeOpacity={0.6}
                >
                  <View style={styles.cityItemContent}>
                    <View style={styles.cityIconContainer}>
                      <MapPinIcon size={20} color={COLORS.primary} style={styles.iconFix} />
                    </View>
                    <View>
                      <Text style={styles.cityText}>{city.name}</Text>
                      <Text style={styles.citySubText}>
                        {city.state} • {city.population}
                      </Text>
                    </View>
                  </View>
                  <ChevronRightIcon size={20} color={COLORS.gray400} style={styles.iconFix} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Empty State */}
            {filteredCities.length === 0 && (
              <View style={styles.noCities}>
                <MapPinIcon size={48} color="#D1D5DB" style={{ marginBottom: SPACING.md / 2 }} />
                <Text style={styles.noCitiesText}>Keine Städte gefunden</Text>
                <Text style={styles.noCitiesSubText}>
                  Versuchen Sie eine andere Suche
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- React Native Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flexGrow: 1, // Ensures the content takes up all available space when short
    paddingBottom: SPACING.lg, 
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    // Replaced complex gradient with a solid color, which is simpler for RN.
    backgroundColor: COLORS.primary, 
    alignItems: 'center',
    // Removed marginBottom to let the content start right after the header
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.white,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700', // Assuming h1 equivalent
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm / 2, // Fine-tuned vertical spacing
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md, // Add padding at the top of the content area
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    flexShrink: 0,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  locationSubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.gray400,
    fontSize: 14,
    marginHorizontal: SPACING.md,
  },
  searchContainer: {
    marginBottom: SPACING.lg,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1, 
    // Vertically center the icon.
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 56, // Common large input height
    paddingLeft: 48, // Make space for the icon
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  cityList: {
    gap: SPACING.sm, // space-y-2
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.background, // Gray-50
    borderRadius: 12,
  },
  cityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 4, // About gap-3
  },
  cityIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  citySubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noCities: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noCitiesText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  noCitiesSubText: {
    color: COLORS.gray400,
    fontSize: 14,
    marginTop: 4,
  },
  // Workaround for the simple Text-based icon components to center them vertically
  iconFix: {
    lineHeight: Platform.OS === 'ios' ? undefined : 20, // Adjust for better centering on Android
  }
});