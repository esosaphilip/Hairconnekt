import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
    appointmentHeaderRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    appointmentRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 8,
    },
    cardMb12: {
        marginBottom: 12,
    },
    actionButton: {
        flex: 1,
        marginRight: spacing.sm,
    },
    iconButton: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    appointmentIndicator: {
        backgroundColor: colors.green600,
        borderRadius: 1,
        flex: 1,
        width: 2,
    },
    centered: {
        alignItems: 'center',
    },
    flex1: {
        flex: 1,
    },
    availabilityDescription: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
    },
    availabilityText: {
        fontSize: typography.body.fontSize,
        fontWeight: '700',
    },
    clientInfo: {
        flex: 1,
        marginLeft: 12,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '700',
    },
    changeRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: spacing.xs,
    },
    dashedDivider: {
        borderColor: colors.gray300,
        borderLeftWidth: 2,
        borderStyle: 'dashed',
        height: 48,
        marginRight: 8,
    },
    dashedRow: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 8,
    },
    dateText: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
    },
    errorText: {
        color: colors.error,
    },
    errorContainerPadding: {
        paddingHorizontal: 16,
    },
    header: {
        backgroundColor: colors.white,
        borderBottomColor: colors.overlay,
        borderBottomWidth: 1,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    headerActionButton: {
        padding: spacing.sm,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerTop: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    indicatorContainer: {
        alignItems: 'center',
        paddingTop: 4,
        width: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    mb2: {
        marginBottom: 2,
    },
    mbMd: {
        marginBottom: spacing.md,
    },
    mbSm: {
        marginBottom: spacing.sm,
    },
    nettoText: {
        color: colors.gray500,
        fontSize: 10,
    },
    nextTimeText: {
        fontSize: 22,
        marginBottom: 2,
    },
    positiveChangeText: {
        color: colors.green600,
        fontSize: 11,
        marginLeft: spacing.xs,
    },
    priceText: {
        color: colors.primary,
        fontWeight: '700',
    },
    ghostButtonWide: {
        flex: 1,
    },
    quickActionCard: {
        paddingVertical: 16,
        width: '48%',
    },
    quickActionLabel: {
        color: colors.gray700,
        fontSize: 12,
        marginTop: 8,
    },
    quickActionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    safeArea: {
        backgroundColor: colors.gray50,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
    },
    rowBetweenCenter: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rowEndBetween: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: typography.body.fontSize,
        fontWeight: '700',
    },
    sectionHeaderRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    seeAllText: {
        color: colors.primary,
        fontSize: typography.small.fontSize,
    },
    smallGrayText: {
        color: colors.gray500,
        fontSize: 12,
    },
    smallMutedText: {
        color: colors.gray600,
        fontSize: 12,
    },
    starIcon: {
        marginRight: 2,
    },
    statCard: {
        width: '48%',
    },
    statHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 6,
    },
    statIcon: {
        marginRight: spacing.xs,
    },
    statLabel: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
    },
    statNumber: {
        color: colors.primary,
        fontSize: typography.h2.fontSize,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    statsContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    reviewClientName: {
        fontSize: 16,
        fontWeight: '700',
    },
    reviewHeaderRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    reviewStarsRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    reviewText: {
        color: colors.gray700,
        fontSize: 14,
        marginBottom: 8,
    },
    timeUntilText: {
        color: colors.blue900,
        fontSize: typography.small.fontSize,
        marginTop: 2,
    },
    welcomeText: {
        fontSize: typography.h3.fontSize,
        fontWeight: typography.h3.fontWeight,
    },
});
