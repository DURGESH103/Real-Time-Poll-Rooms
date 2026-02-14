import dashboardService from '../services/dashboard.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all polls for dashboard
 * GET /api/polls
 */
export const getAllPolls = asyncHandler(async (req, res) => {
  const polls = await dashboardService.getAllPolls();

  res.status(200).json({
    success: true,
    data: polls
  });
});
