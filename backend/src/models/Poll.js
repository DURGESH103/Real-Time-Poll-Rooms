import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true, maxlength: 100 },
  votes: { type: Number, default: 0, min: 0 }
}, { _id: false });

const pollSchema = new mongoose.Schema({
  pollId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 200,
    trim: true
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: (v) => v.length >= 2 && v.length <= 10,
      message: 'Poll must have between 2 and 10 options'
    }
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  pollExpiryTime: {
    type: Date,
    default: null
  },
  isClosed: {
    type: Boolean,
    default: false
  }
});

// TTL Index - auto-delete polls after configured days
pollSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: (process.env.POLL_TTL_DAYS || 30) * 24 * 60 * 60,
    partialFilterExpression: { expiresAt: null }
  }
);

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
