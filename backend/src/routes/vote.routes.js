import express from 'express';
import { submitVote, checkVoteStatus } from '../controllers/vote.controller.js';
import { validate, voteSchema } from '../middleware/validation.js';
import { voteLimiter } from '../middleware/rateLimit.js';
import { ipRateLimitPerPoll } from '../middleware/ipRateLimit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', protect, voteLimiter, validate(voteSchema), ipRateLimitPerPoll, submitVote);
router.post('/check', protect, checkVoteStatus);

export default router;
