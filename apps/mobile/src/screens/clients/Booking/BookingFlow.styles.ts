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
    bottomBar: {
        padding: 16,
        paddingBottom: 34, // Safe area padding
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        backgroundColor: '#fff',
    },
});
