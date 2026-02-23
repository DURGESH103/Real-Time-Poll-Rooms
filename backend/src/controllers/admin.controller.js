import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';

// Get all polls (admin view)
export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    
    // Get vote counts for each poll
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll) => {
        const voteCount = await Vote.countDocuments({ pollId: poll.pollId });
        return {
          ...poll.toObject(),
          totalVotes: voteCount
        };
      })
    );

    res.status(200).json({
      success: true,
      polls: pollsWithVotes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete poll
export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findOne({ pollId });
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Delete poll and associated votes
    await Poll.deleteOne({ pollId });
    await Vote.deleteMany({ pollId });

    res.status(200).json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get system stats
export const getStats = async (req, res) => {
  try {
    const totalPolls = await Poll.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const recentPolls = await Poll.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('pollId question createdAt');

    res.status(200).json({
      success: true,
      stats: {
        totalPolls,
        totalVotes,
        totalUsers,
        recentPolls
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
