import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Check,
  Trash2,
} from 'lucide-react-native';

// Custom Components (assumed to be available)
import Text from '../components/Text';
import Button from '../components/Button';
import Card from '../components/Card';
import { Badge } from '../components/badge'; // Custom Badge component
import { spacing } from '../theme/tokens';

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const DANGER_COLOR = '#EF4444'; // text-red-500
const INFO_BG = '#EFF6FF'; // bg-blue-50
const INFO_BORDER = '#BFDBFE'; // border-blue-100

// --- Utility Data ---
type CardPaymentMethod = {
  id: number;
  type: 'card';
  brand: 'Visa' | 'Mastercard' | 'Amex' | string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  cardholderName: string;
};

type PayPalPaymentMethod = {
  id: number;
  type: 'paypal';
  email: string;
  isDefault: boolean;
};

type PaymentMethod = CardPaymentMethod | PayPalPaymentMethod;

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2026',
    isDefault: true,
    cardholderName: 'Max Müller',
  },
  {
    id: 2,
    type: 'card',
    brand: 'Mastercard',
    last4: '5555',
    expiryMonth: '08',
    expiryYear: '2027',
    isDefault: false,
    cardholderName: 'Max Müller',
  },
  {
    id: 3,
    type: 'paypal',
    email: 'max.mueller@email.com',
    isDefault: false,
  },
];

// --- Main PaymentMethodsScreen Component ---

