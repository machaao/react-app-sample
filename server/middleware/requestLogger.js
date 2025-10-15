import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  // Generate correlation ID for this request
  const correlationId = logger.generateCorrelationId();
  
  // Attach correlation ID to request object
  req.correlationId = correlationId;
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Record request start time
  const startTime = Date.now();
  
  // Log incoming request
  logger.logRequest(req, correlationId);
  
  // Capture the original res.json to log response body
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    // Store response body for logging
    res.responseBody = body;
    return originalJson(body);
  };
  
  // Log response when finished
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logResponse(req, res, responseTime, correlationId);
  });
  
  next();
}
