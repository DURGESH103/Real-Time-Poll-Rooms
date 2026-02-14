import pollService from '../services/poll.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Create new poll
 * POST /api/polls
 */
export const createPoll = asyncHandler(async (req, res) => {
  const { question, options, pollExpiryTime } = req.validatedData;

  const poll = await pollService.createPoll(question, options, pollExpiryTime);

  // Generate shareable URL
  const shareUrl = `${process.env.FRONTEND_URL}/poll/${poll.pollId}`;

  res.status(201).json({
    success: true,
    data: {
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      shareUrl,
      createdAt: poll.createdAt
    }
  });
});

/**
 * Get poll by ID
 * GET /api/polls/:pollId
 */
export const getPoll = asyncHandler(async (req, res) => {
  const { pollId } = req.params;

  const poll = await pollService.getPollById(pollId);

  res.status(200).json({
    success: true,
    data: poll
  });
});

/**
 * Get poll results
 * GET /api/polls/:pollId/results
 */
export const getPollResults = asyncHandler(async (req, res) => {
  const { pollId } = req.params;

  const results = await pollService.getPollResults(pollId);

  res.status(200).json({
    success: true,
    data: {
      pollId: results.pollId,
      question: results.question,
      options: results.options,
      totalVotes: results.totalVotes
    }
  });
});
