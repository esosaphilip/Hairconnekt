import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, ShieldAlert } from 'lucide-react-native';

// Custom Components (assumed to be available)
import Text from '../components/Text';
import Card from '../components/Card';
import Button from '../components/Button'; // Custom Button component
import { spacing } from '../theme/tokens';
import { useAuth } from '@/auth/AuthContext'; // Use correct context path

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const AMBER_COLOR = '#F59E0B'; // text-amber-600
const AMBER_BG = '#FFFBEB'; // bg-amber-50
const AMBER_BORDER = '#FEF3C7'; // border-amber-200

export function MessagesScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();
  const { user, tokens } = useAuth();

  // The verification logic remains the same
  const isVerified = !!tokens?.accessToken && !!(user?.emailVerified || user?.phoneVerified);

  const goVerify = () => {
    // @ts-ignore
    navigation.navigate('Verify'); // Assuming 'Verify' is the screen name
  };

  // --- Unverified State Render ---
  if (!isVerified) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerFixed}>
          <Text style={styles.mainTitle}>Nachrichten</Text>
        </View>
        <View style={styles.contentPadding}>
          <Card style={styles.unverifiedCard}>
            <View style={styles.unverifiedContent}>
              <ShieldAlert size={20} color={AMBER_COLOR} style={styles.iconMargin} />
              <View style={styles.unverifiedTextContainer}>
                <Text style={styles.unverifiedTitle}>Verifizierung erforderlich</Text>
                <Text style={styles.unverifiedDescription}>
                  Bitte verifiziere deine E-Mail oder Telefonnummer, um Nachrichten zu verwenden.
                </Text>
                <Button
                  title="Jetzt verifizieren"
                  onPress={goVerify}
                  style={styles.verifyButton}
                  textStyle={styles.verifyButtonText}
                />
              </View>
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  // --- Verified State Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerFixed}>
        <Text style={styles.mainTitle}>Nachrichten</Text>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Suche nach Namen..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Search size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Keine Unterhaltungen</Text>
          <Text style={styles.emptySubtitle}>
            Chats werden hier erscheinen, sobald unsere Messaging-Funktion live ist.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for RN ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  contentPadding: {
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1, // Ensures content takes up all available space
  },
  // Header (Web's sticky header translated to fixed View)
  headerFixed: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  mainTitle: {
    fontSize: 24, // h2 size
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  // Search Bar
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#F3F4F6', // Lighter background for input
    borderRadius: 8,
    paddingLeft: spacing.lg + spacing.xs, // pl-10 (40px)
    paddingRight: spacing.sm,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Unverified State
  unverifiedCard: {
    padding: spacing.md,
    backgroundColor: AMBER_BG,
    borderColor: AMBER_BORDER,
    borderWidth: 1,
  },
  unverifiedContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  iconMargin: {
    marginTop: 2,
    flexShrink: 0,
  },
  unverifiedTextContainer: {
    flex: 1,
  },
  unverifiedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E', // text-amber-900 equivalent
    marginBottom: spacing.xs / 2,
  },
  unverifiedDescription: {
    fontSize: 14,
    color: '#92400E', // text-amber-900 equivalent
  },
  verifyButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: AMBER_COLOR,
    borderRadius: 6,
    alignSelf: 'flex-start', // button
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State (Verified)
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48, // py-12
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 64, // w-16 h-16
    height: 64,
    backgroundColor: '#E5E7EB', // bg-gray-200
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: '#6B7280', // text-gray-500
    textAlign: 'center',
  },
});