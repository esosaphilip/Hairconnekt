import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
// Note: In a real app, use a proper icon library like 'react-native-vector-icons'
import { Feather, Ionicons } from '@expo/vector-icons';
// Assuming custom, platform-agnostic UI components:
// import { Button } from '../components/Button';
// import { Checkbox } from '../components/Checkbox';
// import { Input } from '../components/Input';
// import { useAuth } from '../contexts/AuthContext';
// import { showToast } from '../utils/toast'; // RN-compatible toast utility

// --- Mock Implementations for Demonstration ---

// Dummy Checkbox component
type CheckboxProps = { checked: boolean; onValueChange: (next: boolean) => void; id?: string };
const Checkbox: React.FC<CheckboxProps> = ({ checked, onValueChange, id }) => (
  <TouchableOpacity
    style={[styles.checkbox, checked && styles.checkboxChecked]}
    onPress={() => onValueChange(!checked)}
  >
    {checked && <Feather name="check" size={14} color="#fff" />}
  </TouchableOpacity>
);

// Dummy Toast function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // In a real app, this would use a library like 'react-native-toast-message'
  console.log(`[TOAST - ${type.toUpperCase()}]: ${message}`);
};

// Dummy useAuth hook (matches the original web hook structure)
const useAuth = () => ({
    login: async (email: string, password: string) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'test@example.com' && password === 'password') {
                    resolve({});
                } else {
                    reject(new Error("Invalid credentials (mock)"));
                }
            }, 1000);
        });
    },
    loading: false,
});

// --- Interface for Navigation Props (replacing react-router-dom) ---

interface LoginScreenProps {
  /** Replaces useLocation/navigate for getting initial state */
  initialState?: {
    returnUrl?: string;
    userType?: 'client' | 'provider';
  };
  /** Replaces navigate('/register') */
  onRegisterPress: (userType: 'client' | 'provider', returnUrl: string) => void;
  /** Replaces navigate('/forgot-password') */
  onForgotPasswordPress: () => void;
  /** Replaces navigate('/home') or navigate('/provider/dashboard') */
  onLoginSuccess: (userType: 'client' | 'provider', returnUrl: string) => void;
}

// --- React Native Component ---

export function LoginScreen({
  initialState = {},
  onRegisterPress,
  onForgotPasswordPress,
  onLoginSuccess,
}: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Added state for checkbox
  
  const { login, loading } = useAuth();
  
  // Get return URL and user type from initial props/state
  const returnUrl = initialState.returnUrl || "/home";
  const userType = initialState.userType || "client";

  const handleLogin = async () => {
    // No need for e.preventDefault() in RN
    if (loading) return; // Prevent double submission
    
    try {
      await login(email, password);
      showToast("Erfolgreich angemeldet", 'success');

      // Replaced navigate() with onLoginSuccess() prop
      if (userType === "provider") {
        onLoginSuccess("provider", "/provider/dashboard"); // Assuming the prop handles dashboard route
      } else {
        onLoginSuccess("client", returnUrl);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Anmeldung fehlgeschlagen";
      showToast(message, 'error');
    }
  };

  return (
    // Use SafeAreaView to respect the notch/status bar area
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        {/* ScrollView is necessary for content that might exceed screen height */}
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Logo / Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.logoText}>HairConnekt</Text>
            <Text style={styles.welcomeTitle}>Willkommen zurück!</Text>
            <Text style={styles.welcomeSubtitle}>Melde dich an um fortzufahren</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            
            {/* Email Input */}
            <View>
              <Text style={styles.label}>E-Mail oder Telefonnummer</Text>
              <TextInput
                style={styles.input}
                placeholder="max.mueller@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Password Input */}
            <View>
              <Text style={styles.label}>Passwort</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link */}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={onForgotPasswordPress}>
                  <Text style={styles.forgotPasswordText}>
                    Passwort vergessen?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me Checkbox */}
            <View style={styles.checkboxWrapper}>
              <Checkbox
                id="remember"
                checked={rememberMe}
                onValueChange={setRememberMe}
              />
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                <Text style={styles.checkboxLabel}>
                  Angemeldet bleiben
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button (using TouchableOpacity as a simple RN button) */}
            <TouchableOpacity 
              onPress={handleLogin} 
              style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Anmelden</Text>
              )}
            </TouchableOpacity>

            {/* Separator "Oder anmelden mit" */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Oder anmelden mit</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialLoginContainer}>
              {/* Google Button */}
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => showToast("Google Login (mock)")}
              >
                <Image
                  source={{ uri: "https://www.google.com/favicon.ico" }}
                  style={styles.socialIcon}
                />
                <Text style={styles.outlineButtonText}>
                  Mit Google fortfahren
                </Text>
              </TouchableOpacity>
              
              {/* Apple Button */}
              <TouchableOpacity
                style={[styles.button, styles.blackButton]}
                onPress={() => showToast("Apple Login (mock)")}
              >
                <Ionicons name="logo-apple" size={24} color="#fff" style={styles.socialIcon} />
                <Text style={styles.blackButtonText}>
                  Mit Apple fortfahren
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Noch kein Konto?{' '}
              <Text style={styles.signupLink}
                onPress={() => onRegisterPress(userType, returnUrl)}>
                Jetzt registrieren
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- React Native StyleSheet ---

const PRIMARY_COLOR = '#8B4513'; // Saddle Brown
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24, // Equivalent to p-6
    paddingBottom: 24, // Ensure enough padding at the bottom
  },

  // Header/Logo
  headerContainer: {
    alignItems: 'center', // text-center
    marginTop: 48, // mt-12
    marginBottom: 32, // mb-8
  },
  logoText: {
    fontSize: 28, // Adjusted size
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 8, // mb-2
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8, // mb-2
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280', // text-gray-600
  },

  // Form
  formContainer: {
    flex: 1,
    gap: 16, // space-y-4
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    height: 48, // Adjusted height
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4, // mt-1
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    paddingRight: 40, // pr-10
    borderRadius: 8,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12, // right-3
    padding: 5, // clickable area
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end', // justify-end
    marginTop: 8, // mt-2
  },
  forgotPasswordText: {
    fontSize: 14, // text-sm
    color: PRIMARY_COLOR,
    textDecorationLine: 'underline',
  },

  // Checkbox
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // space-x-2
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  checkboxLabel: {
    fontSize: 14, // text-sm
    color: '#6b7280', // text-gray-600
  },
  
  // Buttons
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48, // h-12
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Separator
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24, // my-6
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb', // border-gray-200
  },
  separatorText: {
    paddingHorizontal: 16, // px-4
    fontSize: 14, // text-sm
    color: '#6b7280', // text-gray-500
    backgroundColor: '#fff',
  },

  // Social Login
  socialLoginContainer: {
    gap: 12, // space-y-3
  },
  outlineButton: {
    backgroundColor: 'white',
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  blackButton: {
    backgroundColor: 'black',
  },
  blackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  socialIcon: {
    width: 20, // w-5
    height: 20, // h-5
    marginRight: 8, // mr-2
  },

  // Sign Up Link
  signupContainer: {
    alignItems: 'center',
    paddingVertical: 16, // py-4
    marginTop: 'auto', // Push to the bottom
  },
  signupText: {
    fontSize: 16,
    color: '#6b7280', // text-gray-600
  },
  signupLink: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});