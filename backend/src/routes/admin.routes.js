import express from 'express';
import { getAllPolls, deletePoll, getStats } from '../controllers/admin.controller.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

router.get('/polls', getAllPolls);
router.delete('/polls/:pollId', deletePoll);
router.get('/stats', getStats);

export default router;
