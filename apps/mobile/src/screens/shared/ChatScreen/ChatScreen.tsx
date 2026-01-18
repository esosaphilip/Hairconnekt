import React, { useState, useRef, useEffect } from 'react';
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
import { chatApi } from '../../../api/chat';
import { IMessage, MessageBubble } from './components/MessageBubble';
import { ReportModal } from './components/ReportModal';
import { styles } from './ChatScreen.styles';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

export function ChatScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<ChatScreenRouteProp>();
    const params = route.params || {};

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [provider, setProvider] = useState<any>(
        (params as any).clientName ? { id: (params as any).clientId, name: (params as any).clientName } : null
    );
    // ^ Init from params if available (e.g. from AppointmentDetails)

    const [conversationId, setConversationId] = useState<string | null>((params as any).conversationId || (params as any).id || null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const actionSheetRef = useRef<ActionSheet>(null);
    const flatListRef = useRef<FlatList>(null);

    // Initial load or create conversation
    useEffect(() => {
        const initChat = async () => {
            try {
                let convId = conversationId;

                // If we have a userId but no conversationId, try to start/get conversation
                if (!convId && (params as any).userId) {
                    const conv = await chatApi.startConversation((params as any).userId);
                    convId = conv.id;
                    setConversationId(conv.id);
                }

                if (convId) {
                    loadMessages(convId);
                    // Set up poller for new messages (MVP)
                    const interval = setInterval(() => loadMessages(convId!), 5000);
                    return () => clearInterval(interval);
                }
            } catch (error) {
                console.error("Failed to init chat", error);
                Alert.alert("Fehler", "Chat konnte nicht geladen werden.");
            }
        };
        initChat();
    }, [conversationId]);

    const loadMessages = async (convId: string) => {
        try {
            const data = await chatApi.getMessages(convId);
            setMessages(data);

            if (!provider) {
                const convs = await chatApi.getConversations();
                const currentConv = convs.find(c => c.id === convId);
                if (currentConv) {
                    setProvider({
                        id: currentConv.otherUser.id,
                        name: currentConv.otherUser.name,
                        avatar: currentConv.otherUser.avatar,
                        isOnline: false
                    });
                }
            }
        } catch (error) {
            console.log("Polling error (silent)", error);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || !conversationId) return;

        const optimisitcId = Date.now().toString();
        const optimisticMessage: IMessage = {
            id: optimisitcId,
            text: message,
            sender: 'me',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setMessage("");

        try {
            await chatApi.sendMessage(conversationId, optimisticMessage.text);
            loadMessages(conversationId);
        } catch (error) {
            console.error("Failed to send", error);
            Alert.alert("Fehler", "Nachricht konnte nicht gesendet werden.");
            setMessages(prev => prev.filter(m => m.id !== optimisitcId));
        }
    };

    const handleBooking = () => {
        actionSheetRef.current?.hide();
        navigation.navigate("CreateAppointment", {
            clientId: provider?.id,
            clientName: provider?.name
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
                            // Assuming provider.id is available
                            if (provider?.id) {
                                await http.post(`/users/${provider.id}/block`);
                                setIsBlocked(true);
                                Alert.alert("Erfolg", "Nutzer wurde blockiert.");
                                navigation.goBack();
                            }
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
            if (provider?.id) {
                await http.post(`/users/${provider.id}/report`, {
                    reason,
                    details: "Reported from ChatScreen",
                });
                setReportModalVisible(false);
                Alert.alert("Danke", "Dein Bericht wurde gesendet und wird überprüft.");
            }
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
                        onPress={() => provider && navigation.navigate("ProviderProfile", { id: provider.id })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatarWrapper}>
                            <Avatar size={40}>
                                {provider?.avatar ? (
                                    <Image source={{ uri: provider.avatar }} style={styles.avatarImage} />
                                ) : (
                                    <View style={[styles.avatarImage, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                                        <User size={24} color="#6B7280" />
                                    </View>
                                )}
                            </Avatar>
                            {provider?.isOnline && (
                                <View style={styles.onlineIndicator} />
                            )}
                        </View>
                        <View style={styles.userInfoText}>
                            <Text style={styles.userName}>{provider?.name || "Unbekannt"}</Text>
                            {provider?.isOnline && <Text style={styles.userStatus}>Online</Text>}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => handleCall('voice')} style={styles.headerButton}>
                            <Phone size={20} color="#1F2937" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCall('video')} style={styles.headerButton}>
                            <Video size={20} color="#1F2937" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => actionSheetRef.current?.show()} style={styles.headerButton}>
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
                            providerAvatar={provider?.avatar}
                            providerName={provider?.name}
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
                            if (provider?.id) {
                                navigation.navigate("ProviderProfile", { id: provider.id });
                            }
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
