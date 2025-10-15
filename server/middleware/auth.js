import { machaaoClient } from '../utils/machaaoClient.js';
import { logger } from '../utils/logger.js';

export async function authMiddleware(req, res, next) {
  try {
    const sessionId = req.headers['x-session-id'];

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Verify session exists in app-data
    const sessionKey = `session:${sessionId}`;
    
    try {
      const sessionData = await machaaoClient.getAppData(sessionKey);
      
      if (!sessionData.success || !sessionData.data || !sessionData.data.value) {
        logger.warn('Invalid session attempt:', sessionId);
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.'
        });
      }

      // Update last activity timestamp
      const updatedSession = {
        ...sessionData.data.value,
        lastActivity: new Date().toISOString()
      };
      
      // Update session asynchronously (don't wait)
      machaaoClient.setAppData(sessionKey, updatedSession, {
        ttl: 30 * 24 * 60 * 60
      }).catch(err => logger.error('Failed to update session activity:', err));

      req.userId = sessionId;
      req.session = sessionData.data.value;
      next();
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
        logger.warn('Session not found:', sessionId);
        return res.status(401).json({
          success: false,
          message: 'Session not found. Please log in again.'
        });
      }
      
      logger.error('Session verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid session. Please log in again.'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }
}
