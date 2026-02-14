# 📊 Visual Diagrams & Flowcharts

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER DEVICES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Browser 1  │  │   Browser 2  │  │   Mobile     │              │
│  │   (Creator)  │  │   (Voter)    │  │   (Voter)    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          │ HTTP/WS          │ HTTP/WS          │ HTTP/WS
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Pages:  CreatePoll  │  PollRoom (Vote + Results)            │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Components:  PollForm │ VoteOption │ ResultsChart │ Share   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Services:  API Client (Axios) │ Socket Client (Socket.io)   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Hooks:  usePoll │ useSocket                                  │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Utils:  Device Fingerprint Generator                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────┬───────────────────┘
              │ REST API                          │ WebSocket
              ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Middleware:  CORS │ Helmet │ Rate Limit │ Validation        │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Routes:  /api/polls │ /api/vote                             │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Controllers:  pollController │ voteController                │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Services:  pollService │ voteService │ antiAbuseService      │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Socket.io:  Room Management │ Vote Broadcast                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────────────────────┘
              │ MongoDB Driver (Mongoose)
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                          │
│  ┌────────────────────────┐    ┌────────────────────────────────┐   │
│  │  polls Collection      │    │  votes Collection              │   │
│  │  ─────────────────     │    │  ─────────────────             │   │
│  │  • pollId (indexed)    │    │  • pollId (indexed)            │   │
│  │  • question            │    │  • optionId                    │   │
│  │  • options[]           │    │  • fingerprint (indexed)       │   │
│  │    - id                │    │  • ip (indexed)                │   │
│  │    - text              │    │  • votedAt                     │   │
│  │    - votes             │    │  • userAgent                   │   │
│  │  • totalVotes          │    │                                │   │
│  │  • createdAt (TTL)     │    │  Indexes:                      │   │
│  │                        │    │  • {pollId, fingerprint} unique│   │
│  │  Indexes:              │    │  • {pollId, ip}                │   │
│  │  • {pollId} unique     │    │  • {votedAt} TTL               │   │
│  │  • {createdAt} TTL     │    │                                │   │
│  └────────────────────────┘    └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Poll Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Opens homepage
     ▼
┌─────────────────┐
│  CreatePoll     │
│  Page           │
└────┬────────────┘
     │
     │ 2. Fills form:
     │    - Question
     │    - Options (2-10)
     ▼
┌─────────────────┐
│  PollForm       │
│  Component      │
└────┬────────────┘
     │
     │ 3. Validates input
     │    (client-side)
     ▼
┌─────────────────┐
│  POST /api/polls│
└────┬────────────┘
     │
     │ 4. Server receives
     ▼
┌─────────────────┐
│  Validation     │
│  Middleware     │ ──── ❌ Invalid ──→ 400 Error
└────┬────────────┘
     │ ✅ Valid
     ▼
┌─────────────────┐
│  Poll           │
│  Controller     │
└────┬────────────┘
     │
     │ 5. Generate pollId
     │    (nanoid - 9 chars)
     ▼
┌─────────────────┐
│  Poll           │
│  Service        │
└────┬────────────┘
     │
     │ 6. Save to DB
     ▼
┌─────────────────┐
│  MongoDB        │
│  polls          │
└────┬────────────┘
     │
     │ 7. Return poll data
     ▼
┌─────────────────┐
│  Response:      │
│  {              │
│    pollId,      │
│    shareUrl     │
│  }              │
└────┬────────────┘
     │
     │ 8. Display success
     ▼
