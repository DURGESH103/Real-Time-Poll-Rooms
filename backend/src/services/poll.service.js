import { nanoid } from 'nanoid';
import Poll from '../models/Poll.js';
import logger from '../utils/logger.js';

class PollService {
  /**
   * Create new poll
   */
  async createPoll(question, options, pollExpiryTime) {
    try {
      const pollId = nanoid(9);

      const formattedOptions = options.map((text, index) => ({
        id: index.toString(),
        text: text.trim(),
        votes: 0
      }));
      
      let expiryTime = pollExpiryTime;
      if (!expiryTime) {
        expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + 7);
      }

      const poll = new Poll({
        pollId,
        question: question.trim(),
        options: formattedOptions,
        totalVotes: 0,
        pollExpiryTime: expiryTime,
        isClosed: false
      });

      await poll.save();
      
      logger.info(`Poll created: ${pollId}`);
      
      return poll;
    } catch (error) {
      logger.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Get poll by ID
   */
  async getPollById(pollId) {
    try {
      const poll = await Poll.findOne({ pollId }).lean();
      
      if (!poll) {
        const error = new Error('Poll not found');
        error.statusCode = 404;
        error.code = 'POLL_NOT_FOUND';
        throw error;
      }

      return poll;
    } catch (error) {
      if (!error.statusCode) {
        logger.error('Error fetching poll:', error);
      }
      throw error;
    }
  }

  /**
   * Increment vote count for option (atomic operation)
   */
  async incrementVote(pollId, optionId) {
    try {
      const result = await Poll.findOneAndUpdate(
        { 
          pollId,
          'options.id': optionId 
        },
        { 
          $inc: { 
            'options.$.votes': 1,
            totalVotes: 1
          }
        },
        { 
          new: true,
          runValidators: true 
        }
      ).lean();

      if (!result) {
        const error = new Error('Poll or option not found');
        error.statusCode = 404;
        error.code = 'INVALID_POLL_OR_OPTION';
        throw error;
      }

      logger.info(`Vote recorded - Poll: ${pollId}, Option: ${optionId}`);
      
      return result;
    } catch (error) {
      logger.error('Error incrementing vote:', error);
      throw error;
    }
  }

  /**
   * Get poll results (same as getPollById, but explicit naming)
   */
  async getPollResults(pollId) {
    return this.getPollById(pollId);
  }
}

export default new PollService();
