import { Injectable } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio | null = null;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (sid && token) {
      this.client = twilio(sid, token);
    }
  }

  async sendSms(to: string, body: string) {
    if (!this.client) {
      return {
        message:
          'Twilio client not initialized. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN',
        to,
        body,
      };
    }
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
      return {
        message: 'Missing TWILIO_PHONE_NUMBER in environment',
        to,
        body,
      };
    }
    const res = await this.client.messages.create({ to, from, body });
    return { sid: res.sid, status: res.status, to, body };
  }
}