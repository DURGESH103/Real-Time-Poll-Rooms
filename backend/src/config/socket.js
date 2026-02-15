import { Server } from 'socket.io';
import logger from '../utils/logger.js';

export const initializeSocket = (server, allowedOrigins = []) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        if (origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join poll room
    socket.on('joinPoll', (pollId) => {
      if (!pollId) {
        logger.warn(`Invalid pollId for socket ${socket.id}`);
        return;
      }

      socket.join(pollId);
      logger.info(`Socket ${socket.id} joined poll room: ${pollId}`);

      // Send confirmation
      socket.emit('joinedPoll', { pollId });
    });

    // Leave poll room
    socket.on('leavePoll', (pollId) => {
      if (!pollId) return;
      
      socket.leave(pollId);
      logger.info(`Socket ${socket.id} left poll room: ${pollId}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('✅ Socket.io initialized');

  return io;
};

/**
 * Broadcast vote update to all clients in poll room
 * Called from vote controller after successful vote
 */
export const broadcastVoteUpdate = (io, pollId, pollData) => {
  io.to(pollId).emit('voteUpdate', {
    pollId: pollData.pollId,
    options: pollData.options,
    totalVotes: pollData.totalVotes,
    timestamp: new Date().toISOString()
  });
  
  logger.debug(`Vote update broadcasted to room: ${pollId}`);
};
