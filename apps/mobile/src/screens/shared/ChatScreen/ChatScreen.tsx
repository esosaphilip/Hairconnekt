import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import ActionSheet from "react-native-actions-sheet";
import { showMessage } from "react-native-flash-message";
import {
    ArrowLeft,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Image as ImageIcon,
    Send,
    User,
    Calendar
} from 'lucide-react-native';
import { Avatar, AvatarImage } from '../../../components/avatar';
import { Button } from '../../../components/Button';
import { http } from "../../../api/http";
import { RootStackParamList } from '../../../navigation/types';
import { MessageBubble, IMessage } from './components/MessageBubble';
import { ReportModal } from './components/ReportModal';
import { styles } from './ChatScreen.styles';

const mockChats: Record<string, any> = {
    "1": {
        provider: { id: "1", name: "Support", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", isOnline: true },
        messages: [
            { id: "1", text: "Hallo! Wie kann ich dir helfen?", sender: "provider", timestamp: new Date().toISOString() }
        ]
    }
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

export function ChatScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<ChatScreenRouteProp>();
    const params = route.params || {};

    // Support both id (conversationId) and userId (direct chat)
    const id = params.id || params.userId || "1";

    // Fallback to mock chat if id not found, or create a temporary structure
    const chat = mockChats[id] || {
        provider: { id: id, name: "Chat", avatar: null, isOnline: false },
        messages: []
    };

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<IMessage[]>(chat?.messages || []);
    const [isBlocked, setIsBlocked] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const actionSheetRef = useRef<ActionSheet>(null);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!message.trim()) return;

        const newMessage: IMessage = {
            id: Date.now().toString(),
            text: message,
            sender: 'me',
            timestamp: new Date().toISOString(),
        };

        setMessages([...messages, newMessage]);
        setMessage("");
    };

    const handleBooking = () => {
        actionSheetRef.current?.hide();
        navigation.navigate("CreateAppointment", {
            clientId: (params as any).userId || chat.provider.id,
            clientName: chat.provider.name
        });
    };

    const handleCall = (type: 'voice' | 'video') => {
        Alert.alert("Anruf", `${type === 'voice' ? 'Sprachanruf' : 'Videoanruf'} wird gestartet... (Demo)`);
    };

    const handleAttachment = () => {
        Alert.alert("Anhang", "Datei anhängen ist noch nicht implementiert.");
    };

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

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
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
                                {chat.provider.avatar ? (
                                    <Image source={{ uri: chat.provider.avatar }} style={styles.avatarImage} />
                                ) : (
                                    <View style={[styles.avatarImage, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                                        <User size={24} color="#6B7280" />
                                    </View>
                                )}
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
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListHeaderComponent={() => (
                        <View style={styles.dateDividerContainer}>
                            <View style={styles.dateDivider}>
                                <Text style={styles.dateDividerText}>Heute</Text>
                            </View>
                        </View>
                    )}
                />

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
                            onSubmitEditing={handleSend}
                            placeholder={isBlocked ? "Du hast diesen Nutzer blockiert." : "Nachricht schreiben..."}
                            editable={!isBlocked}
                            style={[styles.textInput, isBlocked && styles.textInputDisabled]}
                            multiline={false}
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
                <ReportModal
                    visible={reportModalVisible}
                    onClose={() => setReportModalVisible(false)}
                    onSubmit={submitReport}
                />
            </KeyboardAvoidingView>

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
                        onPress={() => {
                            actionSheetRef.current?.hide();
                            showMessage({ message: "Chat stummschalten", type: "info" });
                        }}
                    >
                        <Text style={styles.actionSheetText}>Chat stummschalten</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionSheetItem}
                        onPress={() => {
                            actionSheetRef.current?.hide();
                            handleBlockUser();
                        }}
                    >
                        <Text style={[styles.actionSheetText, styles.actionSheetTextDanger]}>Nutzer blockieren</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionSheetItem}
                        onPress={handleReportUser}
                    >
                        <Text style={[styles.actionSheetText, styles.actionSheetTextDanger]}>Nutzer melden</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionSheetItem}
                        onPress={() => {
                            actionSheetRef.current?.hide();
                            showMessage({ message: "Chat löschen", type: "info" });
                        }}
                    >
                        <Text style={[styles.actionSheetText, styles.actionSheetTextDanger]}>Chat löschen</Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>
        </SafeAreaView>
    );
}
