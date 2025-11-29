import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Badge } from '@/components/badge';
import { colors, spacing, typography, radii, shadows } from '@/theme/tokens';
 

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
                <Icon name="credit-card" size={24} color={colors.white} />
              </View>
              <View>
                <View style={styles.brandRow}>
                  <Text style={styles.brandTitle}>{method.brand}</Text>
                  {method.isDefault && (
                    <Badge title="Standard" color={colors.primary} textColor={colors.white} />
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
                style={({ pressed }) => [styles.deleteButton, pressed ? styles.deleteButtonPressed : null]}
              >
                <Icon name="trash" size={20} color={colors.error} />
              </Pressable>
            )}
          </View>

          <Text style={styles.cardholderName}>{method.cardholderName}</Text>

          {!method.isDefault && (
            <Button
              title="Als Standard festlegen"
              variant="outline"
              size="sm"
              icon={<Icon name="check" size={16} color={colors.gray700} style={styles.iconMargin} />}
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
                    <Badge title="Standard" color={colors.primary} textColor={colors.white} />
                  )}
                </View>
                <Text style={styles.paypalEmail}>{method.email}</Text>
              </View>
            </View>

            {!method.isDefault && (
              <Pressable
                onPress={() => handleDeleteConfirmation(method.id)}
                style={({ pressed }) => [styles.deleteButton, pressed ? styles.deleteButtonPressed : null]}
              >
                <Icon name="trash" size={20} color={colors.error} />
              </Pressable>
            )}
          </View>
          
          {!method.isDefault && (
            <Button
              title="Als Standard festlegen"
              variant="outline"
              size="sm"
              icon={<Icon name="check" size={16} color="#374151" style={styles.iconMargin} />}
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
            <Icon name="arrow-left" size={24} color={colors.gray700} />
          </Pressable>
          <Text style={styles.screenTitle}>Zahlungsmethoden</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Add New Payment Method */}
        <Button
          title="Zahlungsmethode hinzufügen"
          icon={<Icon name="plus" size={20} color={colors.white} style={styles.iconMargin} />}
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
  addButton: {
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
    width: '100%',
  },
  backButton: {
    marginLeft: -spacing.xs,
    padding: spacing.xs,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    // React Native doesn't support `gap` yet; use margins.
    gap: spacing.xs, // gap-2 (non-standard in RN)
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardExpiry: {
    color: colors.gray500,
    fontSize: typography.small.fontSize,
  },
  cardIconContainer: {
    alignItems: 'center',
    borderRadius: 8, // rounded-lg
    height: 48,
    justifyContent: 'center',
    width: 48, // w-12 h-12
  },
  cardLast4: {
    color: colors.gray600,
  },
  cardholderName: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    borderRadius: spacing.xs,
    padding: spacing.xs,
    // hover:bg-gray-100 transition-colors is implied by Pressable's pressed state
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  header: {
    ...shadows.sm,
    backgroundColor: colors.white,
  },
  headerBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconMargin: {
    marginRight: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  infoDescription: {
    color: colors.blue900,
    fontSize: typography.small.fontSize,
  },
  infoTitle: {
    color: colors.blue900,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  listContainer: {
    // React Native doesn't support `gap` yet; use margins between children instead.
    gap: spacing.sm, // space-y-3 (non-standard in RN)
  },
  methodCard: {
    padding: spacing.md,
  },
  methodContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  methodInfoBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    // React Native doesn't support `gap` yet; use margins.
    gap: spacing.sm, // gap-3 (non-standard in RN)
  },
  paypalEmail: {
    color: colors.gray600,
  },
  paypalIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.blue200,
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  paypalIconText: {
    color: colors.blue900,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  placeholderView: {
    width: 24,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  screenTitle: {
    color: colors.gray800,
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  setDefaultButton: {
    borderColor: colors.gray300,
    justifyContent: 'center',
    width: '100%',
  },
});
