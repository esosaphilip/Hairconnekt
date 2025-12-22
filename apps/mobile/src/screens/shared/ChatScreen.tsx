// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
// ... imports
import { http } from "../../api/http";

// ... existing imports

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params || {};
  const id = params.id;

  const chat = mockChats[id || "1"];

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chat?.messages || []);
  const [isBlocked, setIsBlocked] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const actionSheetRef = useRef(null);
  const flatListRef = useRef(null);

  // ... useEffects

  const handleBlockUser = () => {
    actionSheetRef.current?.hide();
    Alert.alert(
      "Nutzer blockieren?",
      "Ihr werdet euch keine Nachrichten mehr senden können.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Blockieren",
          style: "destructive",
          onPress: async () => {
            try {
              // Assuming chat.provider.id is the target user ID
              await http.post(`/users/${chat.provider.id}/block`);
              setIsBlocked(true);
              Alert.alert("Erfolg", "Nutzer wurde blockiert.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Fehler", "Blockieren fehlugeschlagen.");
            }
          }
        }
      ]
    );
  };

  const handleReportUser = () => {
    actionSheetRef.current?.hide();
    setReportModalVisible(true);
  };

  const submitReport = async (reason: string) => {
    try {
      await http.post(`/users/${chat.provider.id}/report`, {
        reason,
        details: "Reported from ChatScreen",
      });
      setReportModalVisible(false);
      Alert.alert("Danke", "Dein Bericht wurde gesendet und wird überprüft.");
    } catch (error) {
      Alert.alert("Fehler", "Melden fehlgeschlagen.");
      setReportModalVisible(false);
    }
  };

  const ReportModal = () => (
    <Modal
      visible={reportModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setReportModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nutzer melden</Text>
            <Text style={styles.modalSubtitle}>Bitte wähle einen Grund:</Text>

            {['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER'].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.modalOption}
                onPress={() => submitReport(reason)}
              >
                <Text style={styles.modalOptionText}>
                  {reason === 'HARASSMENT' ? 'Belästigung' :
                    reason === 'INAPPROPRIATE' ? 'Unangemessener Inhalt' :
                      reason === 'SPAM' ? 'Spam' : 'Sonstiges'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userInfoContainer}
            onPress={() => navigation.navigate("ProviderProfile", { id: chat.provider.id })}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              <Avatar size={40}>
                <Image source={{ uri: chat.provider.avatar }} style={styles.avatarImage} />
              </Avatar>
              {chat.provider.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
            <View style={styles.userNameTextWrapper}>
              <Text style={styles.userName}>{chat.provider.name}</Text>
              <Text style={styles.userStatus}>
                {chat.provider.isOnline ? "Online" : "Zuletzt online vor 2 Std."}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => handleCall("voice")} style={styles.actionButton}>
              <Phone size={20} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCall("video")} style={styles.actionButton}>
              <Video size={20} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => actionSheetRef.current?.show()} style={styles.actionButton}>
              <MoreVertical size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              providerAvatar={chat.provider.avatar}
              providerName={chat.provider.name}
            />
          )}
          contentContainerStyle={styles.messagesList}
          // Initial scroll to bottom
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={() => (
            <View style={styles.dateDividerContainer}>
              <View style={styles.dateDivider}>
                <Text style={styles.dateDividerText}>Heute</Text>
              </View>
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={handleAttachment} style={styles.inputIconButton}>
              <Paperclip size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAttachment} style={styles.inputIconButton}>
              <ImageIcon size={20} color="#6B7280" />
            </TouchableOpacity>
            <TextInput
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSend} // Send on Enter key press
              placeholder={isBlocked ? "Du hast diesen Nutzer blockiert." : "Nachricht schreiben..."}
              editable={!isBlocked}
              style={[styles.textInput, isBlocked && styles.textInputDisabled]}
              multiline={false} // Ensure single line for chat
            />
            <Button
              onPress={handleSend}
              disabled={!message.trim()}
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            >
              <Send size={20} color="#fff" />
            </Button>
          </View>
        </View>
        <ReportModal />
      </KeyboardAvoidingView>

      {/* RN Action Sheet (Dropdown Menu Replacement) */}
      <ActionSheet ref={actionSheetRef} containerStyle={styles.actionSheet}>
        <View style={styles.actionSheetContent}>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => {
              actionSheetRef.current?.hide();
              navigation.navigate("ProviderProfile", { id: chat.provider.id });
            }}
          >
            <User size={20} color="#1F2937" style={styles.actionSheetIcon} />
            <Text style={styles.actionSheetText}>Profil ansehen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={handleBooking}
          >
            <Calendar size={20} color="#1F2937" style={styles.actionSheetIcon} />
            <Text style={styles.actionSheetText}>Termin buchen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => showMessage({ message: "Chat stummschalten", type: "info" })}
          >
            <Text style={styles.actionSheetText}>Chat stummschalten</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => showMessage({ message: "Chat löschen", type: "info" })}
          >
            <Text style={[styles.actionSheetText, styles.actionSheetTextDanger]}>Chat löschen</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

const styles = StyleSheet.create({
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