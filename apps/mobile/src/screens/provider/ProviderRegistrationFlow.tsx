import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert, // Replaces web 'toast' and provides feedback
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Input from '../../components/Input';
import { Checkbox } from '../../components/checkbox'; // Custom Checkbox component
import { Progress } from '../../components/progress'; // Custom Progress Bar component
import Card from '../../components/Card';
import Picker from '../../components/Picker'; // Custom Picker component (Select replacement)
import { Slider } from '../../components/slider'; // Custom Slider component
import Icon from '../../components/Icon';
import { colors, spacing, typography } from '../../theme/tokens';
import { http } from '../../api/http';

// --- Type Definitions (Adapted for React Native File objects) ---
type Step = 1 | 2 | 3 | 4 | 5;

// Mock file type: RN file picker returns an object with a URI
interface RNFile {
    uri: string;
    name: string;
}

interface FormData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingEmails: boolean;

  // Step 2: Business Info
  businessName: string;
  businessTypes: string[];
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  state: string;
  showOnMap: boolean;
  serviceRadius: number;
  businessLicense: string;
  taxId: string;

  // Step 3: Services & Expertise
  serviceCategories: string[];
  yearsExperience: number;
  languages: string[];
  specializations: string[];

  // Step 4: Verification (Using RNFile mock type)
  idDocument: RNFile | null;
  businessDocument: RNFile | null;
  certificates: RNFile[];
  profilePicture: RNFile | null;
  portfolioImages: RNFile[];
}

const initialFormData: FormData = {
  // ... (Your initialFormData here)
    firstName: "Max", // Prefill for testing speed
    lastName: "Mustermann",
    email: "test@example.com",
    phone: "123456789",
    password: "Password123",
    confirmPassword: "Password123",
    acceptTerms: true,
    acceptPrivacy: true,
    marketingEmails: false,
  
    businessName: "",
    businessTypes: ["Freelancer"],
    street: "Musterstraße",
    houseNumber: "123",
    postalCode: "44139",
    city: "Dortmund",
    state: "NRW",
    showOnMap: true,
    serviceRadius: 10,
    businessLicense: "",
    taxId: "",
  
    serviceCategories: ["Box Braids"],
    yearsExperience: 5,
    languages: ["Deutsch"],
    specializations: [],
  
    idDocument: null,
    businessDocument: null,
    certificates: [],
    profilePicture: null,
    portfolioImages: [],
};

// Mock Bundesländer for Picker
const GERMAN_STATES = [
    { label: "Nordrhein-Westfalen", value: "NRW" },
    { label: "Bayern", value: "BY" },
    { label: "Baden-Württemberg", value: "BW" },
    { label: "Berlin", value: "BE" },
    { label: "Hamburg", value: "HH" },
];

// Mock File Picker Functionality
const mockSelectFile = (name: string, isMultiple: boolean = false) => {
    // Returns a mock RNFile object or array
    const file = { uri: `file://mock/${name}.pdf`, name: `${name}_file.pdf` };
    if (isMultiple) {
        return [{ uri: `file://mock/${name}_1.jpg`, name: `${name}_1.jpg` }, { uri: `file://mock/${name}_2.jpg`, name: `${name}_2.jpg` }];
    }
    return file;
};

