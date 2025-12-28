import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, radii } from '@/theme/tokens';

export const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.gray50,
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: spacing.xxl * 2,
    },
    header: {
        backgroundColor: colors.white,
        borderBottomColor: colors.gray200,
        borderBottomWidth: StyleSheet.hairlineWidth,
        elevation: 1,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    headerTopRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    userInfo: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    initialsAvatar: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        width: 40,
    },
    initialsText: {
        color: colors.white,
        fontWeight: '600',
    },
    greetingText: {
        color: colors.gray500,
        fontSize: typography.small.fontSize,
    },
    displayName: {
        color: colors.gray800,
        fontSize: typography.h3.fontSize,
        fontWeight: typography.h3.fontWeight,
    },
    headerActions: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    loginButton: {
        backgroundColor: colors.white,
        borderColor: colors.primary,
    },
    loginButtonText: {
        color: colors.primary,
        fontSize: typography.small.fontSize,
    },
    notificationButton: {
        padding: spacing.sm,
        position: 'relative',
    },
    notificationBadge: {
        backgroundColor: colors.error,
        borderRadius: 4,
        height: 8,
        position: 'absolute',
        right: spacing.xs,
        top: spacing.xs,
        width: 8,
    },
    locationButton: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    locationText: {
        color: colors.gray700,
        fontSize: typography.small.fontSize,
    },
    searchBarWrapper: {
        justifyContent: 'center',
        position: 'relative',
    },
    searchBarInput: {
        borderRadius: radii.lg,
        height: 48,
        paddingLeft: spacing.xl,
    },
    filterButton: {
        padding: spacing.xs,
        position: 'absolute',
        right: spacing.sm,
    },
    verificationCard: {
        backgroundColor: colors.amber50,
        borderColor: colors.amber200,
        borderWidth: 1,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        padding: spacing.sm,
    },
    verificationContent: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    verificationTextWrapper: {
        flex: 1,
    },
    verificationText: {
        color: colors.amber900,
        fontSize: typography.small.fontSize,
        marginBottom: spacing.sm,
    },
    verifyButton: {
        alignSelf: 'flex-start',
        backgroundColor: colors.amber600,
        height: 32,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    verifyButtonText: {
        color: colors.white,
        fontSize: typography.small.fontSize,
    },
    quickActionsContainer: {
        backgroundColor: colors.white,
        marginTop: spacing.sm,
        paddingVertical: spacing.md,
    },
    quickActionsList: {
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    quickActionItem: {
        alignItems: 'center',
        width: 72,
    },
    quickActionButton: {
        alignItems: 'center',
        borderRadius: 28,
        height: 56,
        justifyContent: 'center',
        marginBottom: spacing.sm,
        width: 56,
    },
    quickActionLabel: {
        color: colors.gray700,
        fontSize: 11,
        textAlign: 'center',
    },
    popularStylesSection: {
        backgroundColor: colors.white,
        marginTop: spacing.sm,
        paddingVertical: spacing.md,
    },
    sectionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    sectionTitle: {
        color: colors.gray800,
        fontSize: typography.h3.fontSize,
        fontWeight: typography.h3.fontWeight,
    },
    seeAllButton: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    seeAllText: {
        color: colors.primary,
        fontSize: typography.small.fontSize,
    },
    popularStylesList: {
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    popularStyleCard: {
        backgroundColor: colors.white,
        borderRadius: radii.md,
        elevation: 2,
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        width: 160,
    },
    popularStyleImageContainer: {
        height: 192,
        position: 'relative',
    },
    popularStyleImage: {
        height: '100%',
        resizeMode: 'cover',
        width: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    popularStyleTextContainer: {
        bottom: 0,
        left: 0,
        padding: spacing.sm,
        position: 'absolute',
        right: 0,
    },
    popularStyleName: {
        color: colors.white,
        fontSize: typography.body.fontSize,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    popularStyleDetails: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    popularStylePrice: {
        color: colors.white,
        fontSize: typography.small.fontSize,
    },
    popularStyleDuration: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    popularStyleDurationText: {
        color: colors.white,
        fontSize: typography.small.fontSize,
    },
    nearbyBraidersSection: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    loadingContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
    },
    loadingText: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.small.fontSize,
        paddingVertical: spacing.sm,
    },
    nearbyList: {
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    nearbyBraiderCard: {
        padding: 0,
    },
    nearbyBraiderTouchable: {
        padding: spacing.md,
        position: 'relative',
    },
    favoriteButton: {
        padding: spacing.xs,
        position: 'absolute',
        right: spacing.md,
        top: spacing.md,
        zIndex: 10,
    },
    nearbyBraiderContent: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    avatarContainer: {
        position: 'relative',
    },
    braiderAvatar: {
        borderRadius: 32,
        height: 64,
        overflow: 'hidden',
        width: 64,
    },
    braiderImage: {
        height: '100%',
        resizeMode: 'cover',
        width: '100%',
    },
    verifiedBadge: {
        alignItems: 'center',
        backgroundColor: colors.blue600,
        borderColor: colors.white,
        borderRadius: 10,
        borderWidth: 2,
        bottom: -spacing.xs,
        height: 20,
        justifyContent: 'center',
        position: 'absolute',
        right: -spacing.xs,
        width: 20,
    },
    verifiedText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    braiderDetails: {
        flex: 1,
        minWidth: 0,
    },
    braiderName: {
        color: colors.gray800,
        fontSize: typography.body.fontSize,
        fontWeight: 'bold',
    },
    braiderBusiness: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
        marginTop: 2,
    },
    ratingRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    ratingText: {
        color: colors.gray800,
        fontSize: typography.small.fontSize,
    },
    reviewCount: {
        color: colors.gray400,
        fontSize: typography.small.fontSize,
    },
    distanceRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    distanceText: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
    },
    specialtiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    specialtyBadgeText: {
        fontSize: typography.small.fontSize,
    },
    priceAndAvailability: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    priceText: {
        color: colors.primary,
        fontWeight: '600',
    },
    availableBadgeText: {
        fontSize: typography.small.fontSize,
    },
    noDataText: {
        color: colors.gray600,
        fontSize: typography.small.fontSize,
        paddingVertical: spacing.lg,
        textAlign: 'center',
    },
});
