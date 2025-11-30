import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import nodemailer, { Transporter } from 'nodemailer';
import { welcomeTemplate, bookingConfirmationTemplate, reminderTemplate, verificationCodeTemplate, passwordResetTemplate } from './templates';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private smtp: Transporter | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    const host = process.env.SMTP_HOST || '';
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
    if (host && user && pass) {
      this.smtp = nodemailer.createTransport({ host, port, auth: { user, pass }, secure });
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const { subject, html } = welcomeTemplate({ name });
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'noreply@hairconnekt.de';
    if (this.smtp) {
      const info = await this.smtp.sendMail({ from, to, subject, html });
      return { id: info.messageId, to, subject };
    }
    if (this.resend) {
      const { data, error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) return { error: error.message, to, subject };
      return { id: data?.id, to, subject };
    }
    return { message: 'Email provider not configured', to, subject, html };
  }

  async sendBookingConfirmation(to: string, bookingId: string, date: string) {
    const { subject, html } = bookingConfirmationTemplate({ bookingId, date });
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'noreply@hairconnekt.de';
    if (this.smtp) {
      const info = await this.smtp.sendMail({ from, to, subject, html });
      return { id: info.messageId, to, subject };
    }
    if (this.resend) {
      const { data, error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) return { error: error.message, to, subject };
      return { id: data?.id, to, subject };
    }
    return { message: 'Email provider not configured', to, subject, html };
  }

  async sendReminder(to: string, appointmentId: string, when: string) {
    const { subject, html } = reminderTemplate({ appointmentId, when });
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'noreply@hairconnekt.de';
    if (this.smtp) {
      const info = await this.smtp.sendMail({ from, to, subject, html });
      return { id: info.messageId, to, subject };
    }
    if (this.resend) {
      const { data, error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) return { error: error.message, to, subject };
      return { id: data?.id, to, subject };
    }
    return { message: 'Email provider not configured', to, subject, html };
  }

  async sendVerificationCodeEmail(to: string, code: string, name?: string) {
    const { subject, html } = verificationCodeTemplate({ name, code });
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'noreply@hairconnekt.de';
    if (this.smtp) {
      const info = await this.smtp.sendMail({ from, to, subject, html });
      return { id: info.messageId, to, subject };
    }
    if (this.resend) {
      const { data, error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) return { error: error.message, to, subject };
      return { id: data?.id, to, subject };
    }
    return { message: 'Email provider not configured', to, subject, html };
  }

  async sendPasswordResetEmail(to: string, token: string, name?: string) {
    const baseUrl = process.env.PASSWORD_RESET_URL_BASE || 'http://localhost:5173/reset-password';
    const url = `${baseUrl}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
    const { subject, html } = passwordResetTemplate({ name, url, token });
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'noreply@hairconnekt.de';
    if (this.resend) {
      const { data, error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) return { error: error.message, to, subject };
      return { id: data?.id, to, subject };
    }
    if (this.smtp) {
      const info = await this.smtp.sendMail({ from, to, subject, html });
      return { id: info.messageId, to, subject };
    }
    return { message: 'Email provider not configured', to, subject, html };
  }
}
