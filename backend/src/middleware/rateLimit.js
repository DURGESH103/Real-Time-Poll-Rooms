import rateLimit from 'express-rate-limit';

// Global rate limiter - prevent spam across all endpoints
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Vote rate limiter - strict limit on voting
export const voteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 vote attempts per poll per 10 minutes
  message: {
    success: false,
    error: {
      code: 'VOTE_RATE_LIMIT_EXCEEDED',
      message: 'Too many vote attempts. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Poll creation rate limiter
export const pollCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 polls per hour
  message: {
    success: false,
    error: {
      code: 'POLL_CREATION_LIMIT_EXCEEDED',
      message: 'Too many polls created. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
