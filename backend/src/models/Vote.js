import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  pollId: {
    type: String,
    required: true,
    index: true
  },
  optionId: {
    type: String,
    required: true
  },
  fingerprint: {
    type: String,
    required: true,
    length: 64
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  votedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    country: String,
    city: String
  }
});

// Compound index: Prevent duplicate votes from same fingerprint
voteSchema.index({ pollId: 1, fingerprint: 1 }, { unique: true });

// Compound index: IP-based rate limiting checks
voteSchema.index({ pollId: 1, ip: 1 });

// TTL Index - auto-delete old votes
voteSchema.index(
  { votedAt: 1 }, 
  { expireAfterSeconds: (process.env.POLL_TTL_DAYS || 30) * 24 * 60 * 60 }
);

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
