/**
 * Centralized success and error messages
 * NO hardcoded messages anywhere else in the codebase
 */

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Erfolgreich angemeldet',
    REGISTER: 'Registrierung erfolgreich',
    LOGOUT: 'Erfolgreich abgemeldet',
    PROFILE_UPDATE: 'Profil erfolgreich aktualisiert',
    SERVICE_CREATE: 'Service erfolgreich erstellt',
    SERVICE_UPDATE: 'Service erfolgreich aktualisiert',
    SERVICE_DELETE: 'Service erfolgreich gelöscht',
    VOUCHER_CREATE: 'Gutschein erfolgreich erstellt',
    VOUCHER_UPDATE: 'Gutschein erfolgreich aktualisiert',
    VOUCHER_DELETE: 'Gutschein erfolgreich gelöscht',
    APPOINTMENT_CANCEL: 'Termin erfolgreich storniert',
    APPOINTMENT_RESCHEDULE: 'Termin erfolgreich verschoben',
    PAYMENT_METHOD_ADD: 'Zahlungsmethode erfolgreich hinzugefügt',
    PAYMENT_METHOD_DELETE: 'Zahlungsmethode erfolgreich gelöscht',
    FAVORITE_ADD: 'Zu Favoriten hinzugefügt',
    FAVORITE_REMOVE: 'Aus Favoriten entfernt',
    SAVE: 'Gespeichert',
    DELETE: 'Gelöscht',
  },
  ERROR: {
    NETWORK: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung',
    UNAUTHORIZED: 'Sie sind nicht autorisiert. Bitte melden Sie sich erneut an',
    FORBIDDEN: 'Sie haben keine Berechtigung für diese Aktion',
    NOT_FOUND: 'Ressource nicht gefunden',
    SERVER: 'Serverfehler. Bitte versuchen Sie es später erneut',
    VALIDATION: 'Bitte überprüfen Sie Ihre Eingaben',
    LOGIN_FAILED: 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten',
    REGISTER_FAILED: 'Registrierung fehlgeschlagen',
    LOAD_FAILED: 'Laden fehlgeschlagen',
    SAVE_FAILED: 'Speichern fehlgeschlagen',
    DELETE_FAILED: 'Löschen fehlgeschlagen',
    UNKNOWN: 'Ein unbekannter Fehler ist aufgetreten',
  },
  CONFIRM: {
    DELETE: 'Möchten Sie dies wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden',
    CANCEL_APPOINTMENT: 'Möchten Sie diesen Termin wirklich stornieren?',
    LOGOUT: 'Möchten Sie sich wirklich abmelden?',
    DELETE_ACCOUNT: 'Möchten Sie Ihr Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden',
  },
} as const;

