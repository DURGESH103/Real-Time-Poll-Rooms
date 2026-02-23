import express from 'express';
import { submitVote, checkVoteStatus } from '../controllers/vote.controller.js';
import { validate, voteSchema } from '../middleware/validation.js';
import { voteLimiter } from '../middleware/rateLimit.js';
import { ipRateLimitPerPoll } from '../middleware/ipRateLimit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Submit vote
router.post('/', voteLimiter, validate(voteSchema), ipRateLimitPerPoll, submitVote);

// Check vote status
router.post('/check', checkVoteStatus);

export default router;
