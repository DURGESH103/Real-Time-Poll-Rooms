import Poll from '../models/Poll.js';
import logger from '../utils/logger.js';

class DashboardService {
  /**
   * Get all polls with summary data (optimized)
   */
  async getAllPolls(limit = 100) {
    try {
      // Optimized query with lean() for faster reads
      const polls = await Poll.find()
        .select('pollId question totalVotes options createdAt pollExpiryTime isClosed')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const now = Date.now();
      const pollsWithStatus = polls.map((poll) => {
        // Calculate status inline without model method
        const timeLeft = poll.pollExpiryTime - now;
        let status = 'LIVE';
        
        if (poll.isClosed) {
          status = 'CLOSED';
        } else if (timeLeft <= 0) {
          status = 'EXPIRED';
        } else if (timeLeft <= 3600000) {
          status = 'ENDING_SOON';
        }

        return {
          pollId: poll.pollId,
          question: poll.question,
          totalVotes: poll.totalVotes,
          options: poll.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: opt.votes
          })),
          createdAt: poll.createdAt,
          pollExpiryTime: poll.pollExpiryTime,
          isClosed: poll.isClosed,
          status
        };
      });

      // Sort by status priority
      const statusOrder = { LIVE: 0, ENDING_SOON: 1, EXPIRED: 2, CLOSED: 3 };
      pollsWithStatus.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

      return pollsWithStatus;
    } catch (error) {
      logger.error('Error fetching all polls:', error);
      throw error;
    }
  }
}

export default new DashboardService();
