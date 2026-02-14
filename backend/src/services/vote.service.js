import Vote from '../models/Vote.js';
import logger from '../utils/logger.js';

class VoteService {
  /**
   * Record vote in database
   */
  async recordVote(pollId, optionId, fingerprint, ip, userAgent) {
    try {
      const vote = new Vote({
        pollId,
        optionId,
        fingerprint,
        ip,
        userAgent,
        votedAt: new Date()
      });

      await vote.save();
      
      logger.info(`Vote saved - Poll: ${pollId}, Option: ${optionId}`);
      
      return vote;
    } catch (error) {
      // Handle duplicate vote error
      if (error.code === 11000) {
        const duplicateError = new Error('Vote already recorded');
        duplicateError.statusCode = 409;
        duplicateError.code = 'DUPLICATE_VOTE';
        throw duplicateError;
      }
      
      logger.error('Error recording vote:', error);
      throw error;
    }
  }

  /**
   * Get vote statistics for a poll
   */
  async getVoteStats(pollId) {
    try {
      const stats = await Vote.aggregate([
        { $match: { pollId } },
        {
          $group: {
            _id: '$optionId',
            count: { $sum: 1 }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Error fetching vote stats:', error);
      throw error;
    }
  }

  /**
   * Check if fingerprint has voted
   */
  async hasVoted(pollId, fingerprint) {
    try {
      const vote = await Vote.findOne({ pollId, fingerprint });
      return !!vote;
    } catch (error) {
      logger.error('Error checking vote status:', error);
      throw error;
    }
  }
}

export default new VoteService();
