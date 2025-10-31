// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  Phone,
  Video,
  MoreVertical,
  Calendar,
  User,
} from "lucide-react-native";
import { showMessage } from "react-native-flash-message";

// Assuming these custom RN components exist
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import ActionSheet from "react-native-actions-sheet"; // Common RN component for menus/dropdowns

// Mock chat data
// In a real RN app, the data would likely be managed by a state/data layer.
const mockChats = {
  // ... (mock data remains the same)
  "1": {
    provider: {
      id: "1",
      name: "Sarah Mueller",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      isOnline: true,
    },
    messages: [
      {
        id: "1",
        sender: "them",
        text: "Hallo! Ich freue mich auf deinen Termin morgen 😊",
        time: "10:30",
        status: "read",
      },
      {
        id: "2",
        sender: "me",
        text: "Vielen Dank! Ich freue mich auch. Kann ich meine eigenen Extensions mitbringen?",
        time: "10:32",
        status: "read",
      },
      {
        id: "3",
        sender: "them",
        text: "Natürlich! Das ist kein Problem. Bitte bring sie morgen mit.",
        time: "10:35",
        status: "read",
      },
      {
        id: "4",
        sender: "me",
        text: "Super, bis morgen dann!",
        time: "10:40",
        status: "read",
      },
    ],
  },
  "2": {
    provider: {
      id: "2",
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isOnline: false,
    },
    messages: [
      {
        id: "1",
        sender: "them",
        text: "Guten Tag! Danke für deine Buchung.",
        time: "14:20",
        status: "read",
      },
      {
        id: "2",
        sender: "me",
        text: "Hallo! Wie lange dauert die Behandlung ungefähr?",
        time: "14:25",
        status: "delivered",
      },
    ],
  },
};

// --- Custom Message Component (replacing the complex conditional divs) ---
const MessageBubble = React.memo(({ message, providerAvatar, providerName }) => {
  const isMe = message.sender === "me";
  const { text, time, status } = message;

  const getStatusIcon = (currentStatus) => {
    switch (currentStatus) {
      case "delivered":
        return <Text style={styles.statusIcon}>✓✓</Text>;
      case "read":
        return <Text style={[styles.statusIcon, styles.statusRead]}>✓✓</Text>;
      case "sent":
      default:
        return <Text style={styles.statusIcon}>✓</Text>;
    }
  };

  return (
    <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
      <View style={[styles.messageContent, isMe ? styles.messageContentMe : styles.messageContentThem]}>
        {!isMe && (
          <Avatar size={32} style={styles.avatar}>
            <Image source={{ uri: providerAvatar }} style={styles.avatarImage} />
          </Avatar>
        )}
        <View style={styles.bubbleWrapper}>
          <View
            style={[
              styles.bubble,
              isMe ? styles.bubbleMe : styles.bubbleThem,
            ]}
          >
            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>{text}</Text>
          </View>
          <View style={[styles.timeStatusContainer, isMe ? styles.timeStatusContainerMe : styles.timeStatusContainerThem]}>
            <Text style={styles.timeText}>{time}</Text>
            {isMe && status && getStatusIcon(status)}
          </View>
        </View>
      </View>
    </View>
  );
});

// --- Refactored Component ---

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params || {};
  const id = params.id; // Use useRoute to get params
  
  const chat = mockChats[id || "1"];
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chat?.messages || []);
  const actionSheetRef = useRef(null);
  const flatListRef = useRef(null);

  // Scroll to bottom on load and when new message is sent
  useEffect(() => {
    // Timeout ensures scroll happens after rendering the new message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  if (!chat) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Chat nicht gefunden</Text>
        <Button onPress={() => navigation.navigate("Messages")}>
          Zurück zu Nachrichten
        </Button>
      </View>
    );
  }

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: "me",
        text: message.trim(),
        time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Simulate message delivery
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 1000);
      
      // Ensure smooth scroll after send
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleAttachment = () => {
    showMessage({
      message: "Anhang-Funktion",
      description: "Anhang-Funktion kommt bald",
      type: "info",
    });
  };

  const handleCall = (type: "voice" | "video") => {
    showMessage({
      message: `${type === "voice" ? "Sprach" : "Video"}anruf`,
      description: `${type === "voice" ? "Sprach" : "Video"}anruf kommt bald`,
      type: "info",
    });
  };

  const handleBooking = () => {
    actionSheetRef.current?.hide();
    navigation.navigate("Booking", { providerId: chat.provider.id });
  };

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
              placeholder="Nachricht schreiben..."
              style={styles.textInput}
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
  }
});