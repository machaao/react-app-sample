import express from 'express';
import { machaaoClient } from '../utils/machaaoClient.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

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
