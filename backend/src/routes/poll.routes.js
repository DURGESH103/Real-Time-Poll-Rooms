import express from 'express';
import { createPoll, getPoll, getPollResults } from '../controllers/poll.controller.js';
import { getAllPolls } from '../controllers/dashboard.controller.js';
import { validate, createPollSchema } from '../middleware/validation.js';
import { pollCreationLimiter } from '../middleware/rateLimit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/:pollId', getPoll);
router.get('/:pollId/results', getPollResults);

// Protected routes (auth required)
router.get('/', protect, getAllPolls);
router.post('/', protect, pollCreationLimiter, validate(createPollSchema), createPoll);

export default router;
