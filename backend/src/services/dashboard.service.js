import Poll from '../models/Poll.js';
import logger from '../utils/logger.js';

class DashboardService {
  /**
   * Get all polls with summary data
   */
  async getAllPolls(limit = 50) {
    try {
      const polls = await Poll.find()
        .sort({ createdAt: -1 })
        .limit(limit);

      const pollsWithStatus = await Promise.all(polls.map(async (poll) => {
        const status = poll.getStatus();
        
        if (status === 'EXPIRED' && !poll.isClosed) {
          poll.isClosed = true;
          await poll.save();
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
      }));

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
