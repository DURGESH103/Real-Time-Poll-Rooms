# Real-Time Poll Rooms - Architecture Documentation

## Folder Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── socket.js             # Socket.io configuration
│   ├── models/
│   │   ├── Poll.js               # Poll schema
│   │   └── Vote.js               # Vote schema
│   ├── routes/
│   │   ├── poll.routes.js        # Poll CRUD routes
│   │   └── vote.routes.js        # Vote routes
│   ├── controllers/
│   │   ├── poll.controller.js    # Poll business logic
│   │   └── vote.controller.js    # Vote business logic
│   ├── services/
│   │   ├── poll.service.js       # Poll data operations
│   │   ├── vote.service.js       # Vote data operations
│   │   └── antiAbuse.service.js  # Anti-abuse mechanisms
│   ├── middleware/
│   │   ├── validation.js         # Input validation
│   │   ├── rateLimit.js          # Rate limiting
│   │   └── errorHandler.js       # Global error handler
│   ├── utils/
│   │   ├── fingerprint.js        # Device fingerprint generator
│   │   └── logger.js             # Logging utility
│   ├── socket/
│   │   └── handlers.js           # Socket event handlers
│   └── server.js                 # Express app entry
├── .env.example
├── .gitignore
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── PollForm.jsx          # Create poll form
│   │   ├── VoteOption.jsx        # Single vote option
│   │   ├── ResultsChart.jsx      # Real-time results display
│   │   ├── ShareLink.jsx         # Share link component
│   │   ├── LoadingSkeleton.jsx   # Loading states
│   │   └── ErrorMessage.jsx      # Error display
│   ├── pages/
│   │   ├── CreatePoll.jsx        # Poll creation page
│   │   └── PollRoom.jsx          # Vote + results page
│   ├── services/
│   │   ├── api.js                # Axios instance
│   │   └── socket.js             # Socket.io client
│   ├── hooks/
│   │   ├── usePoll.js            # Poll data hook
│   │   └── useSocket.js          # Socket connection hook
│   ├── utils/
│   │   └── fingerprint.js        # Client fingerprint
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Design Decisions

### 1. Separation of Concerns
- **Controllers**: Handle HTTP request/response
- **Services**: Business logic + data operations
- **Models**: Data schemas + validation
- **Middleware**: Cross-cutting concerns

### 2. Socket.io Room Strategy
- Each poll gets its own room (room name = pollId)
- Users join room on poll page load
- Vote updates broadcast only to room members
- Reduces unnecessary network traffic

### 3. Anti-Abuse Mechanisms

#### Mechanism 1: Device Fingerprint
**Threat Prevented**: Same user voting multiple times from same device

**Implementation**:
- Generate hash from: userAgent + screen resolution + timezone + language
- Store fingerprint with vote in DB
- Check if fingerprint already voted for this poll

**Limitations**: 
- Can be bypassed by changing browser/device
- Incognito mode generates new fingerprint

#### Mechanism 2: IP-Based Rate Limiting
**Threat Prevented**: Rapid spam voting from same IP

**Implementation**:
- Track votes per IP per poll
- Limit: 1 vote per poll per IP
- Additional global rate limit: 10 votes/hour per IP

**Limitations**:
- Multiple users behind same NAT/proxy share IP
- VPN can bypass IP tracking

### 4. Database Indexing Strategy
```javascript
// polls collection
{ pollId: 1 }           // Fast poll lookup
{ createdAt: 1 }        // TTL index for auto-deletion

// votes collection
{ pollId: 1, fingerprint: 1 }  // Prevent duplicate votes
{ pollId: 1, ip: 1 }           // IP-based checks
{ pollId: 1 }                  // Fast vote aggregation
```

### 5. Real-Time Sync Strategy
- On vote: Broadcast updated vote counts to all room members
- On reconnect: Client fetches latest poll data via REST
- No state stored in socket server (stateless)

### 6. Error Handling Strategy
- Global error middleware catches all errors
- Structured error responses: `{ success: false, error: { code, message } }`
- Client displays user-friendly error messages
- Server logs detailed errors for debugging

## Security Measures

1. **Input Validation**: All inputs validated with Joi
2. **Rate Limiting**: Express-rate-limit middleware
3. **CORS**: Configured for frontend domain only
4. **Helmet**: Security headers enabled
5. **Environment Variables**: Sensitive data in .env
6. **MongoDB Injection Prevention**: Mongoose sanitization
7. **XSS Prevention**: Input sanitization

## Performance Optimizations

1. **Database Indexes**: Fast queries on pollId, fingerprint, IP
2. **Socket Rooms**: Targeted broadcasts (not global)
3. **Lean Queries**: Only fetch needed fields
4. **Connection Pooling**: MongoDB connection reuse
5. **Efficient Vote Aggregation**: MongoDB aggregation pipeline

## Scalability Considerations

For production scale:
1. **Redis**: Session storage + rate limiting
2. **Socket.io Redis Adapter**: Multi-server socket sync
3. **Load Balancer**: Distribute traffic
4. **CDN**: Static asset delivery
5. **Database Sharding**: If >1M polls

## Edge Cases Handled

1. ✅ Duplicate vote attempts → Rejected with error message
2. ✅ Invalid poll link → 404 error page
3. ✅ Socket disconnect → Auto-reconnect + data sync
4. ✅ Database failure → Graceful error + retry logic
5. ✅ Rapid spam clicking → Rate limiting + debouncing
6. ✅ Poll expiry → Optional TTL index (configurable)
7. ✅ Concurrent votes → MongoDB atomic operations
8. ✅ Invalid option selection → Validation error
9. ✅ Network timeout → Retry with exponential backoff
10. ✅ Browser refresh → State restored from server

## Known Limitations

1. **Fingerprint Bypass**: Sophisticated users can bypass device fingerprinting
2. **IP Sharing**: Multiple legitimate users behind same IP may be blocked
3. **No Authentication**: Anyone with link can view results
4. **No Vote Editing**: Once voted, cannot change (by design)
5. **No Poll Deletion**: Polls persist until TTL expires
6. **Single Choice Only**: Multiple choice not supported in v1
7. **No Real-Time User Count**: Don't track active viewers
8. **No Vote History**: Can't see who voted what (privacy by design)

## Future Enhancements (Out of Scope)

- User authentication
- Poll editing/deletion
- Multiple choice polls
- Poll expiry settings
- Vote history for poll creator
- Analytics dashboard
- Email notifications
- Poll templates
