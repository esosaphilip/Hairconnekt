import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { colors, spacing, radii } from '@/theme/tokens';

type SettingItem = {
  icon: string;
  label: string;
  description?: string;
  route?: string;
  action?: () => void;
  switch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

const SettingRow = ({ item }: { item: SettingItem }) => {
  const navigation = useNavigation();

  const ItemContent = (
    <View style={styles.settingRowContent}>
      <View style={styles.iconWrapper}>
        <Icon name={item.icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        {item.description && (
          <Text style={styles.settingDescription}>{item.description}</Text>
        )}
      </View>
    </View>
  );

  if (item.switch) {
    return (
      <View style={styles.settingRowSwitch}>
        {ItemContent}
        <Switch
          value={item.switchValue}
          onValueChange={item.onSwitchChange}
          trackColor={{ false: colors.gray200, true: colors.primary }}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => {
        if (item.action) {
          item.action();
        } else if (item.route) {
          navigation.navigate(item.route as never);
        }
      }}
      style={styles.settingRowButton}
      disabled={!item.action && !item.route}
    >
      {ItemContent}
      {(item.action || item.route) && (
        <Icon name="chevron-right" size={20} color={colors.gray400} />
      )}
    </TouchableOpacity>
  );
};

export function PrivacySecurityScreen() {
  const [profilePublic, setProfilePublic] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);

  const handleProfileVisibility = (val: boolean) => {
    setProfilePublic(val);
  };

  const handleLocationSharing = (val: boolean) => {
    setShareLocation(val);
  };

  const securitySettings: SettingItem[] = [
    {
      icon: "lock",
      label: "Passwort ändern",
      route: "PasswordReset",
    },
    {
      icon: "smartphone",
      label: "Aktive Sitzungen",
      description: "Du bist auf einem Gerät angemeldet.",
    }
  ];

  const privacySettings: SettingItem[] = [
    {
      icon: "eye",
      label: "Profil öffentlich sichtbar",
      switch: true,
      switchValue: profilePublic,
      onSwitchChange: handleProfileVisibility,
    },
    {
      icon: "map-pin",
      label: "Standort teilen",
      switch: true,
      switchValue: shareLocation,
      onSwitchChange: handleLocationSharing,
    }
  ];

  const dataSettings: SettingItem[] = [
    {
      icon: "file-text",
      label: "Datenschutzerklärung lesen",
      route: "PrivacyPolicy",
    },
    {
      icon: "download",
      label: "Daten exportieren",
      action: () => Alert.alert("Hinweis", "Diese Funktion ist in Kürze verfügbar."),
    },
    {
      icon: "trash-2",
      label: "Konto löschen",
      route: "DeleteAccount",
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Datenschutz & Sicherheit</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Sicherheit</Text>
          <View style={styles.card}>
            {securitySettings.map((item, index) => (
              <React.Fragment key={index}>
                <SettingRow item={item} />
                {index < securitySettings.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Datenschutz</Text>
          <View style={styles.card}>
            {privacySettings.map((item, index) => (
              <React.Fragment key={index}>
                <SettingRow item={item} />
                {index < privacySettings.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
            <View style={styles.infoBox}>
              <Icon name="info" size={16} color={colors.primary} />
              <Text style={styles.infoText}>
                Deine Daten werden gemäß der DSGVO verarbeitet und nicht an Dritte weitergegeben.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Deine Daten</Text>
          <View style={styles.card}>
            {dataSettings.map((item, index) => (
              <React.Fragment key={index}>
                <SettingRow item={item} />
                {index < dataSettings.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContent: {
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
  },
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  settingRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray800,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 2,
  },
  settingRowSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.blue50,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.blue100,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.blue900,
    lineHeight: 18,
  },
});