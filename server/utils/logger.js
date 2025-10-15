const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
  info(...args) {
    console.log('[INFO]', new Date().toISOString(), ...args);
  }

  error(...args) {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  }

  warn(...args) {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  }

  debug(...args) {
    if (isDevelopment) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }
}

export const logger = new Logger();
