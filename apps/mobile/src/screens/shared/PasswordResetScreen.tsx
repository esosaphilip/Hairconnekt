import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from '../../components/Icon';

// Custom Components (assumed to be available)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Input from '../../components/Input'; // Custom Input component (wraps TextInput)
import { spacing } from '../../theme/tokens';
import { http } from '@/api/http'; // Use shared axios instance

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const SUCCESS_COLOR = '#10B981'; // text-green-600
const ERROR_COLOR = '#EF4444'; // text-red-500
const GRAY_TEXT = '#6B7280'; // text-gray-600

type Step = 'request' | 'verify' | 'reset' | 'success';

// Mock component to simulate web's Progress bar (will use a simple View/style for RN)
const ProgressBar = ({ value }: { value: number }) => {
  const barColor = value === 100 ? SUCCESS_COLOR : value >= 50 ? '#FBBF24' : ERROR_COLOR;

  return (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBar,
          { width: `${value}%`, backgroundColor: barColor },
        ]}
      />
    </View>
  );
};

export function PasswordResetScreen() {
  const navigation = useNavigation();
  const route = useRoute(); // For deep link token via route params
  const [step, setStep] = useState<Step>('request');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  // Array of refs for each OTP input
  const otpRefs = useRef<(React.ElementRef<typeof Input> | null)[]>([]);

  // --- Utility Functions ---

  const showToast = (message: string, isError = false) => {
    // Replace web toast with native alert
    Alert.alert(isError ? 'Fehler' : 'Erfolg', message);
  };

  const handleBackToLogin = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Login'); // Assuming 'Login' is the screen name
  }, [navigation]);

  const passwordStrength = useCallback(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;
    return strength;
  }, [newPassword]);

  const passwordRequirements = [
    { label: 'Min. 8 Zeichen', met: newPassword.length >= 8 },
    { label: '1 Großbuchstabe', met: /[A-Z]/.test(newPassword) },
    { label: '1 Zahl', met: /[0-9]/.test(newPassword) },
  ];

  // --- Effects ---

  // 1. Timer for OTP resend
  useEffect(() => {
    if (step === 'verify' && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // 2. Deep link support (token passed as route params, e.g., from an email link)
  useEffect(() => {
    // @ts-ignore
    const token = route.params?.token;
    if (token && typeof token === 'string' && token.length >= 6) {
      const digits = token.slice(0, 6).split('');
      setOtp(digits);
      setStep('reset');
      // Optionally clear the token from params to avoid re-triggering
      // @ts-ignore
      navigation.setParams({ token: undefined });
    }
  }, [route.params, navigation]);

  // --- Handlers ---

  const handleSendCode = async () => {
    if (!emailOrPhone) {
      showToast('Bitte E-Mail oder Telefonnummer eingeben.', true);
      return;
    }
    setSending(true);
    try {
    await http.post(`/auth/forgot-password`, { emailOrPhone });
      showToast('Code gesendet');
      setOtp(['', '', '', '', '', '']);
      setTimer(59);
      setCanResend(false);
      setStep('verify');
    } catch (err) {
      const message = (err as Error)?.message || 'Versand fehlgeschlagen';
      showToast(message, true);
    } finally {
      setSending(false);
    }
  };

  // Centralized OTP change logic for mobile
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input on digit entry
    if (value && index < 5) {
      // @ts-ignore - Focus on the underlying TextInput component
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    // Check if current input caused the last digit to fill
    const allFilled = newOtp.every((digit) => digit);
    if (allFilled) {
      setTimeout(() => setStep('reset'), 500);
    }
  };

  const handleOtpKeyDown = (index: number, e: any) => {
    // Native key events are tricky. We simplify Backspace handling.
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // @ts-ignore
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    setSending(true);
    try {
    await http.post(`/auth/forgot-password`, { emailOrPhone });
      showToast('Code erneut gesendet');
      setTimer(59);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      const message = (err as Error)?.message || 'Erneutes Senden fehlgeschlagen';
      showToast(message, true);
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('Passwörter stimmen nicht überein', true);
      return;
    }
    const token = otp.join('');
    if (!token || token.length < 6) {
      showToast('Bitte gültigen Code eingeben', true);
      return;
    }
    if (passwordStrength() < 75) {
        showToast('Bitte wähle ein sichereres Passwort.', true);
        return;
    }

    setResetting(true);
    try {
    await http.post(`/auth/reset-password`, { token, newPassword });
      showToast('Passwort erfolgreich geändert');
      setStep('success');
    } catch (err) {
      const message = (err as Error)?.message || 'Zurücksetzen fehlgeschlagen';
      showToast(message, true);
    } finally {
      setResetting(false);
    }
  };

  // --- Render ---

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back Button (except on success) */}
        {step !== 'success' && (
          <Pressable
            onPress={handleBackToLogin}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Icon name="arrow-left" size={20} color={GRAY_TEXT} />
            <Text style={styles.backButtonText}>Zurück</Text>
          </Pressable>
        )}

        {/* Logo & Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>HairConnekt</Text>
          <Text style={styles.mainTitle}>Passwort zurücksetzen</Text>
          {step === 'request' && (
            <Text style={styles.subtitle}>
              Gib deine E-Mail oder Telefonnummer ein um einen Code zu erhalten
            </Text>
          )}
          {step === 'verify' && (
            <Text style={styles.subtitle}>
              Wir haben einen 6-stelligen Code an <Text style={{ fontWeight: '600' }}>{emailOrPhone}</Text> gesendet
            </Text>
          )}
          {step === 'reset' && (
            <Text style={styles.subtitle}>Wähle ein neues sicheres Passwort</Text>
          )}
        </View>

        {/* Step 1: Request Code */}
        {step === 'request' && (
          <View style={styles.formContainer}>
            <View style={styles.formField}>
              <Text style={styles.label}>E-Mail oder Telefonnummer</Text>
              <Input
                id="emailOrPhone"
                keyboardType="email-address" // Use appropriate keyboard type
                placeholder="max.mueller@email.com"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                style={styles.inputStyle}
                required
              />
            </View>
            <Button
              title={sending ? 'Wird gesendet...' : 'Code senden'}
              style={styles.primaryButton}
              onPress={handleSendCode}
              disabled={sending}
            />
          </View>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'verify' && (
          <View style={styles.formContainer}>
            <View>
              <Text style={[styles.label, styles.labelCenter]}>6-stelligen Code eingeben</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={(e) => handleOtpKeyDown(index, e)}
                    style={styles.otpInput}
                    autoFocus={index === 0}
                    returnKeyType={index === 5 ? 'done' : 'next'}
                  />
                ))}
              </View>
            </View>

            <View style={styles.resendContainer}>
              {canResend ? (
                <Button
                  title={sending ? 'Wird gesendet...' : 'Code nicht erhalten? Erneut senden'}
                  variant="ghost"
                  onPress={handleResendCode}
                  disabled={sending}
                  textStyle={sending ? { color: GRAY_TEXT } : { color: PRIMARY_COLOR }}
                />
              ) : (
                <Text style={styles.resendTimerText}>
                  Erneut senden in{' '}
                  <Text style={{ color: PRIMARY_COLOR, fontWeight: '600' }}>
                    0:{timer.toString().padStart(2, '0')}
                  </Text>
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <View style={styles.formContainer}>
            <View style={styles.formField}>
              <Text style={styles.label}>Neues Passwort</Text>
              <Input
                id="newPassword"
                secureTextEntry={true}
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.inputStyle}
                required
              />
              {newPassword ? (
                <View style={styles.passwordIndicators}>
                  <ProgressBar value={passwordStrength()} />
                  <View style={styles.passwordRequirements}>
                    {passwordRequirements.map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: req.met ? SUCCESS_COLOR : '#D1D5DB' }, // bg-green-500 : bg-gray-300
                          ]}
                        />
                        <Text
                          style={{ color: req.met ? SUCCESS_COLOR : '#9CA3AF', fontSize: 12 }} // text-green-600 : text-gray-400
                        >
                          {req.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Passwort bestätigen</Text>
              <Input
                id="confirmPassword"
                secureTextEntry={true}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.inputStyle}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <Text style={styles.passwordErrorText}>
                  Passwörter stimmen nicht überein
                </Text>
              )}
            </View>

            <Button
              title={resetting ? 'Wird geändert...' : 'Passwort ändern'}
              style={styles.primaryButton}
              onPress={handleResetPassword}
              disabled={
                resetting ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                passwordStrength() < 75
              }
            />
          </View>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <View style={styles.successContainer}>
            <View style={styles.successIconWrapper}>
              <View style={styles.successIcon}>
                <Icon name="check-circle" size={48} color={SUCCESS_COLOR} />
              </View>
            </View>

            <View style={styles.successTextContainer}>
              <Text style={styles.mainTitle}>Passwort erfolgreich geändert!</Text>
              <Text style={styles.subtitle}>
                Du kannst dich jetzt mit deinem neuen Passwort anmelden
              </Text>
            </View>

            <Button
              title="Zur Anmeldung"
              onPress={handleBackToLogin}
              style={styles.primaryButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for RN ---
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  // Back Button
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: GRAY_TEXT,
    fontSize: 16,
  },
  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl, // Center text for a mobile form look
  },
  appTitle: {
    color: PRIMARY_COLOR,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: GRAY_TEXT,
    fontSize: 14,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    gap: spacing.lg, // space-y-6
  },
  formField: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  labelCenter: {
    textAlign: 'center',
  },
  inputStyle: {
    height: 48,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    height: 48,
    marginTop: spacing.md,
    width: '100%',
  },

  // OTP
  otpContainer: {
    flexDirection: 'row',
    gap: spacing.xs, // gap-2
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  otpInput: {
    fontSize: 20,
    height: 56,
    textAlign: 'center',
    width: 48,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resendTimerText: {
    color: GRAY_TEXT,
    fontSize: 14,
  },

  // Password Reset
  passwordIndicators: {
    marginTop: spacing.xs,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB', // bg-gray-200
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  progressBar: {
    borderRadius: 2,
    height: 4,
  },
  passwordRequirements: {
    gap: spacing.xs / 2,
    marginTop: spacing.xs, // space-y-1
  },
  requirementItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  passwordErrorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginTop: spacing.xs,
  },

  // Success
  successContainer: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xxl, // space-y-6
  },
  successIconWrapper: {
    justifyContent: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#D1FAE5', // bg-green-100
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});