// --- Main Component ---
export function ProviderRegistrationFlow() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const progress = (step / 5) * 100;

  // --- Validation Logic (Adapted) ---

  const passwordStrength = () => {
    // ... (logic remains the same)
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 33;
    if (/[A-Z]/.test(password)) strength += 33;
    if (/[0-9]/.test(password)) strength += 34;
    return strength;
  };

  const canProceedStep1 = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.includes("@") &&
      formData.phone.trim() !== "" &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms &&
      formData.acceptPrivacy
    );
  };

  const canProceedStep2 = () => {
    return (
      formData.businessTypes.length > 0 &&
      formData.postalCode.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== ""
    );
  };

  const canProceedStep3 = () => {
    return formData.serviceCategories.length > 0 && formData.languages.length > 0;
  };

  const canProceedStep4 = () => {
    // Check against RNFile objects (which are never null if a file is selected)
    return (
      formData.idDocument !== null &&
      formData.profilePicture !== null &&
      formData.portfolioImages.length >= 3
    );
  };
  
  // --- File Handling (Mocked for RN) ---

  const handleFileUpload = (field: keyof FormData, fileType: string, isMultiple: boolean = false) => {
      const result = mockSelectFile(fileType, isMultiple) as RNFile | RNFile[];

      if (isMultiple) {
        // Handle multiple files for portfolio
        const files = result as RNFile[];
        const newImages = [...formData.portfolioImages, ...files];
        setFormData({ ...formData, [field]: newImages } as FormData);
        Alert.alert("Erfolg", `${files.length} Bilder ausgewählt`);
      } else {
          // Handle single file upload
          const file = result as RNFile;
          setFormData({ ...formData, [field]: file } as FormData);
          Alert.alert("Erfolg", `${file.name} hochgeladen`);
      }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        // Include password for account creation
        password: formData.password,
        profile: {
          businessName: formData.businessName || null,
          businessType: formData.businessTypes[0] || null,
          yearsOfExperience: formData.yearsExperience,
          isMobileService: formData.businessTypes.includes('Mobil'),
          serviceRadiusKm: formData.serviceRadius,
        },
        contact: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        address: {
          street: formData.street,
          houseNumber: formData.houseNumber,
          postalCode: formData.postalCode,
          city: formData.city,
          state: formData.state,
          showOnMap: formData.showOnMap,
        },
        services: formData.serviceCategories,
        languages: formData.languages,
        specializations: formData.specializations,
      };
      await http.post('/providers', payload);
      navigation.navigate('ProviderPendingApproval');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Einreichen fehlgeschlagen';
      Alert.alert('Fehler', String(msg));
    }
  };

  // --- Step Navigation Logic ---
  const handleNext = () => {
    let canProceed = false;
    if (step === 1) canProceed = canProceedStep1();
    else if (step === 2) canProceed = canProceedStep2();
    else if (step === 3) canProceed = canProceedStep3();
    else if (step === 4) canProceed = canProceedStep4();

    if (canProceed) {
      if (step < 5) {
        setStep((step + 1) as Step);
        // Scroll to top replacement
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      } else {
        handleSubmit();
      }
    } else {
      Alert.alert("Fehler", "Bitte fülle alle Pflichtfelder aus");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    } else {
      navigation.goBack();
    }
  };
  
  const scrollViewRef = React.useRef<ScrollView | null>(null);

  // --- Render Functions for Each Step ---

  const Step1 = () => (
      <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Persönliche Angaben</Text>
          <Text style={styles.stepSubtitle}>Grundlegende Informationen für dein Konto</Text>

          {/* Name Inputs */}
          <View style={styles.grid2}>
              <View style={styles.formGroup}>
                  <Text style={styles.label}>Vorname *</Text>
                  <Input value={formData.firstName} onChangeText={(v: string) => setFormData({ ...formData, firstName: v })} />
              </View>
              <View style={styles.formGroup}>
                  <Text style={styles.label}>Nachname *</Text>
                  <Input value={formData.lastName} onChangeText={(v: string) => setFormData({ ...formData, lastName: v })} />
              </View>
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
              <Text style={styles.label}>E-Mail *</Text>
              <Input
                  keyboardType="email-address"
                  placeholder="max.mueller@email.com"
                  value={formData.email}
                  onChangeText={(v: string) => setFormData({ ...formData, email: v })}
              />
              <Text style={styles.hintText}>Wird zur Anmeldung verwendet</Text>
          </View>

          {/* Phone */}
          <View style={styles.formGroup}>
              <Text style={styles.label}>Telefonnummer *</Text>
              <View style={styles.phoneInputRow}>
                  <Input value="+49" style={styles.countryCodeInput} editable={false} />
                  <Input
                      keyboardType="phone-pad"
                      placeholder="151 1234 5678"
                      value={formData.phone}
                      onChangeText={(v: string) => setFormData({ ...formData, phone: v })}
                      style={styles.phoneInput}
                  />
              </View>
          </View>

          {/* Password */}
          <View style={styles.formGroup}>
              <Text style={styles.label}>Passwort *</Text>
              <Input secureTextEntry value={formData.password} onChangeText={(v: string) => setFormData({ ...formData, password: v })} />
              {formData.password.length > 0 && (
                  <>
                      <Progress value={passwordStrength()} style={styles.progress} />
                      <View style={styles.passwordRules}>
                          <Text style={formData.password.length >= 8 ? styles.ruleValid : styles.ruleInvalid}>
                              ✓ Min. 8 Zeichen
                          </Text>
                          <Text style={/[A-Z]/.test(formData.password) ? styles.ruleValid : styles.ruleInvalid}>
                              ✓ 1 Großbuchstabe
                          </Text>
                          <Text style={/[0-9]/.test(formData.password) ? styles.ruleValid : styles.ruleInvalid}>
                              ✓ 1 Zahl
                          </Text>
                      </View>
                  </>
              )}
          </View>

          {/* Confirm Password */}
          <View style={styles.formGroup}>
              <Text style={styles.label}>Passwort wiederholen *</Text>
              <Input secureTextEntry value={formData.confirmPassword} onChangeText={(v: string) => setFormData({ ...formData, confirmPassword: v })} />
              {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <Text style={styles.errorText}>Passwörter stimmen nicht überein</Text>
              )}
          </View>

          {/* Terms Checkboxes */}
          <View style={styles.checkboxGroup}>
              <View style={styles.checkboxRow}>
                  <Checkbox
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, acceptTerms: checked })}
                  />
                  <Text style={styles.checkboxLabel}>
                      Ich akzeptiere die{" "}
                      <Text style={styles.linkText} onPress={() => Alert.alert("AGB", "AGB für Anbieter")}>
                          AGB für Anbieter
                      </Text>{" "}
                      *
                  </Text>
              </View>
              <View style={styles.checkboxRow}>
                  <Checkbox
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, acceptPrivacy: checked })}
                  />
                  <Text style={styles.checkboxLabel}>
                      Ich akzeptiere die{" "}
                      <Text style={styles.linkText} onPress={() => Alert.alert("Datenschutz", "Datenschutzerklärung")}>
                          Datenschutzerklärung
                      </Text>{" "}
                      *
                  </Text>
              </View>
              <View style={styles.checkboxRow}>
                  <Checkbox
                      checked={formData.marketingEmails}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, marketingEmails: checked })}
                  />
                  <Text style={styles.checkboxLabel}>
                      Ich möchte Marketing-E-Mails erhalten (optional)
                  </Text>
              </View>
          </View>
      </View>
  );

  const Step2 = () => (
      <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Über dein Business</Text>
          <Text style={styles.stepSubtitle}>Geschäftsinformationen</Text>

          <View style={styles.formGroup}>
              <Text style={styles.label}>Business-Name (optional)</Text>
              <Input
                  placeholder="z.B. 'Marias Braiding Studio'"
                  value={formData.businessName}
                  onChangeText={(v: string) => setFormData({ ...formData, businessName: v })}
              />
          </View>

          <View style={styles.formGroup}>
              <Text style={styles.label}>Business-Typ *</Text>
              <View style={styles.checkboxGroup}>
                  {["Freelancer", "Salon", "Barber", "Mobil"].map((type) => (
                      <View key={type} style={styles.checkboxRow}>
                          <Checkbox
                              checked={formData.businessTypes.includes(type)}
                              onCheckedChange={(checked: boolean) => {
                                  setFormData({
                                      ...formData,
                                      businessTypes: checked
                                          ? [...formData.businessTypes, type]
                                          : formData.businessTypes.filter((t) => t !== type),
                                  });
                              }}
                          />
                          <Text style={styles.checkboxLabel}>
                              {type === "Freelancer" && "Einzelperson / Freelancer"}
                              {type === "Salon" && "Salon / Barbershop"}
                              {type === "Barber" && "Barber"}
                              {type === "Mobil" && "Mobiler Service"}
                          </Text>
                      </View>
                  ))}
              </View>
          </View>

          {!formData.businessTypes.includes("Mobil") && (
              <View>
                  <Text style={styles.cardSectionTitle}>Geschäftsadresse</Text>
                  <View style={styles.formGroup}>
                      <View style={styles.grid3}>
                          <View style={styles.gridCol2}>
                              <Text style={styles.label}>Straße</Text>
                              <Input value={formData.street} onChangeText={(v: string) => setFormData({ ...formData, street: v })} />
                          </View>
                          <View style={styles.gridCol1}>
                              <Text style={styles.label}>Nr.</Text>
                              <Input value={formData.houseNumber} onChangeText={(v: string) => setFormData({ ...formData, houseNumber: v })} />
                          </View>
                      </View>

                      <View style={styles.grid3}>
                          <View style={styles.gridCol1}>
                              <Text style={styles.label}>PLZ *</Text>
                              <Input keyboardType="numeric" value={formData.postalCode} onChangeText={(v: string) => setFormData({ ...formData, postalCode: v })} />
                          </View>
                          <View style={styles.gridCol2}>
                              <Text style={styles.label}>Stadt *</Text>
                              <Input value={formData.city} onChangeText={(v: string) => setFormData({ ...formData, city: v })} />
                          </View>
                      </View>

                      <View style={styles.formGroup}>
                          <Text style={styles.label}>Bundesland *</Text>
                          <Picker
                              selectedValue={formData.state}
                              onValueChange={(v: string) => setFormData({ ...formData, state: v })}
                              items={GERMAN_STATES}
                          />
                      </View>

                      <View style={styles.checkboxRow}>
                          <Checkbox
                              checked={formData.showOnMap}
                              onCheckedChange={(checked: boolean) => setFormData({ ...formData, showOnMap: checked })}
                          />
                          <Text style={styles.checkboxLabel}>Meine Adresse auf Google Maps anzeigen</Text>
                      </View>
                  </View>
              </View>
          )}

          {formData.businessTypes.includes("Mobil") && (
              <View style={styles.formGroup}>
                  <Text style={styles.label}>Service-Radius (km)</Text>
                  <View style={styles.sliderContainer}>
                          <Slider
                              value={formData.serviceRadius}
                              onValueChange={(v: number) => setFormData({ ...formData, serviceRadius: v })}
                              max={50}
                              step={5}
                          />
                      <Text style={styles.hintText}>Ich biete Service im Umkreis von {formData.serviceRadius} km an</Text>
                  </View>
              </View>
          )}
      </View>
  );

  const Step3 = () => (
      <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Deine Dienstleistungen</Text>
          <Text style={styles.stepSubtitle}>Wähle deine Spezialisierungen</Text>

          <View style={styles.formGroup}>
              <Text style={styles.label}>Service-Kategorien *</Text>
              <View style={styles.checkboxGroup}>
                  {[
                      "Box Braids", "Knotless Braids", "Cornrows", "Senegalese Twists",
                      "Passion Twists", "Locs", "Barber Services", "Natural Hair Care",
                  ].map((service) => (
                      <View key={service} style={styles.checkboxRow}>
                          <Checkbox
                              checked={formData.serviceCategories.includes(service)}
                              onCheckedChange={(checked: boolean) => {
                                  setFormData({
                                      ...formData,
                                      serviceCategories: checked
                                          ? [...formData.serviceCategories, service]
                                          : formData.serviceCategories.filter((s) => s !== service),
                                  });
                              }}
                          />
                          <Text style={styles.checkboxLabel}>{service}</Text>
                      </View>
                  ))}
              </View>
          </View>

          <View style={styles.formGroup}>
              <Text style={styles.label}>Jahre Erfahrung</Text>
              <View style={styles.sliderContainer}>
                  <Slider
                      value={formData.yearsExperience}
                      onValueChange={(v: number) => setFormData({ ...formData, yearsExperience: v })}
                      max={30}
                      step={1}
                  />
                  <Text style={styles.hintText}>{formData.yearsExperience} Jahre</Text>
              </View>
          </View>

          <View style={styles.formGroup}>
              <Text style={styles.label}>Sprachen *</Text>
              <View style={styles.checkboxGroup}>
                  {["Deutsch", "Englisch", "Französisch", "Spanisch", "Türkisch", "Arabisch"].map((lang) => (
                      <View key={lang} style={styles.checkboxRow}>
                          <Checkbox
                              checked={formData.languages.includes(lang)}
                              onCheckedChange={(checked: boolean) => {
                                  setFormData({
                                      ...formData,
                                      languages: checked
                                          ? [...formData.languages, lang]
                                          : formData.languages.filter((l) => l !== lang),
                                  });
                              }}
                          />
                          <Text style={styles.checkboxLabel}>{lang}</Text>
                      </View>
                  ))}
              </View>
          </View>

          <View style={styles.formGroup}>
              <Text style={styles.label}>Spezialisierungen (optional)</Text>
              <View style={styles.checkboxGroup}>
                  {[
                      "Kinderfreundlich", "Lange Haare Spezialist", "Hochzeitsstyling",
                      "Natürliche Produkte", "Männer-Styling",
                  ].map((spec) => (
                      <View key={spec} style={styles.checkboxRow}>
                          <Checkbox
                              checked={formData.specializations.includes(spec)}
                              onCheckedChange={(checked: boolean) => {
                                  setFormData({
                                      ...formData,
                                      specializations: checked
                                          ? [...formData.specializations, spec]
                                          : formData.specializations.filter((s) => s !== spec),
                                  });
                              }}
                          />
                          <Text style={styles.checkboxLabel}>{spec}</Text>
                      </View>
                  ))}
              </View>
          </View>
      </View>
  );

  const Step4 = () => (
      <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Verifizierung</Text>
          <Text style={styles.stepSubtitle}>
              Um die Sicherheit für alle zu gewährleisten, bitten wir um folgende Dokumente
          </Text>

          <Card style={styles.infoCard}>
              <Text style={styles.infoText}>
                  🔒 Deine Daten werden vertraulich behandelt und sicher verschlüsselt
              </Text>
          </Card>

          {/* Identity Proof */}
          <View style={styles.formGroup}>
              <Text style={styles.label}>Identitätsnachweis *</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={() => handleFileUpload("idDocument", "ID", false)}>
                  <Icon name="upload" size={32} color={colors.gray500} />
                  <Text style={styles.uploadText}>Personalausweis oder Reisepass</Text>
                  <Button title="Datei auswählen" variant="ghost" />
                  {formData.idDocument && (
                      <Text style={styles.uploadedText}>✓ {formData.idDocument.name}</Text>
                  )}
              </TouchableOpacity>
          </View>

          {/* Profile Picture */}
          <View style={styles.formGroup}>
              <Text style={styles.label}>Profilbild *</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={() => handleFileUpload("profilePicture", "Profile", false)}>
                  <Icon name="camera" size={32} color={colors.gray500} />
                  <Text style={styles.uploadText}>Dein öffentliches Profilbild</Text>
                  <Button title="Foto hochladen" variant="ghost" />
                  {formData.profilePicture && (
                      <Text style={styles.uploadedText}>✓ {formData.profilePicture.name}</Text>
                  )}
              </TouchableOpacity>
          </View>

          {/* Portfolio Images */}
          <View style={styles.formGroup}>
              <Text style={styles.label}>Portfolio (min. 3 Bilder) *</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={() => handleFileUpload("portfolioImages", "Portfolio", true)}>
                  <Icon name="image" size={32} color={colors.gray500} />
                  <Text style={styles.uploadText}>Zeige deine besten Arbeiten</Text>
                  <Button title="Fotos hinzufügen" variant="ghost" />
                  {formData.portfolioImages.length > 0 && (
                      <Text style={styles.uploadedText}>
                          ✓ {formData.portfolioImages.length} Bilder ausgewählt
                      </Text>
                  )}
              </TouchableOpacity>
          </View>
      </View>
  );
  
  const Step5 = () => (
      <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Zusammenfassung</Text>
          <Text style={styles.stepSubtitle}>
              Bitte überprüfe deine Angaben bevor du dein Profil einreichst
          </Text>

          {/* Personal Info Summary */}
          <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                  <Text style={styles.summarySectionTitle}>Persönliche Informationen</Text>
                  <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
              </View>
              <View style={styles.summaryDetails}>
                  <Text style={styles.summaryText}>{formData.firstName} {formData.lastName}</Text>
                  <Text style={styles.summaryText}>{formData.email}</Text>
                  <Text style={styles.summaryText}>+49 {formData.phone}</Text>
              </View>
          </Card>

          {/* Business Info Summary */}
          <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                  <Text style={styles.summarySectionTitle}>Geschäftsinformationen</Text>
                  <TouchableOpacity onPress={() => setStep(2)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
              </View>
              <View style={styles.summaryDetails}>
                  {formData.businessName && <Text style={styles.summaryText}>{formData.businessName}</Text>}
                  <Text style={styles.summaryText}>{formData.businessTypes.join(", ")}</Text>
                  {formData.city && (
                      <Text style={styles.summaryText}>
                          {formData.postalCode} {formData.city}
                      </Text>
                  )}
              </View>
          </Card>

          {/* Services Summary */}
          <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                  <Text style={styles.summarySectionTitle}>Services & Expertise</Text>
                  <TouchableOpacity onPress={() => setStep(3)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
              </View>
              <View style={styles.summaryDetails}>
                  <Text style={styles.summaryText}>{formData.serviceCategories.join(", ")}</Text>
                  <Text style={styles.summaryText}>{formData.yearsExperience} Jahre Erfahrung</Text>
                  <Text style={styles.summaryText}>Sprachen: {formData.languages.join(", ")}</Text>
              </View>
          </Card>

          {/* Verification Summary */}
          <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                  <Text style={styles.summarySectionTitle}>Verifizierung</Text>
                  <TouchableOpacity onPress={() => setStep(4)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
              </View>
              <View style={styles.summaryDetails}>
                  <View style={styles.checkRow}>
                      <Icon name="check" size={16} color={colors.success} />
                      <Text style={styles.summaryText}>Identitätsnachweis hochgeladen</Text>
                  </View>
                  <View style={styles.checkRow}>
                      <Icon name="check" size={16} color={colors.success} />
                      <Text style={styles.summaryText}>Profilbild hochgeladen</Text>
                  </View>
                  <View style={styles.checkRow}>
                      <Icon name="check" size={16} color={colors.success} />
                      <Text style={styles.summaryText}>Portfolio ({formData.portfolioImages.length} Bilder)</Text>
                  </View>
              </View>
          </Card>

          {/* Next Steps Card */}
          <Card style={styles.nextStepsCard}>
              <Text style={styles.summarySectionTitle}>Was passiert jetzt?</Text>
              <View style={styles.nextStepsList}>
                  {[
                      { text: "Profil eingereicht", done: true },
                      { text: "Überprüfung (1-3 Werktage)", done: false },
                      { text: "Freischaltung", done: false },
                      { text: "Start!", done: false },
                  ].map((item, index) => (
                      <View key={index} style={styles.checkRow}>
                          <View style={item.done ? styles.checkIconBackground : styles.checkIconBorder}>
                              {item.done && <Icon name="check" size={12} color={colors.white} />}
                          </View>
                          <Text style={item.done ? styles.summaryText : styles.summaryTextSecondary}>{item.text}</Text>
                      </View>
                  ))}
              </View>
              <Text style={styles.hintText}>
                  Du erhältst eine E-Mail sobald dein Profil genehmigt wurde
              </Text>
          </Card>

          {/* Final Confirmation Checkbox */}
          <View style={styles.checkboxRow}>
              <Checkbox checked={formData.acceptTerms} onCheckedChange={(checked: boolean) => { /* confirmation only, no state change */ }} /> {/* Mocking required checkbox */}
              <Text style={styles.checkboxLabel}>
                  Ich bestätige, dass alle Angaben korrekt sind
              </Text>
          </View>
      </View>
  );

  // --- Render Logic ---
  const currentStepComponent = () => {
    switch (step) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      case 5: return <Step5 />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton name="arrow-left" onPress={handleBack} disabled={step === 1} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Anbieter-Registrierung</Text>
            <Text style={styles.headerSubtitle}>Schritt {step} von 5</Text>
          </View>
        </View>
        <Progress value={progress} style={styles.progressBar} />
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
        {currentStepComponent()}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Button
          title={step < 5 ? `Weiter zu Schritt ${step + 1}` : "Profil zur Prüfung einreichen"}
          onPress={handleNext}
          style={styles.nextButton}
          disabled={!((step === 1 && canProceedStep1()) || (step === 2 && canProceedStep2()) || (step === 3 && canProceedStep3()) || (step === 4 && canProceedStep4()) || step === 5)}
        />
        {step > 1 && (
          <Button title="Zurück" variant="ghost" onPress={handleBack} style={styles.backButton} />
        )}
      </View>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  // --- Header Styles ---
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
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
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: typography.small.fontSize,
    color: colors.gray500,
  },
  progressBar: {
    height: 8,
  },
  // --- Scroll Content & Steps ---
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 4, // Extra space for the fixed bottom bar
  },
  stepContainer: {
    gap: spacing.lg,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.small.fontSize,
    color: colors.gray500,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  // --- Form & Input Styles ---
  formGroup: {
    gap: spacing.xs,
  },
  grid2: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  grid3: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  gridCol2: { flex: 2, gap: spacing.xs },
  gridCol1: { flex: 1, gap: spacing.xs },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  hintText: {
    fontSize: typography.small.fontSize,
    color: colors.gray500,
    marginTop: spacing.xs / 2,
  },
  errorText: {
    fontSize: typography.small.fontSize,
    color: colors.error,
    marginTop: spacing.xs / 2,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  countryCodeInput: {
    width: 60,
  },
  phoneInput: {
    flex: 1,
  },
  // --- Password Strength ---
  progress: {
    marginTop: spacing.xs,
    height: 4,
  },
  passwordRules: {
    marginTop: spacing.xs,
    gap: spacing.xs / 2,
  },
  ruleValid: {
    fontSize: typography.small.fontSize,
    color: colors.success,
  },
  ruleInvalid: {
    fontSize: typography.small.fontSize,
    color: colors.gray500,
  },
  // --- Checkbox Styles ---
  checkboxGroup: {
    gap: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  checkboxLabel: {
    fontSize: typography.body.fontSize,
    lineHeight: 20,
    flexShrink: 1,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  // --- Slider Styles ---
  sliderContainer: {
    marginTop: spacing.xs,
  },
  // --- Upload Styles ---
  infoCard: {
    padding: spacing.md,
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
  },
  infoText: {
    fontSize: typography.body.fontSize,
    color: '#1E40AF',
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  uploadText: {
    fontSize: typography.body.fontSize,
    color: colors.gray500,
  },
  uploadedText: {
    fontSize: typography.small.fontSize,
    color: colors.success,
    marginTop: spacing.xs,
  },
  // --- Summary Styles ---
  summaryCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
  },
  summaryDetails: {
    gap: spacing.xs / 2,
  },
  summaryText: {
    fontSize: typography.body.fontSize,
    color: colors.gray500,
  },
  summaryTextSecondary: {
      fontSize: typography.body.fontSize,
      color: '#6B7280AA',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkIconBackground: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconBorder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray300,
  },
  nextStepsCard: {
    padding: spacing.md,
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
  },
  nextStepsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  // --- Bottom Fixed Bar ---
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: spacing.md,
    zIndex: 20,
  },
  nextButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary,
  },
  backButton: {
    width: '100%',
    marginTop: spacing.xs,
  },
});
