import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme/tokens';

export const styles = StyleSheet.create({
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
