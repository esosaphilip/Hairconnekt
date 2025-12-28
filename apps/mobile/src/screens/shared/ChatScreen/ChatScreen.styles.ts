import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    notFoundTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    // --- Header ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    backButton: {
        paddingRight: 12,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 8,
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 8,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 9999, // fully round
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        backgroundColor: '#10B981', // green-500
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 6,
    },
    userNameTextWrapper: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    userStatus: {
        fontSize: 12,
        color: '#6B7280', // gray-500
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 9999,
    },
    // --- Message List ---
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    dateDividerContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    dateDivider: {
        backgroundColor: '#E5E7EB', // gray-200
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    dateDividerText: {
        fontSize: 12,
        color: '#4B5563', // gray-600
    },
    messageRow: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    messageRowThem: {
        justifyContent: 'flex-start',
    },
    messageRowMe: {
        justifyContent: 'flex-end',
    },
    messageContent: {
        flexDirection: 'row',
        maxWidth: '75%',
        alignItems: 'flex-end',
    },
    messageContentThem: {
        gap: 8,
    },
    messageContentMe: {
        flexDirection: 'row-reverse',
        gap: 8,
    },
    bubbleWrapper: {
        flexShrink: 1,
    },
    bubble: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxWidth: '100%',
    },
    bubbleThem: {
        backgroundColor: '#F3F4F6', // gray-100
    },
    bubbleMe: {
        backgroundColor: '#8B4513', // brown
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    messageTextThem: {
        color: '#1F2937', // gray-900
    },
    messageTextMe: {
        color: '#fff',
    },
    timeStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    timeStatusContainerThem: {
        justifyContent: 'flex-start',
    },
    timeStatusContainerMe: {
        justifyContent: 'flex-end',
    },
    timeText: {
        fontSize: 12,
        color: '#6B7280', // gray-500
    },
    statusIcon: {
        fontSize: 12,
        color: '#6B7280', // gray-500
    },
    statusRead: {
        color: '#3B82F6', // blue-500
    },
    // --- Input Area ---
    inputArea: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#fff',
        padding: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputIconButton: {
        padding: 8,
        borderRadius: 9999,
    },
    textInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#F3F4F6', // Light background for input
        borderRadius: 20,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8B4513',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB', // gray-300
    },
    // --- Action Sheet (Dropdown Replacement) ---
    actionSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    actionSheetContent: {
        paddingVertical: 16,
    },
    actionSheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    actionSheetIcon: {
        marginRight: 12,
    },
    actionSheetText: {
        fontSize: 16,
        color: '#1F2937',
    },
    actionSheetTextDanger: {
        color: '#DC2626', // red-600
    },
    textInputDisabled: {
        backgroundColor: '#E5E7EB',
        color: '#9CA3AF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        marginBottom: 16,
        color: '#4B5563',
    },
    modalOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#1F2937',
    },
    modalCancelButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    }
});
