const isDevelopment = import.meta.env.MODE === 'development';

class ClientLogger {
  constructor() {
    this.sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'session'];
  }

  info(...args) {
    if (isDevelopment) {
      console.log('[INFO]', new Date().toISOString(), ...args);
    }
  }

  error(...args) {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  }

  warn(...args) {
    if (isDevelopment) {
      console.warn('[WARN]', new Date().toISOString(), ...args);
    }
  }

  debug(...args) {
    if (isDevelopment) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }

  // Filter sensitive data from objects
  filterSensitiveData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.filterSensitiveData(item));
    }

    const filtered = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (this.sensitiveFields.some(field => lowerKey.includes(field))) {
        filtered[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        filtered[key] = this.filterSensitiveData(value);
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  // Log API call
  logApiCall(method, endpoint, options = {}, correlationId) {
    const logData = {
      correlationId,
      method,
      endpoint,
      timestamp: new Date().toISOString()
    };

    if (options.body) {
      try {
        const body = JSON.parse(options.body);
        logData.body = this.filterSensitiveData(body);
      } catch (e) {
        // Body is not JSON
      }
    }

    if (options.headers) {
      logData.headers = this.filterSensitiveData(options.headers);
    }

    this.debug('API Request:', JSON.stringify(logData, null, 2));
  }

  // Log API response
  logApiResponse(method, endpoint, status, duration, correlationId, data = null, error = null) {
    const logData = {
      correlationId,
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logData.error = error.message || error;
      this.error('API Response Error:', JSON.stringify(logData, null, 2));
    } else {
      if (data && isDevelopment) {
        logData.data = this.filterSensitiveData(data);
      }
      this.debug('API Response:', JSON.stringify(logData, null, 2));
    }
  }

  // Generate correlation ID
  generateCorrelationId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const clientLogger = new ClientLogger();
