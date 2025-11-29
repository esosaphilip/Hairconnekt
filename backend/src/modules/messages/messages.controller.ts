import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  sendMessage(@Body() dto: SendMessageDto) {
    return { message: 'Not implemented - awaiting schemas' };
  }
}