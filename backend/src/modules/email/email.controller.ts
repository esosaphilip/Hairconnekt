import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly email: EmailService) {}

  @Get('test')
  async test(@Query('to') to: string, @Query('name') name: string) {
    return this.email.sendWelcomeEmail(to, name || 'HairConnekt User');
  }
}
