# 🔐 Authentication - Quick Reference

## ✅ What Was Added

### Backend (7 files)
1. ✅ `models/User.js` - User schema with bcrypt
2. ✅ `controllers/auth.controller.js` - Register, login, logout, getMe
3. ✅ `middleware/auth.js` - JWT verification
4. ✅ `routes/auth.routes.js` - Auth endpoints
5. ✅ Updated `server.js` - Added cookie-parser & auth routes
6. ✅ Updated `routes/poll.routes.js` - Protected create poll
7. ✅ Updated `.env.example` - Added JWT_SECRET

### Frontend (6 files)
1. ✅ `context/AuthContext.jsx` - Global auth state
2. ✅ `components/ProtectedRoute.jsx` - Route protection
3. ✅ `pages/Login.jsx` - Login page
4. ✅ `pages/Register.jsx` - Register page
5. ✅ Updated `App.jsx` - Added AuthProvider & routes
6. ✅ Updated `services/api.js` - Added withCredentials
7. ✅ Updated `components/Navbar.jsx` - User display & logout

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install bcryptjs jsonwebtoken cookie-parser
```

Add to `.env`:
```env
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
```

Restart server:
```bash
npm run dev
```

### 2. Frontend Setup
Already configured! Just run:
```bash
cd frontend
npm run dev
```

---

## 🎯 How It Works

### Flow Diagram
```
┌──────────┐    Register/Login    ┌──────────┐
│  User    │ ──────────────────> │ Backend  │
│          │                      │          │
│          │ <────────────────── │          │
└──────────┘   JWT Cookie Set     └──────────┘
     │
     │ Click "Create Poll"
     ▼
┌──────────┐    Check Auth        ┌──────────┐
│ Frontend │ ──────────────────> │ Context  │
│          │                      │          │
│          │ <────────────────── │          │
└──────────┘   User exists?       └──────────┘
     │
     ├─ Yes → Allow access
     └─ No  → Redirect to /login
```

---

## 🔑 Key Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/logout` | ❌ | Logout |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/polls` | ✅ | Create poll (PROTECTED) |
| POST | `/api/vote` | ❌ | Vote (PUBLIC) |

---

## 🧪 Test It

### 1. Register
- Go to: `http://localhost:5173/register`
- Enter email & password
- Should redirect to `/create`

### 2. Protected Route
- Logout
- Try accessing `/create`
- Should redirect to `/login`

### 3. Public Voting
- Create a poll (while logged in)
- Copy share link
- Open in incognito
- Vote without login ✅

---

## 🔒 Security Features

✅ **Passwords hashed** with bcrypt (12 rounds)  
✅ **JWT in HTTP-only cookie** (XSS protection)  
✅ **Secure flag** in production (HTTPS only)  
✅ **SameSite strict** (CSRF protection)  
✅ **7-day expiry** on tokens  
✅ **Password never returned** from API  

---

## 📝 Interview Answer

**"How did you implement authentication?"**

> "I used JWT-based authentication with HTTP-only cookies for security:
> 
> 1. **Backend:** User registers/logs in → Password hashed with bcrypt → JWT generated → Stored in HTTP-only cookie
> 
> 2. **Frontend:** AuthContext manages global state → ProtectedRoute checks if user exists → Redirects to login if not
> 
> 3. **API Calls:** Cookie automatically sent → Middleware verifies JWT → Attaches user to request
> 
> 4. **Security:** HTTP-only prevents XSS, bcrypt protects passwords, secure flag for HTTPS
> 
> 5. **Design:** Only poll creation requires auth, voting stays public via share links"

---

## 🎨 UI Changes

### Navbar
- Shows user email when logged in
- Logout button appears
- Login button when logged out

### Routes
- `/login` - Login page
- `/register` - Register page
- `/create` - Protected (requires login)
- `/poll/:id` - Public (no login needed)

---

## 🐛 Troubleshooting

**Cookie not sent?**
→ Check `withCredentials: true` in axios

**CORS error?**
→ Add `credentials: true` to CORS config

**User not persisting?**
→ AuthContext calls `checkAuth()` on mount

**Can't create poll?**
→ Make sure you're logged in

---

## 📦 Dependencies Added

**Backend:**
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.6"
}
```

**Frontend:**
No new dependencies! Uses existing axios & react-router.

---

## ✨ What's Protected vs Public

### Protected (Requires Login)
- ✅ Create poll
- ✅ View "My Polls" (future feature)

### Public (No Login)
- ✅ View poll
- ✅ Vote on poll
- ✅ See results
- ✅ Dashboard (all polls)

---

**Ready to deploy!** 🚀

See `AUTHENTICATION.md` for detailed documentation.
