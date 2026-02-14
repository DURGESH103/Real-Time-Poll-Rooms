// In-memory store for IP rate limiting per poll
// Key format: "pollId:ip" -> array of timestamps
const voteAttempts = new Map();

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/**
 * Extract client IP from request
 * Handles proxy headers and fallbacks
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Clean up old entries from rate limit store
 */
const cleanupOldEntries = () => {
  const now = Date.now();
  for (const [key, timestamps] of voteAttempts.entries()) {
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (validTimestamps.length === 0) {
      voteAttempts.delete(key);
    } else {
      voteAttempts.set(key, validTimestamps);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupOldEntries, 5 * 60 * 1000);

/**
 * IP-based rate limiting middleware for vote attempts
 * Limits vote attempts per IP per poll
 */
export const ipRateLimitPerPoll = (req, res, next) => {
  const { pollId } = req.validatedData || req.body;
  const ip = getClientIp(req);
  
  if (!pollId || ip === 'unknown') {
    return next();
  }

  const key = `${pollId}:${ip}`;
  const now = Date.now();
  
  // Get existing attempts for this poll + IP combo
  let attempts = voteAttempts.get(key) || [];
  
  // Filter out attempts outside the time window
  attempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  // Check if limit exceeded
  if (attempts.length >= MAX_ATTEMPTS) {
    const oldestAttempt = Math.min(...attempts);
    const timeUntilReset = Math.ceil((RATE_LIMIT_WINDOW - (now - oldestAttempt)) / 1000 / 60);
    
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many vote attempts from this network. Try again in ${timeUntilReset} minutes.`
      }
    });
  }
  
  // Record this attempt
  attempts.push(now);
  voteAttempts.set(key, attempts);
  
  next();
};
