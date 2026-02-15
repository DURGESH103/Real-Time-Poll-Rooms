import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import pollRoutes from './routes/poll.routes.js';
import voteRoutes from './routes/vote.routes.js';
import logger from './utils/logger.js';

// Initialize Express app
const app = express();
const server = createServer(app);

/* ======================================================
   ✅ DEFINE ALLOWED ORIGINS FIRST (VERY IMPORTANT)
====================================================== */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_URL
].filter(Boolean);

/* ======================================================
   ✅ CORS CONFIGURATION (MULTI DOMAIN + VERCEL SAFE)
====================================================== */

const corsOptions = {
  origin: (origin, callback) => {

    // Allow Postman / server-to-server / health checks
    if (!origin) return callback(null, true);

    // Allow listed domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow ALL Vercel preview domains
    if (typeof origin === "string" && origin.includes(".vercel.app")) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

// Apply CORS
app.use(cors(corsOptions));

/* ======================================================
   ✅ SOCKET INIT AFTER ALLOWED ORIGINS EXISTS
====================================================== */

const io = initializeSocket(server, allowedOrigins);
app.set('io', io);

/* ======================================================
   ✅ SECURITY + MIDDLEWARE
====================================================== */

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(globalLimiter);

/* ======================================================
   ✅ HEALTH CHECK
====================================================== */

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/* ======================================================
   ✅ ROUTES
====================================================== */

app.use('/api/polls', pollRoutes);
app.use('/api/vote', voteRoutes);

/* ======================================================
   ✅ ERROR HANDLING
====================================================== */

app.use(notFoundHandler);
app.use(errorHandler);

/* ======================================================
   ✅ START SERVER
====================================================== */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/* ======================================================
   ✅ PROCESS SAFETY
====================================================== */

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();
