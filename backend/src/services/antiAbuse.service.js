import Vote from '../models/Vote.js';
import logger from '../utils/logger.js';

/**
 * Anti-Abuse Service
 * Implements two mechanisms:
 * 1. Device fingerprint checking
 * 2. IP-based rate limiting
 */

class AntiAbuseService {
  /**
   * Check if fingerprint has already voted for this poll
   * Mechanism 1: Device Fingerprint Tracking
   */
  async checkFingerprintVoted(pollId, fingerprint) {
    try {
      const existingVote = await Vote.findOne({ pollId, fingerprint });
      
      if (existingVote) {
        logger.warn(`Duplicate vote attempt - Poll: ${pollId}, Fingerprint: ${fingerprint.substring(0, 8)}...`);
        return {
          allowed: false,
          reason: 'ALREADY_VOTED',
          message: 'You have already voted in this poll'
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking fingerprint:', error);
      throw error;
    }
  }

  /**
   * Check if IP has exceeded vote limit for this poll
   * Mechanism 2: IP-Based Rate Limiting (removed - now using middleware)
   */
  async checkIpVoteLimit(pollId, ip) {
    // This check is now handled by ipRateLimitPerPoll middleware
    // Keeping method for backward compatibility
    return { allowed: true };
  }

  /**
   * Check global IP rate limit (across all polls)
   * Additional protection against spam
   */
  async checkGlobalIpRateLimit(ip) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentVotes = await Vote.countDocuments({
        ip,
        votedAt: { $gte: oneHourAgo }
      });

      const maxVotesPerHour = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10;

      if (recentVotes >= maxVotesPerHour) {
        logger.warn(`Global IP rate limit exceeded - IP: ${ip}, Votes: ${recentVotes}`);
        return {
          allowed: false,
          reason: 'GLOBAL_RATE_LIMIT',
          message: 'Too many votes from your network. Please try again later.'
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking global rate limit:', error);
      throw error;
    }
  }

  /**
   * Comprehensive vote validation
   * Runs all anti-abuse checks
   */
  async validateVote(pollId, fingerprint, ip) {
    // Check 1: Fingerprint duplicate
    const fingerprintCheck = await this.checkFingerprintVoted(pollId, fingerprint);
    if (!fingerprintCheck.allowed) {
      return fingerprintCheck;
    }

    // Check 2: Global IP rate limit
    const globalCheck = await this.checkGlobalIpRateLimit(ip);
    if (!globalCheck.allowed) {
      return globalCheck;
    }

    return { allowed: true };
  }
}

export default new AntiAbuseService();
