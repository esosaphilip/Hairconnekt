import React from 'react';
import { View, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import Text from '../../components/Text';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Badge } from '../../components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/avatar';
import { colors, spacing, radii, typography } from '../../theme/tokens';

export function ProviderProfileScreen() {
  const onBack = () => {
    if (Platform.OS === 'web') {
      try {
        window.history.back();
      } catch {}
    }
  };

  const onEdit = () => {
    // Placeholder for future edit profile flow
    console.log('Edit profile (placeholder)');
  };

  const onOpenPublicProfile = () => {
    // Placeholder for navigation
    console.log('Navigate to /provider/more/public-profile (placeholder)');
    if (Platform.OS === 'web') {
      try {
        window.location.hash = '/provider/more/public-profile';
      } catch {}
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
<Pressable onPress={onBack} style={styles.iconBtn} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
            <Ionicons name="chevron-back" size={24} color={colors.gray700} />
          </Pressable>
<Text style={[typography.h3, styles.headerTitle]}>Mein Profil</Text>
<Pressable onPress={onEdit} style={styles.iconBtn} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
            <Ionicons name="pencil-outline" size={20} color={colors.gray700} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.centered}>
            <View style={{ position: 'relative', marginBottom: spacing.md }}>
              <Avatar size={96}>
                <AvatarImage uri="https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=200" />
                <AvatarFallback label="AM" />
              </Avatar>
<Pressable style={styles.cameraBtn} onPress={onEdit} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
                <Ionicons name="camera-outline" size={16} color={colors.white} />
              </Pressable>
            </View>

<Text style={[typography.h3, { marginBottom: 4 }]}>Aisha Mensah</Text>
            <Text style={{ color: colors.gray600, marginBottom: spacing.sm }}>Aisha's Braiding Studio</Text>

            <View style={[styles.row, { marginBottom: spacing.sm }]}>
              <Badge style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}>Pro</Badge>
              <View style={{ width: spacing.sm }} />
              <Badge variant="outline">Verifiziert</Badge>
              <View style={{ width: spacing.sm }} />
              <Badge variant="outline" style={{ borderColor: '#16A34A' }} textStyle={{ color: '#16A34A' }}>Geöffnet</Badge>
            </View>

            <View style={[styles.row, { marginBottom: 4 }]}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={{ marginLeft: 4 }}>4.8 (234 Bewertungen)</Text>
            </View>

            <Text style={{ color: colors.gray600, fontSize: 12 }}>Mitglied seit Januar 2023 · 847 Termine</Text>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>Kantstraße 42, 10625 Berlin</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>+49 30 1234567</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>aisha@braiding-studio.de</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>Mo-Sa: 9:00 - 20:00, So: Geschlossen</Text>
            </View>
          </View>

          <Button
            onPress={onOpenPublicProfile}
            variant="secondary"
            title="Öffentliches Profil anzeigen"
            style={{ marginTop: spacing.md, backgroundColor: colors.primary }}
          />
        </Card>

        {/* Bio Section */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={[styles.sectionHeader]}> 
            <Text style={styles.sectionTitle}>Über mich</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <Text style={{ fontSize: 14, color: colors.gray700 }}>
            Hallo! Ich bin Aisha und habe über 10 Jahre Erfahrung mit afrikanischen
            Flechtfrisuren. Meine Leidenschaft ist es, jedem Kunden einen individuellen
            Look zu kreieren, der perfekt zu ihm passt. Ich verwende nur hochwertige
            Produkte und lege großen Wert auf die Gesundheit deiner Haare.
          </Text>
        </Card>

        {/* Specialties */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spezialisierungen</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View style={styles.badgeWrap}>
            <Badge variant="secondary" style={styles.badgeItem}>Box Braids</Badge>
            <Badge variant="secondary" style={styles.badgeItem}>Cornrows</Badge>
            <Badge variant="secondary" style={styles.badgeItem}>Senegalese Twists</Badge>
            <Badge variant="secondary" style={styles.badgeItem}>Knotless Braids</Badge>
            <Badge variant="secondary" style={styles.badgeItem}>Passion Twists</Badge>
            <Badge variant="secondary" style={styles.badgeItem}>Faux Locs</Badge>
          </View>
        </Card>

        {/* Languages */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sprachen</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View style={styles.badgeWrap}>
            <Badge variant="outline" style={styles.badgeItem}>Deutsch</Badge>
            <Badge variant="outline" style={styles.badgeItem}>Englisch</Badge>
            <Badge variant="outline" style={styles.badgeItem}>Französisch</Badge>
            <Badge variant="outline" style={styles.badgeItem}>Twi</Badge>
          </View>
        </Card>

        {/* Social Media */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View>
            <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
              <Ionicons name="globe-outline" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>www.aishas-braiding.de</Text>
            </View>
            <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
              <Ionicons name="logo-instagram" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>@aishas_braiding_studio</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="logo-facebook" size={20} color={colors.gray400} />
              <Text style={styles.infoText}>Aisha's Braiding Studio Berlin</Text>
            </View>
          </View>
        </Card>

        {/* Statistics */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Statistiken</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>847</Text>
              <Text style={styles.statLabel}>Termine</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>234</Text>
              <Text style={styles.statLabel}>Bewertungen</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Annahmerate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2 Std.</Text>
              <Text style={styles.statLabel}>Ø Reaktionszeit</Text>
            </View>
          </View>
        </Card>

        {/* Certifications */}
        <Card style={{ padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Zertifikate & Ausbildungen</Text>
            <Pressable onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray700} />
            </Pressable>
          </View>
          <View>
            <View style={{ marginBottom: spacing.sm }}>
              <Text style={{ fontWeight: '600' }}>Professionelle Flechtfrisuren Ausbildung</Text>
              <Text style={{ color: colors.gray600 }}>Braiding Academy Berlin, 2019</Text>
            </View>
            <View>
              <Text style={{ fontWeight: '600' }}>Natürliche Haarpflege Spezialist</Text>
              <Text style={{ color: colors.gray600 }}>Natural Hair Institute, 2020</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    padding: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
      default: {},
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.sm,
    color: colors.black,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 2,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray600,
  },
});
