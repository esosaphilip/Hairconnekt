import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, radii, FONT_SIZES } from '@/theme/tokens';

export const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        flex: 1,
    },
    header: {
        backgroundColor: colors.white,
        borderBottomColor: colors.gray200,
        borderBottomWidth: 1,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingTop: Platform.OS === 'android' ? spacing.md : 0,
        zIndex: 10,
    },
    headerContent: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    headerSubtitle: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
    },
    headerTitle: {
        fontSize: FONT_SIZES.h4 || 18,
        fontWeight: '600',
    },
    mlSm: {
        marginLeft: spacing.sm,
    },
    mobileServiceFee: {
        color: colors.primary,
        fontSize: typography.body.fontSize,
        fontWeight: '600',
    },
    mobileServiceInfo: {
        backgroundColor: colors.infoBg,
        borderRadius: radii.md,
        marginTop: spacing.sm,
        padding: spacing.sm,
    },
    mobileServiceText: {
        color: colors.gray800,
        fontSize: typography.body.fontSize,
        marginBottom: spacing.xs,
    },
    mrXs: {
        marginRight: spacing.xs,
    },
    mtMd: {
        marginTop: spacing.md,
    },
    notesInput: {
        borderColor: colors.gray200,
        borderRadius: radii.md,
        borderWidth: 1,
        minHeight: 100,
        padding: spacing.sm,
        textAlignVertical: 'top',
    },
    paymentButton: {
        borderColor: colors.gray200,
        borderRadius: radii.md,
        borderWidth: 2,
        marginBottom: spacing.sm,
        marginRight: spacing.sm,
        padding: spacing.md,
    },
    paymentButtonSelected: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    paymentOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    progressActive: {
        backgroundColor: colors.primary,
    },
    progressBarContainer: {
        flexDirection: 'row',
    },
    progressSegment: {
        backgroundColor: colors.gray200,
        borderRadius: 2,
        flex: 1,
        height: 4,
        marginRight: spacing.xs,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 150,
    },
    separator: {
        backgroundColor: colors.gray200,
        height: 1,
        marginVertical: spacing.sm,
    },
    serviceCard: {
        backgroundColor: colors.white,
        borderRadius: radii.md,
        borderWidth: 0,
        elevation: 2,
        marginBottom: spacing.sm,
        padding: spacing.md,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    serviceCardSelected: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
        borderWidth: 2,
    },
    serviceDetails: {
        flex: 1,
    },
    serviceDuration: {
        color: colors.gray600,
        marginLeft: spacing.xs,
        marginRight: spacing.sm,
    },
    serviceItem: {
        alignItems: 'flex-start',
        flexDirection: 'row',
    },
    serviceMeta: {
        alignItems: 'center',
        color: colors.gray600,
        flexDirection: 'row',
        fontSize: typography.body.fontSize,
    },
    serviceName: {
        fontSize: FONT_SIZES.h5 || 16,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    servicePrice: {
        color: colors.primary,
        fontWeight: '600',
    },
    stepContainer: {},
    stepTitle: {
        fontSize: FONT_SIZES.h4 || 18,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        color: colors.gray600,
        fontSize: typography.body.fontSize,
    },
    summaryRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    summaryTotalLabel: {
        fontSize: FONT_SIZES.h5 || 16,
        fontWeight: '600',
    },
    summaryTotalValue: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timePeriod: {
        color: colors.gray600,
        fontSize: typography.body.fontSize,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    timeSlot: {
        alignItems: 'center',
        borderColor: colors.gray200,
        borderRadius: radii.md,
        borderWidth: 2,
        justifyContent: 'center',
        marginBottom: spacing.xs,
        marginRight: spacing.xs,
        minWidth: '32%',
        padding: spacing.sm,
    },
    timeSlotSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeText: {
        color: colors.gray800,
        fontSize: typography.body.fontSize,
    },
    timeTextSelected: {
        color: colors.white,
        fontWeight: 'bold',
    },
    totalPriceValue: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    confirmationContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    checkIconContainer: {
        alignItems: 'center',
        backgroundColor: colors.success || '#4CAF50',
        borderRadius: 40,
        height: 80,
        justifyContent: 'center',
        marginBottom: spacing.xl,
        width: 80,
    },
    confirmationTitle: {
        fontSize: FONT_SIZES.h2 || 24,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    confirmationSubtitle: {
        color: colors.gray600,
        fontSize: typography.body.fontSize,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    confirmationCard: {
        padding: spacing.xl,
        width: '100%',
    },
    centerBlock: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    bookingNumberLabel: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
        marginBottom: 4,
    },
    bookingNumberValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    detailLabel: {
        color: colors.gray600,
        fontWeight: '500',
    },
    buttonGroup: {
        marginTop: spacing.xl,
        width: '100%',
    },
    calendarButton: {
        backgroundColor: colors.primary,
        marginBottom: spacing.md,
    },
    checkbox: {
        alignItems: 'center',
        borderColor: colors.gray300,
        borderRadius: 4,
        borderWidth: 2,
        height: 20,
        justifyContent: 'center',
        marginRight: spacing.md,
        marginTop: 2,
        width: 20,
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: FONT_SIZES.h5 || 16,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    detailRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    charCount: {
        color: colors.gray500,
        fontSize: typography.small.fontSize,
        marginTop: 4,
        textAlign: 'right',
    },
    cancellationList: {
        marginTop: spacing.xs,
    },
    cancellationItem: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
        marginBottom: 4,
    },
    bottomBar: {
        backgroundColor: colors.white,
        borderTopColor: colors.gray200,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
});
