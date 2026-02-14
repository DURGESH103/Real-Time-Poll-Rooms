# 🚀 Quick Reference Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [API Endpoints](#api-endpoints)
3. [Socket Events](#socket-events)
4. [Environment Variables](#environment-variables)
5. [Common Commands](#common-commands)
6. [Troubleshooting](#troubleshooting)
7. [Code Snippets](#code-snippets)

---

## Quick Start

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start MongoDB (local or Atlas)
mongod  # or use Atlas connection string

# 4. Run backend (Terminal 1)
cd backend && npm run dev

# 5. Run frontend (Terminal 2)
cd frontend && npm run dev

# 6. Open browser
http://localhost:5173
```

---

## API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend.onrender.com/api
```

### Endpoints

#### 1. Create Poll
```http
POST /polls
Content-Type: application/json

{
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green"]
}

Response 201:
{
  "success": true,
  "data": {
    "pollId": "x7k9mP2qL",
    "question": "What's your favorite color?",
    "options": [...],
    "shareUrl": "http://localhost:5173/poll/x7k9mP2qL",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get Poll
```http
GET /polls/:pollId

Response 200:
{
  "success": true,
  "data": {
    "pollId": "x7k9mP2qL",
    "question": "What's your favorite color?",
    "options": [
      { "id": "0", "text": "Red", "votes": 5 },
      { "id": "1", "text": "Blue", "votes": 3 },
      { "id": "2", "text": "Green", "votes": 2 }
    ],
    "totalVotes": 10
  }
}
```

#### 3. Submit Vote
```http
POST /vote
Content-Type: application/json

{
  "pollId": "x7k9mP2qL",
  "optionId": "0",
  "fingerprint": "a3f5e8d9c2b1a0f4e7d6c5b4a3f2e1d0..."
}

Response 200:
{
  "success": true,
  "data": {
    "message": "Vote recorded successfully",
    "poll": { ... }
  }
}
```

#### 4. Check Vote Status
```http
POST /vote/check
Content-Type: application/json

{
  "pollId": "x7k9mP2qL",
  "fingerprint": "a3f5e8d9c2b1a0f4e7d6c5b4a3f2e1d0..."
}

Response 200:
{
  "success": true,
  "data": {
    "hasVoted": true
  }
}
```

#### 5. Health Check
```http
GET /health

Response 200:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Socket Events

### Client → Server

#### Join Poll Room
```javascript
socket.emit('joinPoll', pollId);
```

#### Leave Poll Room
```javascript
socket.emit('leavePoll', pollId);
```

### Server → Client

#### Joined Poll Confirmation
```javascript
socket.on('joinedPoll', (data) => {
  console.log('Joined poll:', data.pollId);
});
```

#### Vote Update
```javascript
socket.on('voteUpdate', (data) => {
  console.log('New vote:', data);
  // data = { pollId, options, totalVotes, timestamp }
});
```

#### Connection Events
```javascript
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

---

## Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pollrooms

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# Poll Settings
POLL_TTL_DAYS=30
MAX_POLL_OPTIONS=10
MIN_POLL_OPTIONS=2
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Common Commands

### Backend
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Install dependencies
npm install

# Check for errors
node src/server.js
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install
```

### Database
```bash
# Start MongoDB locally
mongod

# Connect to MongoDB shell
mongosh

# View databases
show dbs

# Use pollrooms database
use pollrooms

# View collections
show collections

# Query polls
db.polls.find().pretty()

# Query votes
db.votes.find().pretty()

# Count documents
db.polls.countDocuments()
db.votes.countDocuments()
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pollrooms
```

### Issue: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
PORT=5001
```

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
```bash
# Check FRONTEND_URL in backend/.env
FRONTEND_URL=http://localhost:5173

# Restart backend server
```

### Issue: Socket Connection Failed
```
WebSocket connection to 'ws://localhost:5000' failed
```
**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/health

# Check VITE_SOCKET_URL in frontend/.env
VITE_SOCKET_URL=http://localhost:5000

# Restart frontend
```

### Issue: Vote Not Updating
```
Vote submitted but results not updating
```
**Solution:**
```bash
# Check browser console for errors
# Check socket connection status (green "Live" indicator)
# Check backend logs for errors
# Verify MongoDB is running
```

---

## Code Snippets

### Generate Device Fingerprint (Client)
```javascript
const getFingerprint = async () => {
  const components = {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform
  };

  const data = new TextEncoder().encode(
    Object.values(components).join('|')
  );
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
```

### Create Poll (Client)
```javascript
import { pollAPI } from './services/api';

const createPoll = async () => {
  try {
    const response = await pollAPI.create({
      question: "What's your favorite language?",
      options: ["JavaScript", "Python", "Go"]
    });
    
    console.log('Poll created:', response.data.pollId);
    console.log('Share URL:', response.data.shareUrl);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Submit Vote (Client)
```javascript
import { voteAPI } from './services/api';
import { getDeviceFingerprint } from './utils/fingerprint';

const submitVote = async (pollId, optionId) => {
  try {
    const fingerprint = await getDeviceFingerprint();
    
    const response = await voteAPI.submit({
      pollId,
      optionId,
      fingerprint
    });
    
    console.log('Vote recorded:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Socket Connection (Client)
```javascript
import socketService from './services/socket';

// Connect and join poll
const socket = socketService.connect();
socketService.joinPoll(pollId);

// Listen for updates
socketService.onVoteUpdate((data) => {
  console.log('Vote update:', data);
  updateUI(data);
});

// Cleanup on unmount
return () => {
  socketService.leavePoll(pollId);
  socketService.offVoteUpdate();
};
```

### Create Poll (Server)
```javascript
import { nanoid } from 'nanoid';
import Poll from './models/Poll.js';

const createPoll = async (question, options) => {
  const pollId = nanoid(9);
  
  const poll = new Poll({
    pollId,
    question,
    options: options.map((text, index) => ({
      id: index.toString(),
      text,
      votes: 0
    })),
    totalVotes: 0
  });
  
  await poll.save();
  return poll;
};
```

### Record Vote (Server)
```javascript
import Poll from './models/Poll.js';
import Vote from './models/Vote.js';

const recordVote = async (pollId, optionId, fingerprint, ip) => {
  // Insert vote
  await Vote.create({
    pollId,
    optionId,
    fingerprint,
    ip,
    votedAt: new Date()
  });
  
  // Increment count (atomic)
  const updatedPoll = await Poll.findOneAndUpdate(
    { pollId, 'options.id': optionId },
    { 
      $inc: { 
        'options.$.votes': 1,
        totalVotes: 1
      }
    },
    { new: true }
  );
  
  return updatedPoll;
};
```

### Broadcast Vote Update (Server)
```javascript
// In vote controller
const io = req.app.get('io');

io.to(pollId).emit('voteUpdate', {
  pollId: updatedPoll.pollId,
  options: updatedPoll.options,
  totalVotes: updatedPoll.totalVotes,
  timestamp: new Date().toISOString()
});
```

---

## Testing Commands

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Create poll
curl -X POST http://localhost:5000/api/polls \
  -H "Content-Type: application/json" \
  -d '{"question":"Test?","options":["A","B"]}'

# Get poll
curl http://localhost:5000/api/polls/x7k9mP2qL

# Submit vote
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "pollId":"x7k9mP2qL",
    "optionId":"0",
    "fingerprint":"a3f5e8d9c2b1a0f4e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4"
  }'
```

### Test Socket Connection
```javascript
// In browser console
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('joinPoll', 'x7k9mP2qL');
});

socket.on('voteUpdate', (data) => {
  console.log('Vote update:', data);
});
```

---

## File Locations

### Backend
```
backend/src/
├── server.js              # Main entry point
├── config/
│   ├── database.js        # MongoDB connection
│   └── socket.js          # Socket.io setup
├── models/
│   ├── Poll.js            # Poll schema
│   └── Vote.js            # Vote schema
├── routes/
│   ├── poll.routes.js     # Poll endpoints
│   └── vote.routes.js     # Vote endpoints
├── controllers/
│   ├── poll.controller.js # Poll logic
│   └── vote.controller.js # Vote logic
├── services/
│   ├── poll.service.js    # Poll operations
│   ├── vote.service.js    # Vote operations
│   └── antiAbuse.service.js # Anti-abuse checks
└── middleware/
    ├── validation.js      # Input validation
    ├── rateLimit.js       # Rate limiting
    └── errorHandler.js    # Error handling
```

### Frontend
```
frontend/src/
├── main.jsx               # Entry point
├── App.jsx                # Main component
├── pages/
│   ├── CreatePoll.jsx     # Poll creation page
│   └── PollRoom.jsx       # Vote/results page
├── components/
│   ├── PollForm.jsx       # Create form
│   ├── VoteOption.jsx     # Vote button
│   ├── ResultsChart.jsx   # Results display
│   └── ShareLink.jsx      # Share component
├── services/
│   ├── api.js             # Axios client
│   └── socket.js          # Socket.io client
└── hooks/
    ├── usePoll.js         # Poll data hook
    └── useSocket.js       # Socket hook
```

---

## Useful Links

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Render**: https://render.com
- **Vercel**: https://vercel.com
- **Socket.io Docs**: https://socket.io/docs/v4/
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **Mongoose Docs**: https://mongoosejs.com

---

## Quick Tips

1. **Always check logs** when debugging
2. **Use browser DevTools** Network tab for API calls
3. **Check MongoDB Atlas** for database issues
4. **Restart servers** after .env changes
5. **Clear browser cache** if seeing old data
6. **Use incognito mode** for testing duplicate votes
7. **Check CORS settings** if API calls fail
8. **Verify environment variables** are loaded
9. **Monitor rate limits** during testing
10. **Use health endpoint** to verify backend is running

---

**Need more help?** Check the full documentation:
- [README.md](README.md) - Overview
- [SETUP.md](SETUP.md) - Setup guide
- [TESTING.md](TESTING.md) - Testing guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details
