import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import { logger } from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MACHAAO_API_BASE_URL',
  'MACHAAO_APP_ID',
  'MACHAAO_API_TOKEN',
  'MACHAAO_DEVELOPER_TOKEN'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  logger.error('Please check your .env file and ensure all MACHAAO credentials are configured.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for MACHAAO cloud platform
app.set('trust proxy', 1);

// CORS configuration with proper wildcard handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (isProduction) {
      // Check if origin matches MACHAAO domains
      const allowedPatterns = [
        /^https:\/\/.*\.dev\.apps\.machaao\.com$/,
        /^https:\/\/.*\.apps\.machaao\.com$/,
        /^https:\/\/.*\.machaao\.com$/
      ];
      
      const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: allow localhost
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in development
      }
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (after body parsers, before routes)
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'machaao-todo-api',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Serve static files in production
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 MACHAAO Todo API server running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API Base URL: ${process.env.MACHAAO_API_BASE_URL}`);
  if (isProduction) {
    logger.info(`📦 Serving static files from dist/`);
  }
});

export default app;
