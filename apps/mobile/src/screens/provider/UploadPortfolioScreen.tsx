import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Input from '../../components/Input'; // Custom component for TextInput
import Textarea from '../../components/textarea'; // Custom multiline Input component
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import Picker from '../../components/Picker'; // Custom component for dropdowns

// NOTE: In a real RN app, you would use a library like 'react-native-image-picker'
// or 'react-native-document-picker'. We'll mock the required functions.
// import { launchImageLibrary } from 'react-native-image-picker';

// --- Mock Data ---
const categories = [
  "Box Braids",
  "Knotless Braids",
  "Cornrows",
  "Senegalese Twists",
  "Passion Twists",
  "Locs",
  "Natural Hair Care",
  "Special Occasion",
  "Barber Services",
  "Other",
];

// --- Custom Tokens (Imported from a central theme file) ---
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { http } from '../../api/http';
import { getAuthBundle } from '../../auth/tokenStorage';

// --- Mock Image Picker Implementation ---
// In RN, images are objects containing 'uri', 'fileName', 'fileSize', etc.
type ImageAsset = {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
};

const mockLaunchImageLibrary = (callback: (assets: ImageAsset[]) => void) => {
    // Mock user selecting 1-3 images with local URIs
    const mockImages = [
        { uri: 'https://picsum.photos/200/300?random=1', fileName: 'photo1.jpg', type: 'image/jpeg' },
        { uri: 'https://picsum.photos/200/300?random=2', fileName: 'photo2.jpg', type: 'image/jpeg' },
        { uri: 'https://picsum.photos/200/300?random=3', fileName: 'photo3.jpg', type: 'image/jpeg' },
    ].slice(0, Math.floor(Math.random() * 3) + 1); // Select 1 to 3 random images

    callback(mockImages);
};

