import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { welcomeTemplate, bookingConfirmationTemplate, reminderTemplate, verificationCodeTemplate, passwordResetTemplate } from './templates';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const { subject, html } = welcomeTemplate({ name });
    if (!this.resend) {
      return { message: 'RESEND_API_KEY not set', to, subject, html };
    }
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const { data, error } = await this.resend.emails.send({ from, to, subject, html });
    if (error) {
      return { error: error.message, to, subject };
    }
    return { id: data?.id, to, subject };
  }

  async sendBookingConfirmation(to: string, bookingId: string, date: string) {
    const { subject, html } = bookingConfirmationTemplate({ bookingId, date });
    if (!this.resend) {
      return { message: 'RESEND_API_KEY not set', to, subject, html };
    }
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const { data, error } = await this.resend.emails.send({ from, to, subject, html });
    if (error) {
      return { error: error.message, to, subject };
    }
    return { id: data?.id, to, subject };
  }

  async sendReminder(to: string, appointmentId: string, when: string) {
    const { subject, html } = reminderTemplate({ appointmentId, when });
    if (!this.resend) {
      return { message: 'RESEND_API_KEY not set', to, subject, html };
    }
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const { data, error } = await this.resend.emails.send({ from, to, subject, html });
    if (error) {
      return { error: error.message, to, subject };
    }
    return { id: data?.id, to, subject };
  }

  async sendVerificationCodeEmail(to: string, code: string, name?: string) {
    const { subject, html } = verificationCodeTemplate({ name, code });
    if (!this.resend) {
      return { message: 'RESEND_API_KEY not set', to, subject, html };
    }
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const { data, error } = await this.resend.emails.send({ from, to, subject, html });
    if (error) {
      return { error: error.message, to, subject };
    }
    return { id: data?.id, to, subject };
  }

  async sendPasswordResetEmail(to: string, token: string, name?: string) {
    const baseUrl = process.env.PASSWORD_RESET_URL_BASE || 'http://localhost:5173/reset-password';
    const url = `${baseUrl}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
    const { subject, html } = passwordResetTemplate({ name, url, token });
    if (!this.resend) {
      return { message: 'RESEND_API_KEY not set', to, subject, html };
    }
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const { data, error } = await this.resend.emails.send({ from, to, subject, html });
    if (error) {
      return { error: error.message, to, subject };
    }
    return { id: data?.id, to, subject };
  }
}