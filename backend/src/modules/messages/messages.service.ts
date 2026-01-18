import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private readonly usersService: UsersService
  ) { }

  async startConversation(userId: string, recipientId: string) {
    if (userId === recipientId) throw new ForbiddenException('You cannot chat with yourself');

    const isBlocked = await this.usersService.isBlocked(userId, recipientId);
    if (isBlocked) {
      throw new ForbiddenException('Kommunikation mit diesem Nutzer ist nicht möglich.');
    }

    // Check if conversation exists (order agnostic)
    let conversation = await this.conversationsRepository.findOne({
      where: [
        { participant1: { id: userId }, participant2: { id: recipientId } },
        { participant1: { id: recipientId }, participant2: { id: userId } }
      ],
      relations: ['participant1', 'participant2']
    });

    if (!conversation) {
      conversation = this.conversationsRepository.create({
        participant1: { id: userId },
        participant2: { id: recipientId },
        lastMessageAt: new Date(),
      });
      await this.conversationsRepository.save(conversation);
    }

    return conversation;
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    // Determine conversation
    let conversation: Conversation | null = null;

    if (dto.conversationId) {
      conversation = await this.conversationsRepository.findOne({
        where: { id: dto.conversationId },
        relations: ['participant1', 'participant2']
      });
    }

    // TODO: if dto has recipientId instead of conversationId, find or create conversation (handled via startConversation usually)
    // For now assuming conversationId is passed.

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify blocking again
    const recipientId = conversation.participant1.id === userId ? conversation.participant2.id : conversation.participant1.id;
    const isBlocked = await this.usersService.isBlocked(userId, recipientId);
    if (isBlocked) {
      throw new ForbiddenException('Kommunikation mit diesem Nutzer ist nicht möglich.');
    }

    const message = this.messagesRepository.create({
      conversation: { id: conversation.id },
      sender: { id: userId },
      recipient: { id: recipientId },
      messageText: dto.content,
      messageType: MessageType.TEXT, // default
      isRead: false,
    });

    const savedMessage = await this.messagesRepository.save(message);

    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastMessageText = dto.content.substring(0, 100);
    await this.conversationsRepository.save(conversation);

    return savedMessage;
  }

  async getConversations(userId: string) {
    // Return conversations where user is participant, ordered by lastMessageAt DESC
    const conversations = await this.conversationsRepository.find({
      where: [
        { participant1: { id: userId } },
        { participant2: { id: userId } }
      ],
      relations: ['participant1', 'participant2'],
      order: { lastMessageAt: 'DESC' }
    });

    // Map to simple structure for frontend if needed, or return entities
    // Frontend likely expects "provider" or "otherUser" object.
    return conversations.map(c => {
      const otherUser = c.participant1.id === userId ? c.participant2 : c.participant1;
      return {
        id: c.id,
        otherUser: {
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName}`.trim(),
          avatar: otherUser.profilePictureUrl, // Assuming user entity has this mapped
        },
        lastMessage: c.lastMessageText,
        lastMessageAt: c.lastMessageAt,
      };
    });
  }

  async getMessages(userId: string, conversationId: string) {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2']
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    if (conversation.participant1.id !== userId && conversation.participant2.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const messages = await this.messagesRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' }
    });

    return messages.map(m => ({
      id: m.id,
      text: m.messageText,
      sender: m.sender.id === userId ? 'me' : 'other', // Simplify for frontend
      timestamp: m.createdAt,
      isRead: m.isRead,
    }));
  }
}