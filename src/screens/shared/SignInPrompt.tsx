import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// --- Constants ---
const THEME_COLOR = '#8B4513';
const SPACING = 24;
const CARD_RADIUS = 12;
const LIGHT_GRAY = '#F9FAFB'; // bg-gray-50
const TEXT_COLOR_DARK = '#1F2937';

// --- Custom Card Component (Simulating Card) ---
type CustomCardProps = { children?: React.ReactNode; style?: any };
const CustomCard = ({ children, style }: CustomCardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

// --- Custom Button Component (Simulating Button) ---
type CustomButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
  style?: any;
  textStyle?: any;
};
const CustomButton = ({ title, onPress, variant = 'primary', icon, style, textStyle }: CustomButtonProps) => {
  const isPrimary = variant === 'primary';
  const buttonStyle = [
    styles.buttonBase,
    isPrimary ? styles.buttonPrimary : styles.buttonOutline,
    style,
  ];
  const textStyles = [
    styles.buttonText,
    isPrimary ? styles.buttonTextPrimary : styles.buttonTextOutline,
    textStyle,
  ];

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle}>
      {icon && <View style={styles.buttonIcon}>{icon}</View>}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

type SignInPromptProps = {
  message?: string;
  returnUrl?: string;
};

export function SignInPrompt({
  message = 'Um einen Termin zu buchen, musst du dich anmelden oder registrieren',
  returnUrl,
}: SignInPromptProps) {
  // Cast navigation to a Native Stack navigation to allow replace/navigate type-safe usage
  const navigation = useNavigation<any>();

  // Helper function to navigate and pass returnUrl state
  const navigateWithReturn = (screenName: string) => {
    // Use push/navigate and pass returnUrl as a param
    navigation.navigate(screenName, { returnUrl });
  };

  const handleLogin = () => {
    // Placeholder route name, replace with your actual route (e.g., 'Login')
    navigateWithReturn('LoginScreen'); 
  };

  const handleRegister = () => {
    // Placeholder route name, replace with your actual route (e.g., 'Register')
    navigateWithReturn('RegisterScreen'); 
  };

  const handleGuestBrowse = () => {
    // Use replace to prevent going back to this screen
    navigation.replace('Home'); 
  };
  
  // Helper for simulated social login alerts (replacing toast/console logs)
  const handleSocialLogin = (provider: string) => {
    Alert.alert("Simuliert", `Anmeldung mit ${provider} wird gestartet...`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomCard style={styles.promptCard}>
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Ionicons name="lock-closed-outline" size={32} color={THEME_COLOR} />
          </View>

          {/* Message */}
          <Text style={styles.title}>Anmeldung erforderlich</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Actions - Register & Login */}
          <View style={styles.actionContainer}>
            <CustomButton
              title="Jetzt registrieren"
              onPress={handleRegister}
              style={styles.registerButton}
            />

            <CustomButton
              title="Ich habe bereits ein Konto"
              onPress={handleLogin}
              variant="outline"
              style={styles.loginButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Oder fortfahren mit</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialLoginContainer}>
            <CustomButton
              title="Mit Google fortfahren"
              onPress={() => handleSocialLogin("Google")}
              variant="outline"
              style={styles.socialButton}
              icon={<Ionicons name="logo-google" size={24} color="#DB4437" />}
            />
            <CustomButton
              title="Mit Apple fortfahren"
              onPress={() => handleSocialLogin("Apple")}
              variant="outline"
              style={[styles.socialButton, styles.appleButton]}
              textStyle={styles.appleButtonText}
              icon={<Ionicons name="logo-apple" size={24} color="white" />}
            />
          </View>

          {/* Browse as Guest */}
          <View style={styles.guestBrowseContainer}>
            <TouchableOpacity onPress={handleGuestBrowse}>
              <Text style={styles.guestBrowseText}>Als Gast weiterbrowsen</Text>
            </TouchableOpacity>
          </View>
        </CustomCard>
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },
  container: {
    alignItems: 'center',
    backgroundColor: LIGHT_GRAY,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING,
  },
  // Card Styles
  card: {
    backgroundColor: 'white',
    borderRadius: CARD_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  promptCard: {
    padding: SPACING,
    maxWidth: Dimensions.get('window').width * 0.9,
    width: '100%',
  },

  // Icon
  iconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: `${THEME_COLOR}1A`, // 10% opacity
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Message
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: TEXT_COLOR_DARK,
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    color: '#4B5563', // text-gray-600
    fontSize: 15,
    marginBottom: 24,
  },

  // Actions
  actionContainer: {
    gap: 12,
  },
  
  // Button Base Styles
  buttonBase: {
    paddingVertical: 12,
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 48, // h-12
  },
  buttonPrimary: {
    backgroundColor: THEME_COLOR,
  },
  buttonOutline: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB', // border-gray-200
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: 'white',
  },
  buttonTextOutline: {
    color: TEXT_COLOR_DARK, // text-gray-900
  },
  registerButton: {
    backgroundColor: THEME_COLOR,
  },
  loginButton: {
    // Uses buttonOutline default
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24, // my-6
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB', // border-gray-200
  },
  dividerText: {
    paddingHorizontal: 16, // px-4
    backgroundColor: 'white',
    color: '#6B7280', // text-gray-500
    fontSize: 14,
  },

  // Social Login
  socialLoginContainer: {
    gap: 12,
  },
  socialButton: {
    // Uses buttonOutline default
  },
  buttonIcon: {
    marginRight: 8,
  },
  appleButton: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  appleButtonText: {
    color: 'white',
  },

  // Guest Browse
  guestBrowseContainer: {
    alignItems: 'center',
    marginTop: 24, // mt-6
  },
  guestBrowseText: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
    fontWeight: '500',
  },
});