┌─────────────────┐
│  Share Link     │
│  Component      │
│  + Copy Button  │
└─────────────────┘
```

---

## Voting Flow with Anti-Abuse

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Opens poll link
     │    /poll/:pollId
     ▼
┌─────────────────┐
│  PollRoom       │
│  Page           │
└────┬────────────┘
     │
     │ 2. Fetch poll data
     ▼
┌─────────────────┐
│  GET            │
│  /api/polls/:id │
└────┬────────────┘
     │
     │ 3. Generate fingerprint
     │    (client-side)
     ▼
┌─────────────────┐
│  Device         │
│  Fingerprint    │
│  (SHA-256)      │
└────┬────────────┘
     │
     │ 4. Check if voted
     ▼
┌─────────────────┐
│  POST           │
│  /api/vote/check│
└────┬────────────┘
     │
     ├─── Already Voted ──→ Show Results
     │
     │ Not Voted
     │ 5. User selects option
     ▼
┌─────────────────┐
│  Vote Option    │
│  Component      │
└────┬────────────┘
     │
     │ 6. Submit vote
     ▼
┌─────────────────┐
│  POST           │
│  /api/vote      │
│  {              │
│    pollId,      │
│    optionId,    │
│    fingerprint  │
│  }              │
└────┬────────────┘
     │
     │ 7. Server validates
     ▼
┌─────────────────────────────────────┐
│  Anti-Abuse Checks                  │
│  ─────────────────                  │
│                                     │
│  Check 1: Fingerprint Duplicate     │
│  ┌─────────────────────────────┐   │
│  │ Query votes collection:     │   │
│  │ { pollId, fingerprint }     │   │
│  └────┬────────────────────────┘   │
│       │                             │
│       ├─── Found ──→ ❌ 403 Error  │
│       │              "Already voted"│
│       │                             │
│       │ Not Found                   │
│       ▼                             │
│  Check 2: IP Per-Poll Limit         │
│  ┌─────────────────────────────┐   │
│  │ Count votes:                │   │
│  │ { pollId, ip }              │   │
│  └────┬────────────────────────┘   │
│       │                             │
│       ├─── ≥1 ──→ ❌ 403 Error     │
│       │           "IP limit"        │
│       │                             │
│       │ <1                          │
│       ▼                             │
│  Check 3: Global IP Rate Limit      │
│  ┌─────────────────────────────┐   │
│  │ Count votes (last hour):    │   │
│  │ { ip, votedAt > 1hr ago }   │   │
│  └────┬────────────────────────┘   │
│       │                             │
│       ├─── ≥10 ──→ ❌ 429 Error    │
│       │            "Rate limit"     │
│       │                             │
│       │ <10                         │
│       ▼                             │
│  ✅ All Checks Passed               │
└─────────────────────────────────────┘
     │
     │ 8. Record vote
     ▼
┌─────────────────┐
│  Insert into    │
│  votes          │
│  collection     │
└────┬────────────┘
     │
     │ 9. Increment count (atomic)
     ▼
┌─────────────────┐
│  Update polls   │
│  $inc: {        │
│    options.$.   │
│      votes: 1,  │
│    totalVotes:1 │
│  }              │
└────┬────────────┘
     │
     │ 10. Broadcast update
     ▼
┌─────────────────┐
│  Socket.io      │
│  io.to(pollId)  │
│    .emit(       │
│      'voteUpdate'│
│    )            │
└────┬────────────┘
     │
     ├──────────────────────────────┐
     │                              │
     ▼                              ▼
┌──────────┐                  ┌──────────┐
│ Client 1 │                  │ Client 2 │
│ Updates  │                  │ Updates  │
│ Results  │                  │ Results  │
└──────────┘                  └──────────┘
```

---

## Real-Time Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIAL CONNECTION                        │
└─────────────────────────────────────────────────────────────┘

Client A                    Server                    Client B
   │                          │                          │
   │ 1. Open poll page        │                          │
   ├─────── HTTP GET ─────────>                          │
   │                          │                          │
   │ 2. Receive poll data     │                          │
   <──────── 200 OK ──────────┤                          │
   │                          │                          │
   │ 3. Connect socket        │                          │
   ├────── WS Connect ────────>                          │
   │                          │                          │
   │ 4. Join poll room        │                          │
   ├──── emit('joinPoll') ────>                          │
   │                          │                          │
   │                          │ 5. Add to room           │
   │                          │    rooms[pollId].add(A)  │
   │                          │                          │
   │ 6. Confirmation          │                          │
   <─── emit('joinedPoll') ───┤                          │
   │                          │                          │

┌─────────────────────────────────────────────────────────────┐
│                    VOTE SUBMISSION                           │
└─────────────────────────────────────────────────────────────┘

   │                          │                          │
   │                          │    7. Client B opens     │
   │                          │       same poll          │
   │                          <────── WS Connect ────────┤
   │                          │                          │
   │                          │    8. Join room          │
   │                          <─── emit('joinPoll') ─────┤
   │                          │                          │
   │                          │    9. Add to room        │
   │                          │    rooms[pollId].add(B)  │
   │                          │                          │
   │                          ├─── emit('joinedPoll') ───>
   │                          │                          │
   │ 10. User A votes         │                          │
   ├────── POST /vote ────────>                          │
   │                          │                          │
   │                          │ 11. Validate & save      │
   │                          │     (anti-abuse checks)  │
   │                          │                          │
   │ 12. Vote recorded        │                          │
   <──────── 200 OK ──────────┤                          │
   │                          │                          │
   │                          │ 13. Broadcast to room    │
   │                          │     io.to(pollId)        │
   │                          │       .emit('voteUpdate')│
   │                          │                          │
   │ 14. Receive update       │    15. Receive update    │
   <──── emit('voteUpdate') ──┼──── emit('voteUpdate') ──>
   │                          │                          │
   │ 16. Update UI            │    17. Update UI         │
   │     (new vote count)     │        (new vote count)  │
   │                          │                          │

