// Brand tokens mirrored from web globals.css
export const colors = {
  primary: '#8B4513',
  primaryLight: '#A0522D',
  primaryDark: '#5C2E0A',
  brown: '#8B4513',
  secondary: '#FF6B6B',
  accentTeal: '#20B2AA',
  accentPurple: '#9B59B6',
  accentGold: '#DAA520',
  black: '#1A1A1A',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F5F5F5',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  small: { fontSize: 14, fontWeight: '400' },
} as const;

export const theme = { colors, spacing, radii, shadows, typography };

// Compatibility shims for legacy imports across screens
// Uppercase aliases commonly referenced in screens
export const COLORS: Record<string, string> = {
  ...colors,
  background: colors.gray50,
  border: colors.gray200,
  textSecondary: colors.gray600,
  // Compatibility aliases
  red600: '#DC2626',
  danger: '#DC2626',
  infoBg: '#EFF6FF',
  infoBorder: '#DBEAFE',
  infoText: '#1E40AF',
};

export const SPACING: Record<string, number> = {
  ...spacing,
};

export const FONT_SIZES: Record<string, number> = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  body: 14,
  small: 12,
};