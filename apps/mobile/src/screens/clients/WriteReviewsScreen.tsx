import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Star,
  Upload,
  X,
  AlertCircle,
} from 'lucide-react-native'; // Using lucide-react-native for icons
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar, { AvatarImage } from '../../components/avatar';
import Textarea from '../../components/textarea';

// Types
type RatingCategory = {
  id: string;
  label: string;
  value: number;
};

type SelectedImage = { uri: string; size: number; name: string };

type WriteReviewRouteParams = { appointmentId?: string };

// --- Constants & Utilities ---

const PRIMARY_COLOR = '#8B4513';
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 5;

// Simple hook to show a mobile alert/toast-like message
const showToast = (message: string, isError: boolean = false) => {
  Alert.alert(isError ? 'Fehler' : 'Erfolg', message);
};

// --- Star Rating Component (RN Adaptation) ---

type StarRatingProps = {
  rating: number;
  onRate: (rating: number) => void;
  size?: 'small' | 'default' | 'large';
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  size = 'default',
}) => {
  const iconSize = {
    small: 20, // w-5 h-5
    default: 32, // w-8 h-8
    large: 48, // w-12 h-12
  }[size];

  return (
    <View style={styles.starRatingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate(star)}
          // Removed onMouseEnter/onMouseLeave as hover doesn't exist on touch screens
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Star
            size={iconSize}
            color={star <= rating ? '#FACC15' : '#D1D5DB'} // fill-yellow-400 : text-gray-300
            fill={star <= rating ? '#FACC15' : 'none'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// --- Screen Component ---

export default function WriteReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { appointmentId } = (route.params as WriteReviewRouteParams) || {};

  const [loading, setLoading] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  // Hover state is removed as it's not applicable in RN.
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]); // Use array of selected image objects
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const [categories, setCategories] = useState<RatingCategory[]>([
    { id: 'quality', label: 'Qualität der Arbeit', value: 0 },
    { id: 'professionalism', label: 'Professionalität', value: 0 },
    { id: 'timeliness', label: 'Pünktlichkeit', value: 0 },
  ]);

  // Mock appointment data
  const appointment: {
    provider: { name: string; image: string; businessName: string };
    service: { name: string; date: string; time: string };
  } = {
    provider: {
      name: 'Amara Styles',
      image: '',
      businessName: 'Braids & Beauty Berlin',
    },
    service: {
      name: 'Box Braids',
      date: '25.10.2024',
      time: '14:00',
    },
  };

  // --- RN Image Upload Handler ---
  const handleImageUploadNative = async (): Promise<void> => {
    // In a real RN app, you'd use a library like 'expo-image-picker' or 'react-native-image-picker'
    
    // Simulate image picking result:
    const mockImages = [
      { uri: 'https://picsum.photos/id/1018/200/200', fileName: 'photo1.jpg', fileSize: 400000 },
      { uri: 'https://picsum.photos/id/1025/200/200', fileName: 'photo2.jpg', fileSize: 300000 },
    ];
    
    const newFiles: SelectedImage[] = mockImages.map(file => ({
      uri: file.uri,
      // On mobile, the URI is often enough for display and upload
      size: file.fileSize, 
      name: file.fileName,
    })).filter(file => {
      if ((file.size / 1024 / 1024) > MAX_IMAGE_SIZE_MB) {
        showToast(`${file.name} ist zu groß (max. ${MAX_IMAGE_SIZE_MB}MB)`, true);
        return false;
      }
      return true;
    });
    
    if (images.length + newFiles.length > MAX_IMAGES) {
      showToast(`Maximal ${MAX_IMAGES} Bilder erlaubt`, true);
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviewUrls((prev) => [...prev, ...newFiles.map(f => f.uri)]);
    
    // In production, the image picker would handle selecting multiple images 
    // and provide the URIs needed for display and upload.
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  const handleCategoryRating = (categoryId: string, rating: number) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, value: rating } : cat
      )
    );
  };

  const validateForm = (): boolean => {
    if (overallRating === 0) {
      showToast('Bitte geben Sie eine Gesamtbewertung ab', true);
      return false;
    }

    if (comment.trim().length < 10) {
      showToast('Bitte schreiben Sie mindestens 10 Zeichen', true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast('Bewertung erfolgreich abgegeben');
      navigation.navigate('MyReviews'); // Navigate to a review list screen
    } catch (error) {
      showToast('Fehler beim Absenden der Bewertung', true);
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = [
    '',
    'Sehr schlecht',
    'Schlecht',
    'Durchschnittlich',
    'Gut',
    'Ausgezeichnet',
  ];

  const currentOverallRating = overallRating; // Hover is removed

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bewertung schreiben</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appointment Info */}
        <Card style={styles.appointmentCard}>
          <View style={styles.flexRow}>
            {appointment.provider.image ? (
              <Avatar style={styles.avatar}>
                <AvatarImage uri={appointment.provider.image} />
              </Avatar>
            ) : (
              <Avatar style={styles.avatar}>
                {appointment.provider.name.charAt(0)}
              </Avatar>
            )}
            <View style={styles.appointmentDetails}>
              <Text style={styles.providerName}>{appointment.provider.name}</Text>
              <Text style={styles.businessName}>
                {appointment.provider.businessName}
              </Text>
              <View style={styles.appointmentService}>
                <Text style={styles.serviceText}>{appointment.service.name}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.serviceText}>{appointment.service.date}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.serviceText}>{appointment.service.time} Uhr</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Overall Rating */}
        <Card style={styles.overallRatingCard}>
          <View style={styles.textCenter}>
            <Text style={styles.overallRatingLabel}>
              Wie war Ihre Erfahrung?
            </Text>
            <View style={styles.ratingStarsContainer}>
              <StarRating
                rating={currentOverallRating}
                onRate={setOverallRating}
                size="large"
              />
            </View>
            <Text style={styles.ratingText}>
              {ratingLabels[currentOverallRating]}
            </Text>
          </View>
        </Card>

        {/* Category Ratings */}
        <Card style={styles.categoryRatingsCard}>
          <Text style={styles.categoryLabel}>Detaillierte Bewertung</Text>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.flexBetween}>
                <Text style={styles.categoryItemLabel}>{category.label}</Text>
                <StarRating
                  rating={category.value}
                  onRate={(rating) => handleCategoryRating(category.id, rating)}
                  size="small"
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>
            Ihre Bewertung <Text style={styles.required}>*</Text>
          </Text>
          <Textarea
            placeholder="Teilen Sie Ihre Erfahrung mit anderen... Was hat Ihnen besonders gefallen? Was könnte verbessert werden?"
            value={comment}
            onChangeText={setComment}
            maxLength={1000}
            style={{ minHeight: 120 }}
          />
          <View style={styles.commentMeta}>
            <Text style={styles.commentMinLength}>Mindestens 10 Zeichen</Text>
            <Text
              style={[
                styles.commentCount,
                comment.length > 900 && styles.commentCountWarning,
              ]}
            >
              {comment.length}/1000
            </Text>
          </View>
        </View>

        {/* Photo Upload */}
        <Card style={styles.photoUploadCard}>
          <View style={styles.flexBetween}>
            <Text style={styles.photoUploadLabel}>Fotos hinzufügen (optional)</Text>
            <Text style={styles.photoCount}>{images.length}/{MAX_IMAGES}</Text>
          </View>
          
          <Text style={styles.photoHelpText}>
            Helfen Sie anderen mit Fotos Ihrer neuen Frisur
          </Text>

          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <View style={styles.imageGrid}>
              {imagePreviewUrls.map((url, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image
                    source={{ uri: url }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={styles.removeImageButton}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Upload Button */}
          {images.length < MAX_IMAGES && (
            <TouchableOpacity
              onPress={handleImageUploadNative}
              style={styles.uploadArea}
            >
              <Upload size={32} color="#9CA3AF" />
              <Text style={styles.uploadText}>Foto hochladen</Text>
              <Text style={styles.uploadHint}>Max. {MAX_IMAGE_SIZE_MB}MB pro Bild</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Guidelines */}
        <Card style={styles.guidelinesCard}>
          <View style={styles.flexRow}>
            <AlertCircle size={20} color="#2563EB" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.guidelinesTitle}>Bewertungsrichtlinien:</Text>
              <View style={styles.guidelineList}>
                <Text style={styles.guidelineItem}>• Seien Sie ehrlich und konstruktiv</Text>
                <Text style={styles.guidelineItem}>• Vermeiden Sie beleidigende Sprache</Text>
                <Text style={styles.guidelineItem}>• Konzentrieren Sie sich auf Ihre Erfahrung</Text>
                <Text style={styles.guidelineItem}>• Keine persönlichen Informationen teilen</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title="Bewertung veröffentlichen"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || overallRating === 0}
            style={styles.submitButton}
          />

          <Button
            title="Abbrechen"
            onPress={() => navigation.navigate('Appointments')} // Navigate back to list
            variant="ghost"
            style={styles.cancelButton}
            disabled={loading}
          />
        </View>

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          Ihre Bewertung wird öffentlich sichtbar sein und hilft anderen Nutzern
          bei der Auswahl
        </Text>
      </ScrollView>
    </View>
  );
}

