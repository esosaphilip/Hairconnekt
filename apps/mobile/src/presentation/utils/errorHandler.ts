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
  if (error instanceof NetworkError) {
    return MESSAGES.ERROR.NETWORK;
  }
  if (error instanceof UnauthorizedError) {
    return MESSAGES.ERROR.UNAUTHORIZED;
  }
  if (error instanceof DomainError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return MESSAGES.ERROR.UNKNOWN;
}

export function showError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  Alert.alert('Fehler', message);
}

export function showSuccess(message: string): void {
  Alert.alert('Erfolg', message);
}
