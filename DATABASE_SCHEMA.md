# Database Schema Design

## Collections

### 1. polls Collection

```javascript
{
  _id: ObjectId,
  pollId: String,              // Unique short ID (nanoid) - INDEXED
  question: String,            // Poll question (max 200 chars)
  options: [
    {
      id: String,              // Option ID (0, 1, 2, ...)
      text: String,            // Option text (max 100 chars)
      votes: Number            // Vote count (default: 0)
    }
  ],
  totalVotes: Number,          // Total votes across all options
  createdAt: Date,             // Auto-generated - INDEXED (TTL)
  expiresAt: Date              // Optional expiry date
}
```

**Indexes:**
```javascript
db.polls.createIndex({ pollId: 1 }, { unique: true })
db.polls.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days TTL
```

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "pollId": "x7k9mP2qL",
  "question": "What's your favorite programming language?",
  "options": [
    { "id": "0", "text": "JavaScript", "votes": 15 },
    { "id": "1", "text": "Python", "votes": 23 },
    { "id": "2", "text": "Go", "votes": 8 }
  ],
  "totalVotes": 46,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": null
}
```

---

### 2. votes Collection

```javascript
{
  _id: ObjectId,
  pollId: String,              // Reference to poll - INDEXED
  optionId: String,            // Selected option ID
  fingerprint: String,         // Device fingerprint hash - INDEXED
  ip: String,                  // Voter IP address - INDEXED
  userAgent: String,           // Browser user agent
  votedAt: Date,               // Vote timestamp
  metadata: {
    country: String,           // Optional: IP geolocation
    city: String
  }
}
```

**Indexes:**
```javascript
// Compound index: Prevent duplicate votes from same fingerprint
db.votes.createIndex(
  { pollId: 1, fingerprint: 1 }, 
  { unique: true }
)

// Compound index: IP-based rate limiting
db.votes.createIndex({ pollId: 1, ip: 1 })

// Single index: Fast vote aggregation by poll
db.votes.createIndex({ pollId: 1 })

// TTL index: Auto-delete old votes (optional)
db.votes.createIndex({ votedAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days
```

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "pollId": "x7k9mP2qL",
  "optionId": "1",
  "fingerprint": "a3f5e8d9c2b1a0f4e7d6c5b4a3f2e1d0",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "votedAt": "2024-01-15T10:35:22.000Z",
  "metadata": {
    "country": "US",
    "city": "New York"
  }
}
```

---

## Schema Design Decisions

### 1. Embedded vs Referenced Data

**Decision**: Embed vote counts in poll document
**Rationale**: 
- Faster reads (single query for poll + results)
- Vote counts updated atomically with MongoDB $inc
- No joins needed

**Trade-off**: 
- Slight write overhead (update poll doc on each vote)
- Acceptable for this use case (reads >> writes)

### 2. Separate Votes Collection

**Decision**: Store individual votes in separate collection
**Rationale**:
- Enable anti-abuse checks (fingerprint/IP lookup)
- Audit trail for vote verification
- Can analyze voting patterns

**Alternative Considered**: 
- Store fingerprints array in poll doc
- Rejected: Would grow unbounded, poor query performance

### 3. Denormalized Vote Counts

**Decision**: Store vote counts in both places:
- Individual option.votes in poll doc
- Separate vote documents in votes collection

**Rationale**:
- Fast result display (no aggregation needed)
- Atomic updates with $inc operator
- votes collection used only for validation

### 4. TTL Indexes

**Decision**: Auto-delete polls/votes after 30 days
**Rationale**:
- Prevent database bloat
- Most polls irrelevant after short time
- Configurable via environment variable

**Configuration**:
```javascript
// Disable TTL by setting to 0
POLL_TTL_DAYS=30  // or 0 to disable
```

### 5. Fingerprint Storage

**Decision**: Store full fingerprint hash (not just boolean)
**Rationale**:
- Can analyze voting patterns
- Debug duplicate vote issues
- Potential future feature: "You already voted for option X"

### 6. IP Address Storage

**Decision**: Store IP as string (not hashed)
**Rationale**:
- Enable IP-based analytics
- Geolocation features
- Rate limiting per IP

**Privacy Note**: 
- IPs not exposed to frontend
- Consider hashing for GDPR compliance in production

---

## Query Patterns

### Get Poll with Results
```javascript
db.polls.findOne({ pollId: "x7k9mP2qL" })
// Returns poll with embedded vote counts - O(1) lookup
```

### Check if User Already Voted
```javascript
db.votes.findOne({ 
  pollId: "x7k9mP2qL", 
  fingerprint: "a3f5e8d9..." 
})
// Uses compound index - O(log n) lookup
```

### Record Vote (Atomic)
```javascript
// 1. Insert vote document
db.votes.insertOne({ pollId, optionId, fingerprint, ip, ... })

// 2. Increment vote count atomically
db.polls.updateOne(
  { pollId: "x7k9mP2qL", "options.id": "1" },
  { 
    $inc: { 
      "options.$.votes": 1,
      "totalVotes": 1 
    } 
  }
)
```

### Count Votes from IP (Rate Limiting)
```javascript
db.votes.countDocuments({ 
  pollId: "x7k9mP2qL", 
  ip: "192.168.1.100" 
})
// Uses compound index - O(log n)
```

---

## Data Validation Rules

### Poll Validation
- `question`: Required, 10-200 characters, no HTML
- `options`: Array of 2-10 items
- `options[].text`: Required, 1-100 characters, no HTML
- `pollId`: Auto-generated, 9 characters, alphanumeric

### Vote Validation
- `pollId`: Must exist in polls collection
- `optionId`: Must exist in poll.options
- `fingerprint`: Required, 32-character hex string
- `ip`: Required, valid IPv4/IPv6 format

---

## Index Performance Analysis

### polls Collection
- **pollId index**: Unique lookup - O(1) hash lookup
- **createdAt index**: TTL cleanup - Background process

### votes Collection
- **{pollId, fingerprint} compound**: Duplicate check - O(log n)
- **{pollId, ip} compound**: Rate limiting - O(log n)
- **pollId single**: Vote aggregation - O(log n)

### Expected Performance
- Poll lookup: <5ms
- Duplicate vote check: <10ms
- Vote insertion: <20ms
- Result aggregation: <5ms (using embedded counts)

---

## Scaling Considerations

### Current Design Supports:
- ✅ 10,000 concurrent polls
- ✅ 1,000,000 total votes
- ✅ 100 votes/second write throughput

### When to Shard:
- >1M active polls
- >100M total votes
- >1000 votes/second

### Sharding Strategy:
```javascript
// Shard key: pollId (good distribution)
sh.shardCollection("polldb.votes", { pollId: 1 })
sh.shardCollection("polldb.polls", { pollId: 1 })
```