// --- StyleSheet API for Styling ---

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  flexRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  flexBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textCenter: {
    alignItems: 'center',
  },
  required: {
    color: '#EF4444',
  },
  // --- Appointment Info ---
  appointmentCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  avatar: {
    borderRadius: 32,
    height: 64,
    marginRight: 16,
    width: 64,
  },
  appointmentDetails: {
    flex: 1,
  },
  providerName: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
  businessName: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 4,
  },
  appointmentService: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceText: {
    color: '#4B5563',
    fontSize: 14,
  },
  separator: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  // --- Overall Rating ---
  overallRatingCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 24,
  },
  overallRatingLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  ratingStarsContainer: {
    marginBottom: 8,
  },
  ratingText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 24, // min-h-6 equivalent
  },
  starRatingContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    // Add padding if needed for easier tapping
    padding: 4, 
  },
  // --- Category Ratings ---
  categoryRatingsCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  categoryLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryItem: {
    paddingVertical: 8,
  },
  categoryItemLabel: {
    color: '#4B5563',
    fontSize: 14,
  },
  // --- Comment ---
  commentSection: {
    marginBottom: 16,
  },
  commentLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  commentMinLength: {
    color: '#4B5563',
    fontSize: 12,
  },
  commentCount: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  commentCountWarning: {
    color: '#EA580C', // text-orange-600
  },
  // --- Photo Upload ---
  photoUploadCard: {
    borderRadius: 8,
    gap: 12,
    marginBottom: 16,
    padding: 16,
  },
  photoUploadLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  photoCount: {
    color: '#6B7280',
    fontSize: 14,
  },
  photoHelpText: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  imagePreviewWrapper: {
    width: Platform.OS === 'web' ? 100 : '30%', // Approximate 1/3 width on native
    aspectRatio: 1,
    position: 'relative',
  },
  imagePreview: {
    borderRadius: 8,
    flex: 1,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    // Minimal shadow for RN
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB', // border-gray-300
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  uploadText: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 8,
  },
  uploadHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  // --- Guidelines ---
  guidelinesCard: {
    padding: 16,
    backgroundColor: '#EFF6FF', // bg-blue-50
    borderColor: '#DBEAFE', // border-blue-200
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  guidelinesTitle: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
  guidelineList: {
    gap: 4,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#1E40AF', // text-blue-800
    marginLeft: 8,
  },
  // --- Submit Section ---
  submitSection: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    height: 48,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  privacyNote: {
    color: '#4B5563',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});