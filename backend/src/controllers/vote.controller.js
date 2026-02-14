import pollService from '../services/poll.service.js';
import voteService from '../services/vote.service.js';
import antiAbuseService from '../services/antiAbuse.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Submit vote
 * POST /api/vote
 */
export const submitVote = asyncHandler(async (req, res) => {
  console.log('Vote request body:', JSON.stringify(req.body));
  console.log('Validated data:', JSON.stringify(req.validatedData));
  
  const { pollId, optionId, fingerprint } = req.validatedData;
  
  // Get client IP
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.connection.remoteAddress || 'unknown');
  const userAgent = req.get('user-agent') || '';

  // Step 1: Verify poll exists and option is valid
  const poll = await pollService.getPollById(pollId);
  
  const validOption = poll.options.find(opt => opt.id === optionId);
  if (!validOption) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_OPTION',
        message: 'Selected option does not exist'
      }
    });
  }

  // Step 2: Run anti-abuse checks
  const abuseCheck = await antiAbuseService.validateVote(pollId, fingerprint, ip);
  
  if (!abuseCheck.allowed) {
    return res.status(403).json({
      success: false,
      error: {
        code: abuseCheck.reason,
        message: abuseCheck.message
      }
    });
  }

  // Step 3: Record vote in votes collection
  await voteService.recordVote(pollId, optionId, fingerprint, ip, userAgent);

  // Step 4: Increment vote count in poll document (atomic)
  const updatedPoll = await pollService.incrementVote(pollId, optionId);

  // Step 5: Emit socket event (handled by socket.io in server.js)
  req.app.get('io').to(pollId).emit('voteUpdate', {
    pollId: updatedPoll.pollId,
    options: updatedPoll.options,
    totalVotes: updatedPoll.totalVotes
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Vote recorded successfully',
      poll: {
        pollId: updatedPoll.pollId,
        options: updatedPoll.options,
        totalVotes: updatedPoll.totalVotes
      }
    }
  });
});

/**
 * Check if user has voted
 * POST /api/vote/check
 */
export const checkVoteStatus = asyncHandler(async (req, res) => {
  const { pollId, fingerprint } = req.body;

  const hasVoted = await voteService.hasVoted(pollId, fingerprint);

  res.status(200).json({
    success: true,
    data: { hasVoted }
  });
});
