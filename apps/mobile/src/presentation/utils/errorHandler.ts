/**
 * Error Handler Utility
 * Presentation layer - converts domain errors to user-friendly messages
 */

import { DomainError, ErrorType } from '@/domain/errors/DomainError';
import { MESSAGES } from '@/constants';
import { Alert } from 'react-native';

export function getErrorMessage(error: unknown): string {
  // If it's already a DomainError object (checked via 'type' property existence and valid enum value)
  if (isDomainError(error)) {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.message;
      case ErrorType.NOT_FOUND:
        return MESSAGES.ERROR.NOT_FOUND;
      case ErrorType.UNAUTHORIZED:
        return MESSAGES.ERROR.UNAUTHORIZED;
      case ErrorType.NETWORK:
        return MESSAGES.ERROR.NETWORK;
      case ErrorType.SERVER:
        return MESSAGES.ERROR.SERVER;
      case ErrorType.UNKNOWN:
      default:
        return error.message || MESSAGES.ERROR.UNKNOWN;
    }
  }

  // Fallback for legacy Error objects
  if (error instanceof Error) {
    return error.message;
  }

  return MESSAGES.ERROR.UNKNOWN;
}

// Type Guard
function isDomainError(error: any): error is DomainError {
  return error && typeof error === 'object' && 'type' in error && 'message' in error;
}

export function showError(error: unknown, customMessage?: string): void {
  const m = customMessage ?? getErrorMessage(error);
  const message = typeof m === 'string' ? m : MESSAGES.ERROR.UNKNOWN;
  Alert.alert('Fehler', message);
}

export function showSuccess(message: string): void {
  Alert.alert('Erfolg', String(message));
}
