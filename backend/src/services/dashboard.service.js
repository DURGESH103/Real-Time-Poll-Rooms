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
        .limit(limit)
        .lean();

      return polls.map(poll => ({
        pollId: poll.pollId,
        question: poll.question,
        totalVotes: poll.totalVotes,
        options: poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes
        })),
        createdAt: poll.createdAt,
        isActive: true // All polls are active in this system
      }));
    } catch (error) {
      logger.error('Error fetching all polls:', error);
      throw error;
    }
  }
}

export default new DashboardService();
