import { machaaoClient } from '../utils/machaaoClient.js';
import { logger } from '../utils/logger.js';

export async function authMiddleware(req, res, next) {
  try {
    const sessionId = req.headers['x-session-id'];

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify session exists in app-data
    const sessionKey = `session:${sessionId}`;
    
    try {
      const sessionData = await machaaoClient.getAppData(sessionKey);
      
      if (!sessionData.success || !sessionData.data) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session'
        });
      }

      req.userId = sessionId;
      req.session = sessionData.data.value;
      next();
    } catch (error) {
      logger.error('Session verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}
