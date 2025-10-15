const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
  constructor() {
    this.sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'session'];
  }

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

  // Log HTTP request
  logRequest(req, correlationId) {
    const requestData = {
      correlationId,
      method: req.method,
      path: req.path,
      query: this.filterSensitiveData(req.query),
      headers: this.filterSensitiveData(req.headers),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    };

    // Only log body in development and for non-GET requests
    if (isDevelopment && req.method !== 'GET' && req.body) {
      requestData.body = this.filterSensitiveData(req.body);
    }

    this.info('HTTP Request:', JSON.stringify(requestData, null, 2));
  }

  // Log HTTP response
  logResponse(req, res, responseTime, correlationId) {
    const responseData = {
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    const logLevel = res.statusCode >= 500 ? 'error' : 
                     res.statusCode >= 400 ? 'warn' : 'info';

    this[logLevel]('HTTP Response:', JSON.stringify(responseData, null, 2));
  }

  // Log API call (for client-side logging via server endpoint)
  logApiCall(endpoint, method, status, duration, correlationId, error = null) {
    const apiCallData = {
      correlationId,
      endpoint,
      method,
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    if (error) {
      apiCallData.error = error.message || error;
      this.error('API Call Failed:', JSON.stringify(apiCallData, null, 2));
    } else {
      this.info('API Call:', JSON.stringify(apiCallData, null, 2));
    }
  }

  // Generate correlation ID
  generateCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const logger = new Logger();
