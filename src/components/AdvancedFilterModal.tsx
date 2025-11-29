import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
// IMPORTANT: @react-native-community/slider does not bundle on web.
// Use a dynamic require for native platforms and provide a web fallback UI.
let NativeSlider: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeSlider = require('@react-native-community/slider').default;
  } catch (e) {
    NativeSlider = null;
  }
}

// Types for filter values and component props
type ProviderType = 'salon' | 'individual' | 'mobile';
type PriceRange = 1 | 2 | 3 | 4;
type SortOption = 'best-match' | 'top-rated' | 'distance';

interface FilterValues {
  sortBy: SortOption;
  providerTypes: ProviderType[];
  priceRanges: PriceRange[];
  rating: number;
}

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const THEME_COLOR = '#8B4513';

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const OptionButton: React.FC<OptionButtonProps> = ({ label, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
    onPress={onPress}
  >
    <Text style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({ visible, onClose, onApply }) => {
  const [sortBy, setSortBy] = useState<SortOption>('best-match');
  const [providerTypes, setProviderTypes] = useState<ProviderType[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [rating, setRating] = useState<number>(1);

  const toggleProviderType = (type: ProviderType) => {
    setProviderTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePriceRange = (price: PriceRange) => {
    setPriceRanges((prev) =>
      prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]
    );
  };

  const handleApply = () => {
    onApply({ sortBy, providerTypes, priceRanges, rating });
  };

  const handleReset = () => {
    setSortBy('best-match');
    setProviderTypes([]);
    setPriceRanges([]);
    setRating(1);
  };

  const RatingSelector = () => {
    // Web fallback: discrete buttons for rating selection
    if (Platform.OS === 'web' || !NativeSlider) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((r) => (
            <OptionButton
              key={r}
              label={`${r}★+`}
              isSelected={rating === r}
              onPress={() => setRating(r)}
            />
          ))}
        </View>
      );
    }
    // Native slider
    return (
      <NativeSlider
        style={{ width: '100%', height: 40 }}
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={rating}
        onValueChange={(v: number) => setRating(Math.round(v))}
        minimumTrackTintColor={THEME_COLOR}
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor={THEME_COLOR}
      />
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={28} color="#1F2937" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <FilterSection title="Sort by">
              <View style={styles.optionGroup}>
                <OptionButton label="Best Match" isSelected={sortBy === 'best-match'} onPress={() => setSortBy('best-match')} />
                <OptionButton label="Top Rated" isSelected={sortBy === 'top-rated'} onPress={() => setSortBy('top-rated')} />
                <OptionButton label="Distance" isSelected={sortBy === 'distance'} onPress={() => setSortBy('distance')} />
              </View>
            </FilterSection>

            <FilterSection title="Provider Type">
              <View style={styles.optionGroup}>
                <OptionButton label="Salon" isSelected={providerTypes.includes('salon')} onPress={() => toggleProviderType('salon')} />
                <OptionButton label="Individual" isSelected={providerTypes.includes('individual')} onPress={() => toggleProviderType('individual')} />
                <OptionButton label="Mobile" isSelected={providerTypes.includes('mobile')} onPress={() => toggleProviderType('mobile')} />
              </View>
            </FilterSection>

            <FilterSection title="Price Range">
              <View style={styles.optionGroup}>
                <OptionButton label="€" isSelected={priceRanges.includes(1)} onPress={() => togglePriceRange(1)} />
                <OptionButton label="€€" isSelected={priceRanges.includes(2)} onPress={() => togglePriceRange(2)} />
                <OptionButton label="€€€" isSelected={priceRanges.includes(3)} onPress={() => togglePriceRange(3)} />
                <OptionButton label="€€€€" isSelected={priceRanges.includes(4)} onPress={() => togglePriceRange(4)} />
              </View>
            </FilterSection>

            <FilterSection title={`Rating: ${rating}★+`}>
              <RatingSelector />
            </FilterSection>

          </ScrollView>
          <View style={styles.footer}>
            <Button title="Reset" variant="outline" onPress={handleReset} />
            <Button title="Apply Filters" onPress={handleApply} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollViewContent: {
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 12,
  },
  optionButtonSelected: {
    backgroundColor: THEME_COLOR,
  },
  optionButtonText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
});

export default AdvancedFilterModal;
