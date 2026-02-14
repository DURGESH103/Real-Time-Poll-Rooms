# Real-Time Poll Rooms - Implementation Notes

## Anti-Abuse Mechanisms

I needed two layers here to handle the assignment requirement. Went with fingerprinting + IP tracking since they complement each other well.

### Device Fingerprinting

On the frontend, I hash together browser properties (user agent, screen resolution, timezone, language, platform) using SHA-256. This fingerprint gets sent with every vote request. Backend checks the votes collection for that fingerprint + pollId combo before accepting the vote.

While testing with multiple tabs open, I noticed this catches the obvious case where someone just clicks vote again or refreshes. It's not bulletproof—incognito mode generates a new fingerprint, and someone could technically spoof it since it's client-side. But for the assignment scope, it handles casual duplicate voting without needing user accounts.

In the vote controller, the check happens in `antiAbuseService.checkFingerprintVoted()` which does a simple MongoDB query. If found, returns 403 with `ALREADY_VOTED` error code.

### IP-Based Rate Limiting

I track IP addresses in the votes collection and enforce two limits:
- 1 vote per IP per poll
- 10 votes per hour globally

Both are just MongoDB `countDocuments` queries with time windows. The IP gets extracted from `req.ip` (Express behind proxy setup). During local testing I noticed this catches people trying to bypass fingerprinting by switching browsers.

Downside is shared networks (universities, offices) might hit the limit legitimately. Also VPNs bypass this easily. For production I'd move this to Redis with sliding windows, but for a single-server assignment MongoDB queries work fine.

I also threw in express-rate-limit middleware (100 req/15min per IP) at the HTTP layer to prevent general API spam, separate from vote logic.

---

## Edge Cases Handled

**Invalid poll ID**: Backend returns 404, frontend shows a NotFound page with "Create Poll" button instead of crashing. Tested by manually typing garbage URLs.

**Duplicate vote attempt**: Backend returns 403 with error code, frontend catches it and switches to results view. Initially I just showed an error toast, but switching to results felt cleaner.

**Socket disconnect during vote**: Vote submission uses HTTP POST, not WebSocket, so disconnects don't affect it. Socket only handles live updates. If socket dies after voting, client auto-reconnects and syncs via REST. Added a connection status badge so users know what's happening.

**Poll with zero votes**: Frontend checks `totalVotes > 0` before calculating percentages to avoid division by zero. Progress bars show 0% width, results show "No votes yet" message.

**Concurrent votes**: Using MongoDB's `$inc` operator for atomic increments. Tested by opening two tabs and voting simultaneously—both votes register correctly without race conditions.

**Network timeout**: Axios has 10s timeout. On failure, frontend shows error toast and re-enables the vote button so user can retry. Backend uses asyncHandler wrapper to catch errors and return JSON instead of crashing.

**Invalid option selection**: Backend validates optionId exists in poll.options array before recording vote. Returns 400 with `INVALID_OPTION` if someone tries to vote for a non-existent option via API manipulation.

**Browser refresh after voting**: On page load, frontend calls `/api/vote/check` with fingerprint to see if user already voted. If yes, sets `hasVoted` state and shows results. This persists voted state across refreshes.

---

## Known Limitations

**In-memory rate limiting**: The express-rate-limit middleware stores counters in memory. If I deploy multiple backend instances, each server has its own counters. Same issue with IP vote checks—they're per-server. In production I'd use Redis for shared state across instances.

**Client-side fingerprinting**: Since fingerprint generation happens in the browser, someone could technically modify the JS and send fake fingerprints. I'm trusting the client here because server-side fingerprinting libraries are heavy and still bypassable. The IP layer provides backup, but it's not perfect either.

**No authentication layer**: Anyone with the poll link can view results. Creators can't edit or delete their polls. This was intentional to keep the assignment simple—adding auth would've doubled the scope. For a real product I'd add optional accounts.

**Socket.io single-server**: Socket rooms are in-memory. If I scale horizontally, users on different servers won't see each other's votes in real-time. Fixing this needs Socket.io Redis adapter for pub/sub across servers.

---

## Future Improvements

**Redis for distributed rate limiting**: Move vote checks and rate limits to Redis with sliding windows. This would let the backend scale horizontally without losing anti-abuse protection.

**Optional user accounts**: Let creators claim polls and manage them (edit, delete, analytics). Keep voting anonymous but add ownership. Would enable features like email notifications and poll history.

**CAPTCHA for high-traffic polls**: Add reCAPTCHA or hCaptcha as an optional layer for polls that get suspicious traffic. Make it opt-in so normal polls don't need it.

**Vote analytics dashboard**: Track voting patterns over time, show creators when votes came in, maybe add IP geolocation for geographic distribution. Export to CSV/PDF.

**Socket horizontal scaling**: Add Redis adapter for Socket.io so real-time updates work across multiple backend instances. Also add reconnection logic improvements for flaky mobile connections.

---

## Technical Decisions

**Socket.io vs raw WebSockets**: Socket.io handles reconnection, fallback to long-polling, and room management automatically. Would've taken way longer to implement this with raw WebSockets.

**MongoDB vs PostgreSQL**: Polls have nested arrays (options), and MongoDB's document model fits this naturally. The atomic `$inc` operator was perfect for concurrent vote counting. Also easier to add fields later without migrations.

**Separate votes collection**: Could've stored votes as an array in the poll document, but separating them makes querying easier (check if user voted, count by IP) and keeps poll documents small. Also better for audit trails.

**Hybrid REST + Socket architecture**: Votes go through REST for reliability, Socket.io only handles live updates. This way socket disconnects don't break voting, and I can add retry logic to HTTP requests.

---

## Local Setup

```bash
# Backend
cd backend
npm install
# Add MongoDB URI to .env
npm run dev  # port 5000

# Frontend
cd frontend
npm install
# Add API URL to .env
npm run dev  # port 5173
```

Tested on Chrome, Firefox, Safari. Mobile responsive works on iOS Safari and Android Chrome.

---

**Dev time**: ~18 hours  
**Stack**: React 18, Node.js, Express, Socket.io, MongoDB Atlas, Tailwind CSS
