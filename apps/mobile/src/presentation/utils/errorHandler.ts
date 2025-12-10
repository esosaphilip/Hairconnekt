/**
 * Error Handler Utility
 * Presentation layer - converts domain errors to user-friendly messages
 */

import { DomainError, ValidationError, NotFoundError, NetworkError, UnauthorizedError } from '@/domain/errors/DomainError';
import { MESSAGES } from '@/constants';
import { Alert } from 'react-native';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  if (error instanceof NotFoundError) {
    return MESSAGES.ERROR.NOT_FOUND;
  }
  if (error instanceof UnauthorizedError) {
    return MESSAGES.ERROR.UNAUTHORIZED;
  }
  if (error instanceof NetworkError) {
    const details = (error as { details?: Record<string, unknown> }).details || {};
    const original = (details as Record<string, unknown>)['originalError'] as Record<string, unknown> | undefined;
    const response = original && typeof original === 'object' ? (original['response'] as Record<string, unknown> | undefined) : undefined;
    const status = response && typeof response === 'object' ? (response['status'] as number | undefined) : undefined;
    const data = response && typeof response === 'object' ? (response['data'] as Record<string, unknown> | undefined) : undefined;
    const msgFromData = data && typeof data === 'object' ? (data['message'] as string | undefined) : undefined;
    const msgFromOriginal = original && typeof original === 'object' ? (original['message'] as string | undefined) : undefined;
    if (status === 401) return MESSAGES.ERROR.UNAUTHORIZED;
    if (status === 403) return MESSAGES.ERROR.FORBIDDEN;
    if (status === 404) return MESSAGES.ERROR.NOT_FOUND;
    if (typeof status === 'number' && status >= 500) return MESSAGES.ERROR.SERVER;
    if (typeof msgFromData === 'string' && msgFromData.trim()) return msgFromData;
    if (typeof msgFromOriginal === 'string' && msgFromOriginal.trim()) return msgFromOriginal;
    if (typeof error.message === 'string' && error.message.trim()) return error.message;
    return MESSAGES.ERROR.NETWORK;
  }
  if (error instanceof DomainError) {
    return error.message;
  }
  if (error && typeof error === 'object') {
    const base = (error as Record<string, unknown>)['message'];
    if (typeof base === 'string') return base;
    const resp = (error as Record<string, unknown>)['response'];
    if (resp && typeof resp === 'object') {
      const data = (resp as Record<string, unknown>)['data'];
      if (data && typeof data === 'object') {
        const msg = (data as Record<string, unknown>)['message'];
        if (typeof msg === 'string') return msg;
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return MESSAGES.ERROR.UNKNOWN;
}

export function showError(error: unknown, customMessage?: string): void {
  const m = customMessage ?? getErrorMessage(error);
  const message = typeof m === 'string' ? m : MESSAGES.ERROR.UNKNOWN;
  Alert.alert('Fehler', message);
}

export function showSuccess(message: string): void {
  Alert.alert('Erfolg', String(message));
}
