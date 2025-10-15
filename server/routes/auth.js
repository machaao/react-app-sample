import express from 'express';
import { machaaoClient } from '../utils/machaaoClient.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Helper function to slugify session key
function slugifySessionKey(userId) {
  // Replace hyphens and special chars with underscores for cleaner keys
  return `session_${userId.replace(/-/g, '_')}`;
}

// Helper function to create session
async function createSession(userId, userData) {
  const sessionKey = slugifySessionKey(userId);
  const sessionData = {
    userId,
    email: userData.email,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  try {
    await machaaoClient.setAppData(sessionKey, sessionData, {
      ttl: 30 * 24 * 60 * 60 // 30 days
    });
    logger.info('Session created for user:', userId);
  } catch (error) {
    logger.error('Failed to create session:', error.message);
    throw new Error('Failed to create session');
  }
  
  return sessionData;
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const result = await machaaoClient.register({
      firstName,
      lastName,
      email,
      password
    });

    // Create session in app-data
    if (result.success && result.data?.user_id) {
      await createSession(result.data.user_id, { email });
    }

    logger.info('User registered:', email);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(error.message.includes('already exists') ? 409 : 500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await machaaoClient.login({ email, password });

    // Create session in app-data
    if (result.success && result.data?.user_id) {
      await createSession(result.data.user_id, { email });
    }

    logger.info('User logged in:', email);

    res.json(result);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

export default router;
