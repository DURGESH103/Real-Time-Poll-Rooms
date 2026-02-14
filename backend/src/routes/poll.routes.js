import express from 'express';
import { createPoll, getPoll, getPollResults } from '../controllers/poll.controller.js';
import { getAllPolls } from '../controllers/dashboard.controller.js';
import { validate, createPollSchema } from '../middleware/validation.js';
import { pollCreationLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Get all polls (dashboard)
router.get('/', getAllPolls);

// Create poll
router.post('/', pollCreationLimiter, validate(createPollSchema), createPoll);

// Get poll by ID
router.get('/:pollId', getPoll);

// Get poll results
router.get('/:pollId/results', getPollResults);

export default router;
