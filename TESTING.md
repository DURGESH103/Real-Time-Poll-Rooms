# Testing Guide - Real-Time Poll Rooms

## Manual Testing Checklist

### 1. Poll Creation Tests

#### Test 1.1: Valid Poll Creation
- [ ] Navigate to home page
- [ ] Enter question: "What's your favorite color?"
- [ ] Add options: "Red", "Blue", "Green"
- [ ] Click "Create Poll"
- [ ] **Expected**: Success message, share link displayed
- [ ] **Expected**: Poll ID is 9 characters alphanumeric

#### Test 1.2: Question Validation
- [ ] Enter question with <10 characters
- [ ] Try to submit
- [ ] **Expected**: Error "Question must be at least 10 characters"

#### Test 1.3: Options Validation
- [ ] Create poll with only 1 option
- [ ] Try to submit
- [ ] **Expected**: Error "At least 2 options are required"

#### Test 1.4: Maximum Options
- [ ] Add 10 options
- [ ] **Expected**: "Add Option" button disabled
- [ ] Try to add 11th option
- [ ] **Expected**: Cannot add more options

#### Test 1.5: Empty Options
- [ ] Add 3 options, leave 2nd one empty
- [ ] Submit
- [ ] **Expected**: Only filled options saved (2 options)

---

### 2. Voting Tests

#### Test 2.1: First Vote
- [ ] Open poll link
- [ ] Select an option
- [ ] Click "Submit Vote"
- [ ] **Expected**: Vote recorded, results displayed
- [ ] **Expected**: Vote count increments by 1

#### Test 2.2: Duplicate Vote Prevention (Same Device)
- [ ] Vote on a poll
- [ ] Refresh page
- [ ] Try to vote again
- [ ] **Expected**: Results shown immediately (no vote form)
- [ ] **Expected**: Cannot vote again

#### Test 2.3: Duplicate Vote Prevention (Same Browser)
- [ ] Vote on a poll
- [ ] Open same poll in new tab
- [ ] **Expected**: Results shown, cannot vote

#### Test 2.4: Different Browser Test
- [ ] Vote in Chrome
- [ ] Open same poll in Firefox
- [ ] **Expected**: Can vote again (different fingerprint)

#### Test 2.5: Incognito Mode Test
- [ ] Vote in normal browser
- [ ] Open poll in incognito/private mode
- [ ] **Expected**: Can vote (new fingerprint)

---

### 3. Real-Time Updates Tests

#### Test 3.1: Two Browser Windows
- [ ] Open poll in Browser Window A (don't vote)
- [ ] Open same poll in Browser Window B
- [ ] Vote in Window B
- [ ] **Expected**: Window A updates immediately with new vote count
- [ ] **Expected**: Progress bars animate

#### Test 3.2: Multiple Concurrent Votes
- [ ] Open poll in 3 different browsers
- [ ] Vote simultaneously from all 3
- [ ] **Expected**: All votes recorded
- [ ] **Expected**: Final count = initial + 3

#### Test 3.3: Socket Reconnection
- [ ] Open poll
- [ ] Turn off WiFi for 10 seconds
- [ ] Turn WiFi back on
- [ ] Vote from another device
- [ ] **Expected**: First device reconnects and shows update

---

### 4. Anti-Abuse Tests

#### Test 4.1: Rapid Click Prevention
- [ ] Select option
- [ ] Click "Submit Vote" 10 times rapidly
- [ ] **Expected**: Only 1 vote recorded
- [ ] **Expected**: Button disabled during submission

#### Test 4.2: IP Rate Limiting
- [ ] Create 10 different polls
- [ ] Vote on all 10 from same IP
- [ ] Try to vote on 11th poll
- [ ] **Expected**: Rate limit error after 10 votes

#### Test 4.3: Invalid Option Selection
- [ ] Open browser console
- [ ] Manually call API with invalid optionId
- [ ] **Expected**: 400 error "Invalid option"

#### Test 4.4: Invalid Poll ID
- [ ] Navigate to `/poll/invalid123`
- [ ] **Expected**: 404 error "Poll not found"

---

### 5. UI/UX Tests

#### Test 5.1: Mobile Responsiveness
- [ ] Open on mobile device (or Chrome DevTools mobile view)
- [ ] Create poll
- [ ] Vote on poll
- [ ] **Expected**: All elements properly sized and clickable

#### Test 5.2: Loading States
- [ ] Open poll with slow network (Chrome DevTools → Network → Slow 3G)
- [ ] **Expected**: Loading skeleton displayed
- [ ] **Expected**: No layout shift when data loads

#### Test 5.3: Error States
- [ ] Stop backend server
- [ ] Try to create poll
- [ ] **Expected**: Error message displayed
- [ ] **Expected**: "Try Again" button works

#### Test 5.4: Copy Share Link
- [ ] Create poll
- [ ] Click "Copy" button
- [ ] Paste in new tab
- [ ] **Expected**: Correct poll URL copied
- [ ] **Expected**: Button shows "Copied!" feedback

---

### 6. Edge Cases Tests

#### Test 6.1: Very Long Question
- [ ] Enter 200 character question
- [ ] Submit
- [ ] **Expected**: Accepted
- [ ] Try 201 characters
- [ ] **Expected**: Character counter shows limit

#### Test 6.2: Special Characters
- [ ] Create poll with question: "What's your favorite emoji? 🎉"
- [ ] Add option: "❤️ Heart"
- [ ] **Expected**: Special characters preserved

#### Test 6.3: Concurrent Poll Creation
- [ ] Open 2 browser windows
- [ ] Create polls simultaneously
- [ ] **Expected**: Both polls created with unique IDs

#### Test 6.4: Zero Votes Display
- [ ] Create poll
- [ ] Open poll link (don't vote)
- [ ] **Expected**: All options show 0 votes, 0%

#### Test 6.5: Single Vote Percentage
- [ ] Create poll with 3 options
- [ ] Vote on option 1
- [ ] **Expected**: Option 1 shows 100%, others 0%

---

### 7. Performance Tests

#### Test 7.1: Poll Load Time
- [ ] Open poll link
- [ ] Measure time to interactive
- [ ] **Expected**: <2 seconds on normal connection

#### Test 7.2: Vote Submission Time
- [ ] Select option and submit
- [ ] Measure time to confirmation
- [ ] **Expected**: <1 second

#### Test 7.3: Real-Time Update Latency
- [ ] Vote from Device A
- [ ] Measure time until Device B updates
- [ ] **Expected**: <500ms

---

### 8. Browser Compatibility Tests

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

For each browser:
- [ ] Create poll works
- [ ] Vote submission works
- [ ] Real-time updates work
- [ ] UI renders correctly

---

## API Testing with cURL

### Test 1: Create Poll
```bash
curl -X POST http://localhost:5000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite programming language?",
    "options": ["JavaScript", "Python", "Go", "Rust"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pollId": "x7k9mP2qL",
    "question": "What is your favorite programming language?",
    "options": [...],
    "shareUrl": "http://localhost:5173/poll/x7k9mP2qL",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Test 2: Get Poll
```bash
curl http://localhost:5000/api/polls/x7k9mP2qL
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pollId": "x7k9mP2qL",
    "question": "...",
    "options": [...],
    "totalVotes": 0
  }
}
```

### Test 3: Submit Vote
```bash
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "pollId": "x7k9mP2qL",
    "optionId": "0",
    "fingerprint": "a3f5e8d9c2b1a0f4e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Vote recorded successfully",
    "poll": {
      "pollId": "x7k9mP2qL",
      "options": [...],
      "totalVotes": 1
    }
  }
}
```

### Test 4: Duplicate Vote (Should Fail)
```bash
# Run same vote command again
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "pollId": "x7k9mP2qL",
    "optionId": "0",
    "fingerprint": "a3f5e8d9c2b1a0f4e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_VOTED",
    "message": "You have already voted in this poll"
  }
}
```

### Test 5: Invalid Poll ID
```bash
curl http://localhost:5000/api/polls/invalid123
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "POLL_NOT_FOUND",
    "message": "Poll not found"
  }
}
```

---

## Socket.io Testing

### Test with Socket.io Client (Node.js)

Create `test-socket.js`:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  // Join poll room
  socket.emit('joinPoll', 'x7k9mP2qL');
});

socket.on('joinedPoll', (data) => {
  console.log('✅ Joined poll:', data.pollId);
});

socket.on('voteUpdate', (data) => {
  console.log('📊 Vote update received:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});
```

