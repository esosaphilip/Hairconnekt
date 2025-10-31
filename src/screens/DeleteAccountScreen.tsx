// Note: React Native StyleSheet does not support certain web CSS props like `gap`.
// We cast the StyleSheet to `any` at the bottom to avoid TypeScript complaints while keeping runtime behavior.
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  SafeAreaView,
  Alert, // Use RN Alert API or a custom Modal/Dialog component
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  AlertTriangle,
  Trash2,
  Download,
  MessageCircle,
  Calendar,
  Heart,
  CreditCard,
  CheckCircle2,
} from "lucide-react-native";
import { showMessage } from "react-native-flash-message";

// Assuming these custom RN components exist
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input"; // Simple TextInput wrapper
import { Checkbox } from "../components/checkbox";
import { Separator } from "../components/separator"; // RN View with height/width

const DELETION_REASONS = [
  "Ich nutze die App nicht mehr",
  "Ich habe ein Duplikat-Account",
  "Ich habe Datenschutzbedenken",
  "Die App entspricht nicht meinen Erwartungen",
  "Ich habe schlechte Erfahrungen gemacht",
  "Zu viele Benachrichtigungen",
  "Anderer Grund",
];

// Custom Component for the Deletion Item (replacing the div structure)
const DeletionItem = ({ icon: Icon, title, subtitle }: { icon: React.ElementType, title: string, subtitle: string }) => (
  <View style={styles.deletionItem}>
    <View style={styles.deletionItemIconWrapper}>
      <Icon size={20} color="#EF4444" /> {/* red-600 */}
    </View>
    <View style={styles.deletionItemText}>
      <Text style={styles.deletionItemTitle}>{title}</Text>
      <Text style={styles.deletionItemSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

// Custom Component for Checkbox/Reason (replacing the label/checkbox/span structure)
const ReasonCheckbox = ({ reason, selected, onToggle }: { reason: string; selected: boolean; onToggle: () => void }) => (
  <TouchableOpacity
    style={styles.reasonOption}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <Checkbox checked={selected} onCheckedChange={onToggle} />
    <Text style={styles.reasonText}>{reason}</Text>
  </TouchableOpacity>
);

// --- Refactored Component ---

export function DeleteAccountScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<"warning" | "confirmation" | "completed">("warning");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataDownloaded, setDataDownloaded] = useState(false);

  const handleDownloadData = () => {
    showMessage({
      message: "Daten-Download",
      description: "Deine Daten werden vorbereitet. Du erhältst eine E-Mail mit dem Download-Link.",
      type: "success",
    });
    setDataDownloaded(true);
  };

  const toggleReason = useCallback((reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  }, []);

  const handleProceedToConfirmation = () => {
    if (selectedReasons.length === 0) {
      showMessage({
        message: "Fehler",
        description: "Bitte wähle mindestens einen Grund aus",
        type: "danger",
      });
      return;
    }
    setStep("confirmation");
  };

  const handleFinalDelete = async () => {
    setIsDeleting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Cleanup: In RN, this means clearing AsyncStorage/SecureStore
    // We navigate to the root route, often replacing the stack
    
    setIsDeleting(false);
    setStep("completed");

    // Optional: Auto-navigate after a brief delay
    setTimeout(() => {
        // Replace current stack with the home screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    }, 2000);
  };

  const handleDeleteAccount = () => {
    if (!password) {
      showMessage({
        message: "Fehler",
        description: "Bitte gib dein Passwort ein",
        type: "danger",
      });
      return;
    }

    if (confirmText.toLowerCase() !== "account löschen") {
      showMessage({
        message: "Fehler",
        description: 'Bitte gib "Account löschen" ein, um zu bestätigen',
        type: "danger",
      });
      return;
    }

    // Use the native Alert or a custom Modal/Dialog for final confirmation
    Alert.alert(
      "Bist du dir absolut sicher?",
      "Diese Aktion kann nicht rückgängig gemacht werden. Dein Account und alle zugehörigen Daten werden permanent von unseren Servern gelöscht.",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Ja, Account löschen",
          onPress: handleFinalDelete,
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  // --- Completed Step View ---
  if (step === "completed") {
    return (
      <SafeAreaView style={styles.safeAreaCompleted}>
        <View style={styles.completedContainer}>
          <Card style={styles.completedCard}>
            <View style={styles.completedIconWrapper}>
              <CheckCircle2 size={32} color="#10B981" /> {/* green-600 */}
            </View>
            <Text style={styles.completedTitle}>Account erfolgreich gelöscht</Text>
            <Text style={styles.completedText}>
              Dein Account und alle zugehörigen Daten wurden gelöscht. Es tut uns leid, dich gehen zu sehen.
            </Text>
            <Text style={styles.completedSmallText}>
              Du wirst in wenigen Sekunden zur Startseite weitergeleitet...
            </Text>
            <Button
              title="Zur Startseite"
              style={styles.completedButton}
              onPress={() => {
                // Clear any stored data in RN (e.g., AsyncStorage.clear())
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }], // Assuming 'Home' is your root screen
                });
              }}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  // --- Main Warning/Confirmation View ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account löschen</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.mainContent}>
          {step === "warning" && (
            <>
              {/* Warning Banner */}
              <Card style={styles.warningCard}>
                <View style={styles.warningContent}>
                  <AlertTriangle size={24} color="#DC2626" style={styles.warningIcon} />
                  <View style={styles.warningTextWrapper}>
                    <Text style={styles.warningTitle}>Achtung: Unwiderrufliche Aktion</Text>
                    <Text style={styles.warningText}>
                      Das Löschen deines Accounts kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
                    </Text>
                  </View>
                </View>
              </Card>

              {/* What will be deleted */}
              <Card style={styles.card}>
                <View style={styles.sectionHeader}>
                  <Trash2 size={20} color="#8B4513" />
                  <Text style={styles.sectionTitle}>Was wird gelöscht?</Text>
                </View>
                <View style={styles.deletionList}>
                  <DeletionItem
                    icon={MessageCircle}
                    title="Alle Nachrichten und Chats"
                    subtitle="Deine gesamte Kommunikationshistorie"
                  />
                  <Separator style={styles.separator} />
                  <DeletionItem
                    icon={Calendar}
                    title="Alle Termine und Buchungen"
                    subtitle="Buchungshistorie und geplante Termine"
                  />
                  <Separator style={styles.separator} />
                  <DeletionItem
                    icon={Heart}
                    title="Favoriten und Bewertungen"
                    subtitle="Gespeicherte Dienstleister und deine Rezensionen"
                  />
                  <Separator style={styles.separator} />
                  <DeletionItem
                    icon={CreditCard}
                    title="Zahlungsinformationen"
                    subtitle="Gespeicherte Zahlungsmethoden und Transaktionshistorie"
                  />
                </View>
              </Card>

              {/* Download Data First */}
              <Card style={styles.downloadCard}>
                <Text style={styles.downloadTitle}>Daten vor dem Löschen sichern</Text>
                <Text style={styles.downloadText}>
                  Gemäß DSGVO hast du das Recht, eine Kopie deiner Daten zu erhalten. Wir empfehlen, deine Daten vor dem Löschen herunterzuladen.
                </Text>
                <Button
                  variant="ghost"
                  style={styles.downloadButton}
                  textStyle={styles.downloadButtonText}
                  onPress={handleDownloadData}
                  title={dataDownloaded ? "Download angefordert ✓" : "Meine Daten herunterladen"}
                />
              </Card>

              {/* Alternative Options */}
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Alternativen erwägen?</Text>
                <View style={styles.alternativeOptions}>
                  <Button
                    variant="ghost"
                    style={styles.alternativeButton}
                    onPress={() => navigation.navigate("PrivacySettings")}
                    title="Datenschutzeinstellungen anpassen"
                  />
                  <Button
                    variant="ghost"
                    style={styles.alternativeButton}
                    onPress={() => navigation.navigate("NotificationSettings")}
                    title="Benachrichtigungen deaktivieren"
                  />
                  <Button
                    variant="ghost"
                    style={styles.alternativeButton}
                    onPress={() => navigation.navigate("Support")}
                    title="Support kontaktieren"
                  />
                </View>
              </Card>

              {/* Reasons for Deletion */}
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Warum möchtest du deinen Account löschen?</Text>
                <Text style={styles.reasonInfo}>
                  Dein Feedback hilft uns, HairConnekt zu verbessern. (Optional)
                </Text>
                <View style={styles.reasonsList}>
                  {DELETION_REASONS.map((reason) => (
                    <ReasonCheckbox
                      key={reason}
                      reason={reason}
                      selected={selectedReasons.includes(reason)}
                      onToggle={() => toggleReason(reason)}
                    />
                  ))}
                </View>
                {selectedReasons.includes("Anderer Grund") && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.label}>Weitere Details (optional)</Text>
                    <TextInput
                      value={feedback}
                      onChangeText={setFeedback}
                      placeholder="Erzähle uns mehr..."
                      multiline
                      numberOfLines={4}
                      style={styles.textArea}
                    />
                  </View>
                )}
              </Card>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button variant="ghost" onPress={() => navigation.goBack()} title="Abbrechen" />
                <Button
                  style={styles.proceedButton}
                  onPress={handleProceedToConfirmation}
                  title="Weiter zur Bestätigung"
                />
              </View>
            </>
          )}

          {step === "confirmation" && (
            <>
              {/* Final Warning */}
              <Card style={styles.warningCard}>
                <View style={styles.warningContent}>
                  <AlertTriangle size={24} color="#DC2626" style={styles.warningIcon} />
                  <View style={styles.warningTextWrapper}>
                    <Text style={styles.warningTitle}>Letzte Warnung</Text>
                    <Text style={styles.warningText}>
                      Dies ist deine letzte Chance. Nach diesem Schritt wird dein Account unwiderruflich gelöscht.
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Confirmation Form */}
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Bestätigung erforderlich</Text>
                <View style={styles.confirmationForm}>
                  <View>
                    <Text style={styles.label}>Passwort eingeben</Text>
                    <Input
                      placeholder="Dein Passwort"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                    <Text style={styles.smallInfoText}>
                      Zur Sicherheit musst du dein Passwort eingeben
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.label}>
                      Gib "Account löschen" ein, um zu bestätigen
                    </Text>
                    <Input
                      placeholder="Account löschen"
                      value={confirmText}
                      onChangeText={setConfirmText}
                    />
                  </View>
                </View>
              </Card>

              {/* Summary of Selected Reasons */}
              {selectedReasons.length > 0 && (
                <Card style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Deine Gründe:</Text>
                  <View style={styles.summaryList}>
                    {selectedReasons.map((reason) => (
                      <Text key={reason} style={styles.summaryListItem}>
                        • {reason}
                      </Text>
                    ))}
                  </View>
                  {feedback.length > 0 && (
                    <Text style={styles.summaryFeedback}>"{feedback}"</Text>
                  )}
                </Card>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button variant="ghost" onPress={() => setStep("warning")} title="Zurück" />
                <Button
                  style={styles.finalDeleteButton}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                  loading={isDeleting}
                  title="Account endgültig löschen"
                  textStyle={styles.finalDeleteButtonText}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
  },
  safeAreaCompleted: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  spacer: {
    width: 24,
  },
  // --- Main Content ---
  mainContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16, // space-y-4 (not supported by RN StyleSheet; see note above)
  },
  card: {
    padding: 24, // p-6
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // not supported by RN StyleSheet
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  // --- Warning Card ---
  warningCard: {
    padding: 16, // p-4
    backgroundColor: '#FEF2F2', // red-50
    borderColor: '#FECACA', // red-200
    borderWidth: 1,
  },
  warningContent: {
    flexDirection: 'row',
    gap: 12, // not supported by RN StyleSheet
  },
  warningIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  warningTextWrapper: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B', // red-900
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#991B1B', // red-800
  },
  // --- Deletion List ---
  deletionList: {
    gap: 16, // not supported by RN StyleSheet
  },
  deletionItem: {
    flexDirection: 'row',
    gap: 12, // not supported by RN StyleSheet
    alignItems: 'center',
  },
  deletionItemIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF2F2', // red-50
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deletionItemText: {
    flex: 1,
  },
  deletionItemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  deletionItemSubtitle: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  // --- Download Card ---
  downloadCard: {
    padding: 16,
    backgroundColor: '#EFF6FF', // blue-50
    borderColor: '#DBEAFE', // blue-200
    borderWidth: 1,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF', // blue-900
    marginBottom: 8,
  },
  downloadText: {
    fontSize: 14,
    color: '#1D4ED8', // blue-800
    marginBottom: 12,
  },
  downloadButton: {
    backgroundColor: '#fff',
    borderColor: '#93C5FD', // blue-300
    borderWidth: 1,
  },
  downloadButtonText: {
    color: '#1F2937',
  },
  // --- Alternative Options ---
  alternativeOptions: {
    gap: 12, // space-y-3 (not supported by RN StyleSheet)
  },
  alternativeButton: {
    justifyContent: 'flex-start', // justify-start
  },
  // --- Reasons for Deletion ---
  reasonInfo: {
    fontSize: 14,
    color: '#555', // gray-600
    marginBottom: 16,
  },
  reasonsList: {
    gap: 12, // space-y-3 (not supported by RN StyleSheet)
    marginBottom: 16,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // not supported by RN StyleSheet
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  reasonText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  feedbackContainer: {
    marginTop: 16,
  },
  textArea: {
    minHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  // --- Action Buttons ---
  actionButtons: {
    gap: 12, // flex-col gap-3 (not supported by RN StyleSheet)
  },
  proceedButton: {
    backgroundColor: '#DC2626', // red-600
  },
  // --- Confirmation Step ---
  confirmationForm: {
    gap: 16, // space-y-4 (not supported by RN StyleSheet)
  },
  smallInfoText: {
    fontSize: 12,
    color: '#6B7280', // gray-500
    marginTop: 4,
  },
  // --- Summary Card ---
  summaryCard: {
    padding: 16,
    backgroundColor: '#F3F4F6', // gray-100
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  summaryList: {
    gap: 4, // not supported by RN StyleSheet
  },
  summaryListItem: {
    fontSize: 14,
    color: '#4B5563', // gray-700
  },
  summaryFeedback: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    marginTop: 8,
    fontStyle: 'italic',
  },
  finalDeleteButton: {
    backgroundColor: '#DC2626',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // --- Completed View ---
  completedContainer: {
    maxWidth: 400,
    width: '100%',
    padding: 16,
  },
  completedCard: {
    padding: 32, // p-8
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  completedIconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#D1FAE5', // green-100
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 14,
    color: '#555', // gray-600
    marginBottom: 16,
    textAlign: 'center',
  },
  completedSmallText: {
    fontSize: 12,
    color: '#6B7280', // gray-500
    marginBottom: 24,
    textAlign: 'center',
  },
  completedButton: {
    backgroundColor: '#8B4513',
    width: '100%',
  }
}) as any;