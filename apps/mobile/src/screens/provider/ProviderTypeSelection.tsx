import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Platform } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const serviceTypes = [
  {
    id: 'individual',
    iconName: 'person-outline',
    title: 'Einzelperson / Freelancer',
    description: 'Ich arbeite selbstständig',
  },
  {
    id: 'salon',
    iconName: 'business-outline',
    title: 'Salon / Barbershop',
    description: 'Ich habe ein Geschäft',
  },
  {
    id: 'mobile',
    iconName: 'car-outline',
    title: 'Mobiler Service',
    description: 'Ich komme zu meinen Kunden',
  },
];

export function ProviderTypeSelection() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const goBack = () => {
    if (Platform.OS === 'web') {
      try { window.history.back(); } catch {}
    } else {
      console.log('Navigate back');
    }
  };

  const goNext = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider-onboarding/registration'; } catch {}
    } else {
      console.log('Navigate to /provider-onboarding/registration');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, marginTop: spacing.md }}>
          <Pressable onPress={goBack} style={{ padding: spacing.xs }} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
            <Icon name={'chevron-back'} size={24} color={colors.black} />
          </Pressable>
          <View>
            <Text style={typography.h3}>Welchen Service bietest du an?</Text>
            <Text style={{ color: colors.gray600, fontSize: 12 }}>Mehrfachauswahl möglich</Text>
          </View>
        </View>

        {/* Service Type Cards */}
        <View style={{ rowGap: spacing.sm, marginBottom: spacing.lg }}>
          {serviceTypes.map((type) => {
            const isSelected = selectedTypes.includes(type.id);
            return (
              <Pressable key={type.id} onPress={() => toggleType(type.id)}>
                <Card style={{ padding: spacing.md, borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? colors.primary : '#00000010', backgroundColor: isSelected ? 'rgba(139,69,19,0.05)' : colors.white }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? colors.primary : colors.gray100 }}>
                      <Icon name={type.iconName} size={22} color={isSelected ? colors.white : colors.gray600} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', marginBottom: 2 }}>{type.title}</Text>
                      <Text style={{ fontSize: 14, color: colors.gray600 }}>{type.description}</Text>
                    </View>
                    <Icon name={(isSelected ? 'checkmark-circle' : 'ellipse-outline')} size={22} color={isSelected ? colors.primary : colors.gray400} />
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {/* Continue Button */}
        <Button title="Weiter" onPress={goNext} style={{ height: 48 }} disabled={selectedTypes.length === 0} />
      </ScrollView>
    </SafeAreaView>
  );
}
