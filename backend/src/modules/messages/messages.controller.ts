import { Body, Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post()
  async sendMessage(@Req() req: Request, @Body() dto: SendMessageDto) {
    const userId = (req.user as any)?.sub;
    return this.messagesService.sendMessage(userId, dto);
  }

  @Post('start')
  async startConversation(@Req() req: Request, @Body() body: { recipientId: string }) {
    const userId = (req.user as any)?.sub;
    return this.messagesService.startConversation(userId, body.recipientId);
  }

  @Get('conversations')
  async getConversations(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.messagesService.getConversations(userId);
  }

  @Get('conversations/:id')
  async getMessages(@Req() req: Request, @Param('id') conversationId: string) {
    const userId = (req.user as any)?.sub;
    return this.messagesService.getMessages(userId, conversationId);
  }
}