// --- Main Component ---
export function UploadPortfolioScreen() {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  // In RN, 'images' state stores the picker response objects, not web File objects.
  const [images, setImages] = useState<ImageAsset[]>([]);

  const handleImageSelect = () => {
    mockLaunchImageLibrary((selectedAssets: ImageAsset[]) => {
      if (selectedAssets && selectedAssets.length > 0) {
        const newImages = selectedAssets.map((asset: ImageAsset) => ({
            uri: asset.uri,
            fileName: asset.fileName,
            type: asset.type,
            // Mock file size validation:
            fileSize: Math.floor(Math.random() * (1024 * 1024 * 5)) + 1, // 1MB to 6MB
        }));
        
        if (newImages.length + images.length > 10) {
          Alert.alert("Fehler", "Maximal 10 Bilder pro Upload erlaubt");
          return;
        }
        
        // In a real app, you would also check file size (e.g., max 10MB) here
        
        setImages([...images, ...newImages]);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert("Fehler", "Bitte mindestens ein Bild auswählen");
      return;
    }
    if (!formData.category) {
      Alert.alert("Fehler", "Bitte eine Kategorie auswählen");
      return;
    }
    try {
      Alert.alert("Upload gestartet", "Portfolio-Bilder werden hochgeladen...");
      const bundle = await getAuthBundle();
      const providerId = bundle?.user?.id || '';
      if (!providerId) {
        Alert.alert("Fehler", "Kein Benutzer gefunden – bitte erneut anmelden");
        return;
      }
      // Use the first image URL to create a portfolio entry via backend
      const first = images[0];
      const caption = formData.title || `Kategorie: ${formData.category}`;
      await http.post('/portfolio/upload', {
        providerId,
        imageUrl: first.uri,
        caption,
      });
      Alert.alert("Erfolg", "Portfolio erfolgreich aktualisiert!");
      navigation.navigate("ProviderPortfolioScreen");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Upload fehlgeschlagen';
      Alert.alert("Fehler", String(msg));
    }
  };

  const isSubmitDisabled = images.length === 0 || !formData.category;

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <View>
            <Text style={styles.headerTitle}>Portfolio hochladen</Text>
            <Text style={styles.headerSubtitle}>Zeige deine besten Arbeiten</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Upload */}
        <View>
          <Text style={styles.label}>Bilder * (max. 10)</Text>
          <View style={styles.uploadContainer}>
            {/* Replaced web file input with native button triggering picker function */}
            <Icon name="upload" size={48} color={COLORS.textSecondary} style={styles.uploadIcon} />
            <Text style={styles.uploadText}>Bilder hier ablegen oder klicken zum Auswählen</Text>
            <Text style={styles.uploadHintText}>PNG, JPG bis zu 10MB pro Bild</Text>
            
            <Button 
                title="Bilder auswählen"
                variant="outline"
                onPress={handleImageSelect}
                icon="camera"
                style={styles.selectButton}
            />
          </View>

          {/* Image Previews */}
          {images.length > 0 && (
            <View style={styles.previewGrid}>
              {images.map((image, index) => (
                <View key={image.uri + index} style={styles.previewItem}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={styles.removeButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="x" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
            {/* Title */}
            <View style={styles.formGroup}>
            <Text style={styles.label}>Titel (optional)</Text>
            <Input
                value={formData.title}
                onChangeText={(value: string) => setFormData({ ...formData, title: value })}
                placeholder="z.B. 'Lange Box Braids mit Ombré'"
            />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
            <Text style={styles.label}>Kategorie *</Text>
            <Picker
                selectedValue={formData.category}
                onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                items={categories.map((category: string) => ({ label: category, value: category }))}
            />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
            <Text style={styles.label}>Beschreibung (optional)</Text>
            <Textarea
                value={formData.description}
                onChangeText={(value: string) => setFormData({ ...formData, description: value })}
                placeholder="Beschreibe den Style, verwendete Techniken, Dauer, etc."
                numberOfLines={4}
            />
            <Text style={styles.hintText}>
                Eine gute Beschreibung hilft Kunden, deine Arbeit besser zu verstehen
            </Text>
            </View>
        </View>

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tipps für gute Portfolio-Bilder</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipsItem}>• Gute Beleuchtung verwenden</Text>
            <Text style={styles.tipsItem}>• Verschiedene Winkel zeigen</Text>
            <Text style={styles.tipsItem}>• Details hervorheben</Text>
            <Text style={styles.tipsItem}>• Vorher-Nachher Vergleiche</Text>
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          title={`Hochladen (${images.length} ${images.length === 1 ? "Bild" : "Bilder"})`}
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: COLORS.primary }]}
          disabled={isSubmitDisabled}
        />
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
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    padding: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Scroll Content & Form ---
  scrollContent: {
    padding: SPACING.md || 16,
    paddingBottom: SPACING.xl * 2,
  },
  label: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  hintText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    marginTop: SPACING.xs,
  },
  formSection: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  formGroup: {
    gap: SPACING.xs / 2,
  },
  // --- Image Upload Styles ---
  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border || '#D1D5DB',
    borderRadius: 8,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: SPACING.xs,
  },
  uploadIcon: {
    marginBottom: SPACING.sm,
  },
  uploadText: {
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  uploadHintText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.md,
  },
  selectButton: {
    // Styling adjusted for custom Button component
    width: 200, // Fixed width for clear tapping area
  },
  // --- Image Preview Styles ---
  previewGrid: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  previewItem: {
    width: '31%', // Simulate grid-cols-3 with gap
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: COLORS.danger || '#EF4444', // red-500
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  // --- Tips Card Styles ---
  tipsCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.infoBg || '#EFF6FF', // blue-50
    borderColor: COLORS.infoBorder || '#DBEAFE', // blue-200
    borderWidth: 1,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    color: COLORS.infoText || '#1E40AF', // blue-900
    marginBottom: SPACING.sm,
  },
  tipsList: {
    gap: SPACING.xs / 2,
  },
  tipsItem: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.infoTextDark || '#374151', // blue-800
  },
  // --- Submit Button ---
  submitButton: {
    width: '100%',
    height: 48,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});