Run: `node test-socket.js`

---

## Load Testing (Optional)

### Using Apache Bench
```bash
# Test poll creation endpoint
ab -n 100 -c 10 -p poll.json -T application/json \
  http://localhost:5000/api/polls

# Test get poll endpoint
ab -n 1000 -c 50 \
  http://localhost:5000/api/polls/x7k9mP2qL
```

### Expected Results
- Poll creation: >50 requests/sec
- Get poll: >200 requests/sec
- Vote submission: >100 requests/sec

---

## Automated Testing (Future Enhancement)

### Unit Tests (Jest)
```javascript
// Example: test fingerprint generation
describe('Fingerprint Utils', () => {
  test('generates consistent fingerprint', async () => {
    const fp1 = await getDeviceFingerprint();
    const fp2 = await getDeviceFingerprint();
    expect(fp1).toBe(fp2);
  });
});
```

### Integration Tests (Supertest)
```javascript
// Example: test poll creation API
describe('POST /api/polls', () => {
  test('creates poll successfully', async () => {
    const response = await request(app)
      .post('/api/polls')
      .send({
        question: 'Test question?',
        options: ['A', 'B']
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Bug Report Template

When reporting issues, include:

```
**Bug Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Network: WiFi
- Backend URL: https://...
- Frontend URL: https://...

**Screenshots:**
[If applicable]

**Console Errors:**
[Browser console errors]

**Additional Context:**
[Any other relevant information]
```

---

## Test Results Log

| Test Case | Status | Notes |
|-----------|--------|-------|
| Poll Creation | ✅ Pass | |
| Duplicate Vote Prevention | ✅ Pass | |
| Real-Time Updates | ✅ Pass | |
| Mobile Responsive | ✅ Pass | |
| Rate Limiting | ⚠️ Partial | Needs IP testing |
| Socket Reconnection | ✅ Pass | |

---

## Known Issues & Limitations

1. **Fingerprint Bypass**: Sophisticated users can clear browser data to vote again
2. **IP Sharing**: Multiple users behind same NAT may be blocked
3. **Socket Reconnection**: May take 2-3 seconds after network restore
4. **Mobile Safari**: WebSocket connection may drop in background
5. **Rate Limiting**: Shared IPs (offices, schools) may hit limits quickly

---

## Testing Best Practices

1. **Test in Incognito**: Avoid cached data affecting tests
2. **Clear Browser Data**: Between test runs for consistent results
3. **Use Multiple Devices**: Test real-world scenarios
4. **Monitor Network Tab**: Check API calls and responses
5. **Check Console**: Look for JavaScript errors
6. **Test Edge Cases**: Empty inputs, special characters, etc.
7. **Verify Database**: Check MongoDB Atlas for data consistency
8. **Test Error Recovery**: Simulate network failures, server errors