export function PaymentMethodsScreen() {
  const navigation = useNavigation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDeleteConfirmation = (id: number) => {
    Alert.alert(
      'Zahlungsmethode löschen?',
      'Bist du sicher, dass du diese Zahlungsmethode löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => handleDelete(id),
        },
      ]
    );
  };

  const handleDelete = (id: number) => {
    setPaymentMethods(
      paymentMethods.filter((method) => method.id !== id)
    );
    // You could optionally show a toast/alert here confirming deletion
  };

  const getCardIconStyle = (brand: string) => {
    const colors: Record<string, string> = {
      Visa: '#3B82F6', // bg-blue-500
      Mastercard: '#EF4444', // bg-red-500
      Amex: '#10B981', // bg-green-500
      Default: '#6B7280', // bg-gray-500
    };
    return { backgroundColor: colors[brand] || colors.Default };
  };

  const handleAddNewMethod = () => {
    // In a real RN app, this would navigate to a native payment sheet (Stripe, etc.)
    Alert.alert(
      'Hinzufügen',
      'Zahlungsmethode hinzufügen - wird in einem separaten Screen oder einem modalen Payment Sheet implementiert.',
      [{ text: 'OK' }]
    );
  };

  // --- Payment Method Item Renderer ---
  const PaymentMethodItem = ({ method }: { method: PaymentMethod }) => {
    if (method.type === 'card') {
      return (
        <Card style={styles.methodCard}>
          <View style={styles.methodContent}>
            <View style={styles.methodInfoBlock}>
              <View style={[styles.cardIconContainer, getCardIconStyle(method.brand)]}>
                <CreditCard size={24} color="#fff" />
              </View>
              <View>
                <View style={styles.brandRow}>
                  <Text style={styles.brandTitle}>{method.brand}</Text>
                  {method.isDefault && (
                    <Badge title="Standard" color={PRIMARY_COLOR} textColor="#fff" />
                  )}
                </View>
                <Text style={styles.cardLast4}>•••• {method.last4}</Text>
                <Text style={styles.cardExpiry}>
                  Gültig bis {method.expiryMonth}/{method.expiryYear}
                </Text>
              </View>
            </View>

            {!method.isDefault && (
              <Pressable
                onPress={() => handleDeleteConfirmation(method.id)}
                style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Trash2 size={20} color={DANGER_COLOR} />
              </Pressable>
            )}
          </View>

          <Text style={styles.cardholderName}>{method.cardholderName}</Text>

          {!method.isDefault && (
            <Button
              title="Als Standard festlegen"
              variant="outline"
              size="sm"
              icon={<Check size={16} color="#374151" style={styles.iconMargin} />}
              onPress={() => handleSetDefault(method.id)}
              style={styles.setDefaultButton}
            />
          )}
        </Card>
      );
    }

    if (method.type === 'paypal') {
      return (
        <Card style={styles.methodCard}>
          <View style={styles.methodContent}>
            <View style={styles.methodInfoBlock}>
              <View style={styles.paypalIconContainer}>
                <Text style={styles.paypalIconText}>PP</Text>
              </View>
              <View>
                <View style={styles.brandRow}>
                  <Text style={styles.brandTitle}>PayPal</Text>
                  {method.isDefault && (
                    <Badge title="Standard" color={PRIMARY_COLOR} textColor="#fff" />
                  )}
                </View>
                <Text style={styles.paypalEmail}>{method.email}</Text>
              </View>
            </View>

            {!method.isDefault && (
              <Pressable
                onPress={() => handleDeleteConfirmation(method.id)}
                style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Trash2 size={20} color={DANGER_COLOR} />
              </Pressable>
            )}
          </View>
          
          {!method.isDefault && (
            <Button
              title="Als Standard festlegen"
              variant="outline"
              size="sm"
              icon={<Check size={16} color="#374151" style={styles.iconMargin} />}
              onPress={() => handleSetDefault(method.id)}
              style={styles.setDefaultButton}
            />
          )}
        </Card>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header (Fixed) */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.screenTitle}>Zahlungsmethoden</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Add New Payment Method */}
        <Button
          title="Zahlungsmethode hinzufügen"
          icon={<Plus size={20} color="#fff" style={styles.iconMargin} />}
          style={styles.addButton}
          onPress={handleAddNewMethod}
        />

        {/* Payment Methods List */}
        <View style={styles.listContainer}>
          {paymentMethods.map((method) => (
            <PaymentMethodItem key={method.id} method={method} />
          ))}
        </View>

        {/* Info Box */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sichere Zahlungen</Text>
          <Text style={styles.infoDescription}>
            Alle Zahlungen werden verschlüsselt und sicher verarbeitet. Deine
            Zahlungsinformationen werden niemals mit Drittanbietern geteilt.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for RN ---
// Cast styles to any to temporarily support web-only keys like `gap` without TS errors.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholderView: {
    width: 24,
  },

  // Add Button
  addButton: {
    width: '100%',
    marginBottom: spacing.lg,
    backgroundColor: PRIMARY_COLOR,
  },
  iconMargin: {
    marginRight: spacing.xs,
  },

  // List
  listContainer: {
    // React Native doesn't support `gap` yet; use margins between children instead.
    gap: spacing.sm, // space-y-3 (non-standard in RN)
  },
  methodCard: {
    padding: spacing.md,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  methodInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; use margins.
    gap: spacing.sm, // gap-3 (non-standard in RN)
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; use margins.
    gap: spacing.xs, // gap-2 (non-standard in RN)
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Card Styling
  cardIconContainer: {
    width: 48, // w-12 h-12
    height: 48,
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLast4: {
    color: '#4B5563', // text-gray-600
  },
  cardExpiry: {
    fontSize: 14,
    color: '#6B7280', // text-gray-500
  },
  cardholderName: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
    marginBottom: spacing.xs,
  },

  // PayPal Styling
  paypalIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#DBEAFE', // bg-blue-100
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB', // text-blue-600
  },
  paypalEmail: {
    color: '#4B5563',
  },

  // Actions
  deleteButton: {
    padding: spacing.xs,
    borderRadius: spacing.xs,
    // hover:bg-gray-100 transition-colors is implied by Pressable's pressed state
  },
  setDefaultButton: {
    width: '100%',
    borderColor: '#D1D5DB', // default border for outline
    justifyContent: 'center',
  },

  // Info Card
  infoCard: {
    padding: spacing.md,
    marginTop: spacing.lg, // mt-6
    backgroundColor: INFO_BG,
    borderColor: INFO_BORDER,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF', // text-blue-900
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: 14,
    color: '#1E40AF', // text-blue-800
  },
}) as any;