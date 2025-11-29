import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'ws';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ path: '/ws/messages' })
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('send')
  handleSend(@MessageBody() payload: SendMessageDto) {
    // TODO: Broadcast or route messages to conversation participants after schemas are provided
    return { event: 'sent', data: payload };
  }
}