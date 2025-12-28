import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Input } from '../../components/Input';
import Text from '../../components/Text';
import { useLocation } from '../../context/LocationContext';
import { colors, spacing } from '../../theme/tokens';

// --- Icon Helpers ---
type IconProps = { size: number; color: string; style?: StyleProp<TextStyle> };
const MapPinIcon = (props: IconProps) => <Text style={[{ color: props.color, fontSize: props.size }, props.style]}>📍</Text>;
const SearchIcon = (props: IconProps) => <Text style={[{ color: props.color, fontSize: props.size }, props.style]}>🔍</Text>;
const ChevronRightIcon = (props: IconProps) => <Text style={[{ color: props.color, fontSize: props.size }, props.style]}>▶️</Text>;
const NavigationIcon = (props: IconProps) => <Text style={[{ color: props.color, fontSize: props.size }, props.style]}>🧭</Text>;

// --- Constants & Data ---

// Coordinates for major cities (Approximate)
const germanCities = [
  { name: 'Berlin', state: 'Berlin', population: '3.7M', lat: 52.5200, lon: 13.4050 },
  { name: 'Hamburg', state: 'Hamburg', population: '1.9M', lat: 53.5511, lon: 9.9937 },
  { name: 'München', state: 'Bayern', population: '1.5M', lat: 48.1351, lon: 11.5820 },
  { name: 'Köln', state: 'Nordrhein-Westfalen', population: '1.1M', lat: 50.9375, lon: 6.9603 },
  { name: 'Frankfurt', state: 'Hessen', population: '760K', lat: 50.1109, lon: 8.6821 },
  { name: 'Stuttgart', state: 'Baden-Württemberg', population: '635K', lat: 48.7758, lon: 9.1829 },
  { name: 'Düsseldorf', state: 'Nordrhein-Westfalen', population: '620K', lat: 51.2277, lon: 6.7735 },
  { name: 'Wuppertal', state: 'Nordrhein-Westfalen', population: '355K', lat: 51.2562, lon: 7.1508 },
  { name: 'Dortmund', state: 'Nordrhein-Westfalen', population: '587K', lat: 51.5136, lon: 7.4653 },
  { name: 'Essen', state: 'Nordrhein-Westfalen', population: '583K', lat: 51.4556, lon: 7.0116 },
  { name: 'Leipzig', state: 'Sachsen', population: '600K', lat: 51.3397, lon: 12.3731 },
];

type RootStackParamList = {
  Home: undefined;
};

export function LocationSelectionScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { setLocation, detectLocation, isLoading } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const filteredCities = germanCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCity = async (city: typeof germanCities[0]) => {
    console.log('Selecting city:', city.name);
    try {
      await setLocation({
        lat: city.lat,
        lon: city.lon,
        city: city.name,
        label: city.name,
        isManual: true,
      });
      console.log(`City selected and set: ${city.name}`);
      navigation.navigate('Home');
    } catch (error) {
      console.error("Failed to set location:", error);
      Alert.alert("Fehler", "Standort konnte nicht gesetzt werden.");
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      await detectLocation();
      // detectLocation interacts with state/context directly, check if successful?
      // Ideally detectLocation should throw or return status.
      // For now we assume if it finishes without error, it set location.
      // But we can check location context in useEffect if we wanted strictly.

      // Small delay to ensure state update propagates if needed, or just nav
      navigation.navigate('Home');
    } catch (error) {
      // Handled in context mostly, but if it throws:
      Alert.alert('Fehler', 'Standort konnte nicht ermittelt werden.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <MapPinIcon size={32} color={colors.primary} style={styles.iconFix} />
          </View>
          <Text variant="h2" style={styles.headerTitle}>
            Wo möchtest du suchen?
          </Text>
          <Text style={styles.headerSubtitle}>
            Wähle einen Standort, um Friseure in deiner Nähe zu finden.
          </Text>
        </View>

        <View style={styles.content}>

          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            style={styles.locationButton}
            disabled={isLocating}
            activeOpacity={0.7}
          >
            <View style={styles.locationIconContainer}>
              {isLocating ? (
                <ActivityIndicator color={colors.secondary} size="small" />
              ) : (
                <NavigationIcon size={24} color={colors.secondary} style={styles.iconFix} />
              )}
            </View>
            <View style={styles.flexFill}>
              <Text style={styles.locationText}>
                {isLocating ? 'Standort wird ermittelt...' : 'Aktuellen Standort verwenden'}
              </Text>
              <Text style={styles.locationSubText}>Schnell und genau</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oder</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.searchContainer}>
            <SearchIcon size={20} color={colors.gray400} style={styles.searchIcon} />
            <Input
              placeholder="Stadt suchen..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Beliebte Städte</Text>
            <View style={[styles.cityList, { paddingBottom: 40 }]}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city.name}
                  onPress={() => handleSelectCity(city)}
                  style={styles.cityItem}
                  activeOpacity={0.6}
                >
                  <View style={styles.cityItemContent}>
                    <View style={styles.cityIconContainer}>
                      <MapPinIcon size={20} color={colors.primary} style={styles.iconFix} />
                    </View>
                    <View>
                      <Text style={styles.cityText}>{city.name}</Text>
                      <Text style={styles.citySubText}>
                        {city.state} • {city.population}
                      </Text>
                    </View>
                  </View>
                  <ChevronRightIcon size={20} color={colors.gray400} style={styles.iconFix} />
                </TouchableOpacity>
              ))}
            </View>

            {filteredCities.length === 0 && (
              <View style={styles.noCities}>
                <MapPinIcon size={48} color={colors.gray400} style={{ marginBottom: spacing.md }} />
                <Text style={styles.noCitiesText}>Keine Städte gefunden</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flexGrow: 1, paddingBottom: spacing.lg },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 32,
    height: 64,
    width: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconFix: { lineHeight: Platform.OS === 'ios' ? undefined : 20 },
  headerTitle: { color: colors.white, textAlign: 'center', marginBottom: spacing.xs },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' },
  content: { flex: 1, padding: spacing.lg },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderColor: colors.secondary,
    borderWidth: 2,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  flexFill: { flex: 1 },
  locationText: { color: colors.gray900, fontWeight: '600', fontSize: 16 },
  locationSubText: { color: colors.gray500, fontSize: 12 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray200 },
  dividerText: { marginHorizontal: spacing.md, color: colors.gray400, fontSize: 14 },
  searchContainer: { justifyContent: 'center', marginBottom: spacing.lg },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  searchInput: { paddingLeft: 48, height: 50 },
  listContainer: { flex: 1 },
  listTitle: { color: colors.gray500, marginBottom: spacing.sm, fontWeight: '500' },
  cityList: { gap: spacing.sm },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: 12,
  },
  cityItemContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityText: { color: colors.gray900, fontSize: 16, fontWeight: '500' },
  citySubText: { color: colors.gray500, fontSize: 12 },
  noCities: { alignItems: 'center', paddingVertical: spacing.xl },
  noCitiesText: { color: colors.gray500, fontSize: 16 },
});