┌─────────────────────────────────────────────────────────────┐
│                    RECONNECTION FLOW                         │
└─────────────────────────────────────────────────────────────┘

   │                          │                          │
   │ 18. Network drops        │                          │
   │     (WiFi off)           │                          │
   X                          │                          │
   │                          │                          │
   │ 19. Socket disconnects   │                          │
   │                          │ 20. Remove from room     │
   │                          │     rooms[pollId].del(A) │
   │                          │                          │
   │ 21. Network restored     │                          │
   │     (WiFi on)            │                          │
   │                          │                          │
   │ 22. Auto-reconnect       │                          │
   ├────── WS Connect ────────>                          │
   │                          │                          │
   │ 23. Re-join room         │                          │
   ├──── emit('joinPoll') ────>                          │
   │                          │                          │
   │                          │ 24. Add back to room     │
   │                          │     rooms[pollId].add(A) │
   │                          │                          │
   │ 25. Fetch latest data    │                          │
   ├─────── HTTP GET ─────────>                          │
   │                          │                          │
   │ 26. Synced data          │                          │
   <──────── 200 OK ──────────┤                          │
   │                          │                          │
   │ 27. UI updated           │                          │
   │     (latest results)     │                          │
   │                          │                          │
```

---

## Database Query Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    VOTE RECORDING                            │
└─────────────────────────────────────────────────────────────┘

1. Check Duplicate (Fingerprint)
   ┌────────────────────────────────────┐
   │ db.votes.findOne({                 │
   │   pollId: "x7k9mP2qL",             │
   │   fingerprint: "a3f5e8d9..."       │
   │ })                                 │
   │                                    │
   │ Uses Index: {pollId, fingerprint}  │
   │ Performance: O(log n)              │
   └────────────────────────────────────┘
                    │
                    ├─── Found ──→ Return Error
                    │
                    │ Not Found
                    ▼
2. Check IP Limit
   ┌────────────────────────────────────┐
   │ db.votes.countDocuments({          │
   │   pollId: "x7k9mP2qL",             │
   │   ip: "192.168.1.100"              │
   │ })                                 │
   │                                    │
   │ Uses Index: {pollId, ip}           │
   │ Performance: O(log n)              │
   └────────────────────────────────────┘
                    │
                    ├─── ≥1 ──→ Return Error
                    │
                    │ <1
                    ▼
3. Insert Vote
   ┌────────────────────────────────────┐
   │ db.votes.insertOne({               │
   │   pollId: "x7k9mP2qL",             │
   │   optionId: "1",                   │
   │   fingerprint: "a3f5e8d9...",      │
   │   ip: "192.168.1.100",             │
   │   votedAt: new Date()              │
   │ })                                 │
   │                                    │
   │ Unique Index Enforced              │
   │ Performance: O(log n)              │
   └────────────────────────────────────┘
                    │
                    │ Success
                    ▼
4. Increment Vote Count (Atomic)
   ┌────────────────────────────────────┐
   │ db.polls.updateOne(                │
   │   {                                │
   │     pollId: "x7k9mP2qL",           │
   │     "options.id": "1"              │
   │   },                               │
   │   {                                │
   │     $inc: {                        │
   │       "options.$.votes": 1,        │
   │       "totalVotes": 1              │
   │     }                              │
   │   }                                │
   │ })                                 │
   │                                    │
   │ Uses Index: {pollId}               │
   │ Atomic Operation: Thread-safe      │
   │ Performance: O(log n)              │
   └────────────────────────────────────┘
                    │
                    │ Success
                    ▼
5. Return Updated Poll
   ┌────────────────────────────────────┐
   │ db.polls.findOne({                 │
   │   pollId: "x7k9mP2qL"              │
   │ })                                 │
   │                                    │
   │ Uses Index: {pollId}               │
   │ Performance: O(1) - indexed        │
   └────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CDN (Frontend)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Static Assets:                                       │   │
│  │  • HTML, CSS, JS (bundled)                            │   │
│  │  • React App (SPA)                                    │   │
│  │  • Served from edge locations                         │   │
│  │  • Auto HTTPS                                         │   │
│  │  • CDN caching                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js Server:                                      │   │
│  │  • Express.js                                         │   │
│  │  • Socket.io                                          │   │
│  │  • Auto HTTPS                                         │   │
│  │  • Auto deploy on git push                            │   │
│  │  • Health checks                                      │   │
│  │  • Logs & monitoring                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Driver
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  MONGODB ATLAS (Database)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Managed MongoDB:                                     │   │
│  │  • M0 Free Tier (512MB)                               │   │
│  │  • Auto backups                                       │   │
│  │  • Monitoring                                         │   │
│  │  • Encryption at rest                                 │   │
│  │  • Global clusters                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Environment Variables Flow:
─────────────────────────────

Vercel (Frontend):
  VITE_API_URL=https://poll-backend.onrender.com
  VITE_SOCKET_URL=https://poll-backend.onrender.com

Render (Backend):
  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pollrooms
  FRONTEND_URL=https://poll-app.vercel.app
  PORT=5000
  NODE_ENV=production
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Level
┌────────────────────────────────────────┐
│ • HTTPS Only (TLS 1.3)                 │
│ • CORS (whitelist frontend domain)    │
│ • Helmet.js security headers           │
│   - X-Frame-Options: DENY              │
│   - X-Content-Type-Options: nosniff    │
│   - X-XSS-Protection: 1                │
└────────────────────────────────────────┘
                  │
                  ▼
Layer 2: Rate Limiting
┌────────────────────────────────────────┐
│ • Global: 100 req/15min per IP         │
│ • Vote: 10 votes/hour per IP           │
│ • Poll Creation: 5 polls/hour per IP   │
│ • Express-rate-limit middleware        │
└────────────────────────────────────────┘
                  │
                  ▼
Layer 3: Input Validation
┌────────────────────────────────────────┐
│ • Joi schema validation                │
│ • Type checking                        │
│ • Length limits                        │
│ • Sanitization                         │
│ • XSS prevention                       │
└────────────────────────────────────────┘
                  │
                  ▼
Layer 4: Anti-Abuse
┌────────────────────────────────────────┐
│ • Device fingerprinting                │
│ • IP tracking                          │
│ • Duplicate vote prevention            │
│ • MongoDB unique indexes               │
└────────────────────────────────────────┘
                  │
                  ▼
Layer 5: Database Security
┌────────────────────────────────────────┐
│ • Parameterized queries (Mongoose)     │
│ • No SQL injection possible            │
│ • Encryption at rest (Atlas)           │
│ • Network access control               │
│ • Authentication required              │
└────────────────────────────────────────┘
                  │
                  ▼
Layer 6: Error Handling
┌────────────────────────────────────────┐
│ • No stack traces in production        │
│ • Generic error messages               │
│ • Detailed logging server-side         │
│ • Graceful degradation                 │
└────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                  PERFORMANCE OPTIMIZATIONS                   │
└─────────────────────────────────────────────────────────────┘

Frontend Optimizations:
┌────────────────────────────────────────┐
│ 1. Code Splitting                      │
│    • React.lazy() for routes           │
│    • Dynamic imports                   │
│                                        │
│ 2. Asset Optimization                  │
│    • Vite bundling                     │
│    • Tree shaking                      │
│    • Minification                      │
│                                        │
│ 3. Caching                             │
│    • Browser caching                   │
│    • CDN caching (Vercel)              │
│    • Service worker (future)           │
│                                        │
│ 4. Rendering                           │
│    • Virtual DOM (React)               │
│    • Debounced updates                 │
│    • Skeleton screens                  │
└────────────────────────────────────────┘

Backend Optimizations:
┌────────────────────────────────────────┐
│ 1. Database Queries                    │
│    • Indexed fields                    │
│    • Lean queries (.lean())            │
│    • Projection (select fields)        │
│    • Atomic operations ($inc)          │
│                                        │
│ 2. Connection Management               │
│    • MongoDB connection pooling        │
│    • Keep-alive connections            │
│    • Socket.io connection reuse        │
│                                        │
│ 3. Caching Strategy                    │
│    • In-memory caching (future)        │
│    • Redis for sessions (future)       │
│                                        │
│ 4. Socket.io                           │
│    • Room-based broadcasting           │
│    • Binary protocol                   │
│    • Compression enabled               │
└────────────────────────────────────────┘

Database Optimizations:
┌────────────────────────────────────────┐
│ 1. Indexes                             │
│    polls:                              │
│    • {pollId: 1} - unique              │
│    • {createdAt: 1} - TTL              │
│                                        │
│    votes:                              │
│    • {pollId: 1, fingerprint: 1}       │
│    • {pollId: 1, ip: 1}                │
│    • {votedAt: 1} - TTL                │
│                                        │
│ 2. Data Structure                      │
│    • Embedded vote counts (fast read)  │
│    • Separate votes (audit trail)      │
│    • Denormalized for performance      │
│                                        │
│ 3. Query Patterns                      │
│    • Single document reads             │
│    • Atomic updates                    │
│    • No joins required                 │
└────────────────────────────────────────┘

Result:
┌────────────────────────────────────────┐
│ • Page Load: ~1.5s                     │
│ • Vote Submit: ~500ms                  │
│ • Real-Time Update: ~200ms             │
│ • API Response: ~100ms                 │
│ • Database Query: ~20ms                │
└────────────────────────────────────────┘
```

This completes all the visual diagrams and flowcharts! 🎉
