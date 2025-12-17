export enum ErrorType {
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface DomainError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
}

export const createDomainError = (type: ErrorType, message: string, originalError?: unknown): DomainError => ({
  type,
  message,
  originalError,
});

export const mapApiError = (error: any): DomainError => {
  if (error?.response) {
    const status = error.response.status;
    const msg = error.response.data?.message || 'Ein Fehler ist aufgetreten';
    
    if (status === 401 || status === 403) {
      return createDomainError(ErrorType.UNAUTHORIZED, 'Bitte melden Sie sich erneut an.', error);
    }
    if (status === 404) {
      return createDomainError(ErrorType.NOT_FOUND, 'Ressource nicht gefunden.', error);
    }
    if (status >= 500) {
      return createDomainError(ErrorType.SERVER, 'Serverfehler. Bitte versuchen Sie es später erneut.', error);
    }
    return createDomainError(ErrorType.VALIDATION, msg, error);
  }
  
  if (error?.message === 'Network Error' || !error?.response) {
    return createDomainError(ErrorType.NETWORK, 'Keine Internetverbindung.', error);
  }
  
  return createDomainError(ErrorType.UNKNOWN, 'Ein unbekannter Fehler ist aufgetreten.', error);
};
