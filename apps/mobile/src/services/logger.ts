/**
 * Centralized Logging Service
 * Replaces all console.log/error/warn statements
 * Follows clean architecture - presentation layer utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = typeof __DEV__ !== 'undefined' && __DEV__;

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.isDev && level === 'debug') return;

    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = new Date().toISOString();

    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.log(prefix, timestamp, message, ...args);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(prefix, timestamp, message, ...args);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(prefix, timestamp, message, ...args);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(prefix, timestamp, message, ...args);
        break;
    }

    // In production, send to logging service
    if (!this.isDev && (level === 'error' || level === 'warn')) {
      // TODO: Integrate with crash reporting service (e.g., Sentry)
      // this.sendToLoggingService(level, message, args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();

