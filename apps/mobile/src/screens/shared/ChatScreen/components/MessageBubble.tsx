import React from 'react';
import { View, Text } from 'react-native';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/avatar';
import { styles } from '../ChatScreen.styles';

export interface IMessage {
    id: string;
    text: string;
    sender: 'me' | 'provider' | string;
    timestamp: string;
}

interface MessageBubbleProps {
    message: IMessage;
    providerAvatar?: string | null;
    providerName: string;
}

export const MessageBubble = ({ message, providerAvatar, providerName }: MessageBubbleProps) => {
    const isMe = message.sender !== 'provider';

    return (
        <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
            <View style={[styles.messageContent, isMe ? styles.messageContentMe : styles.messageContentThem]}>
                {!isMe && (
                    <Avatar size={32}>
                        {providerAvatar ? (
                            <AvatarImage uri={providerAvatar} />
                        ) : (
                            <AvatarFallback label={providerName} />
                        )}
                    </Avatar>
                )}
                <View style={[styles.bubbleWrapper, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                            {message.text}
                        </Text>
                    </View>
                    <View style={[styles.timeStatusContainer, isMe ? styles.timeStatusContainerMe : styles.timeStatusContainerThem]}>
                        <Text style={styles.timeText}>
                            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};
