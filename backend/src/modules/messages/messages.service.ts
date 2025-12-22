import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(private readonly usersService: UsersService) { }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const isBlocked = await this.usersService.isBlocked(senderId, receiverId);
    if (isBlocked) {
      throw new ForbiddenException('Kommunikation mit diesem Nutzer ist nicht möglich.');
    }
    // TODO: Implement actual message persistence
    return { success: true, message: 'Message sent (simulated)' };
  }

  async getConversation(userA: string, userB: string) {
    const isBlocked = await this.usersService.isBlocked(userA, userB);
    if (isBlocked) {
      // Option 1: Throw error
      // throw new ForbiddenException('Kommunikation mit diesem Nutzer ist nicht möglich.');

      // Option 2 (Better for UI): Return empty or flagged state
      // For now, adhering to strict requirement:
      throw new ForbiddenException('Kommunikation mit diesem Nutzer ist nicht möglich.');
    }
    // TODO: Implement conversation retrieval
    return [];
  }
}