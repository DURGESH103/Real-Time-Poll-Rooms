# 🔐 Authentication Implementation Guide

## Overview
Simple JWT-based authentication with email/password. Only authenticated users can create polls. Public users can still vote via share links.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. REGISTER/LOGIN
   User → Frontend Form → POST /api/auth/register or /login
   → Backend validates → Hash password (bcrypt)
   → Create/Find user → Generate JWT → Set HTTP-only cookie
   → Return user data

2. PROTECTED ROUTE ACCESS
   User → Click "Create Poll" → Frontend checks AuthContext
   → If no user → Redirect to /login
   → If user exists → Allow access

3. API REQUEST WITH AUTH
   Frontend → POST /api/polls (create poll)
   → Cookie sent automatically → Backend auth middleware
   → Verify JWT → Attach user to req.user → Allow request

4. LOGOUT
   User → Click logout → POST /api/auth/logout
   → Backend clears cookie → Frontend clears user state
```

---

## 📁 Backend Structure

```
backend/src/
├── models/
│   └── User.js                 # User schema with bcrypt
├── controllers/
│   └── auth.controller.js      # Register, login, logout, getMe
├── middleware/
│   └── auth.js                 # JWT verification middleware
└── routes/
    └── auth.routes.js          # Auth endpoints
```

---

## 🔧 Backend Implementation

### 1. User Model (`models/User.js`)

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**Key Points:**
- `select: false` on password → Never returned in queries by default
- `pre('save')` hook → Auto-hash password on user creation
- `comparePassword` method → Verify login credentials

---

### 2. Auth Controller (`controllers/auth.controller.js`)

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Set cookie
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,              // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',          // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Register
export const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.create({ email, password });
  const token = generateToken(user._id);
  setTokenCookie(res, token);
  res.status(201).json({ success: true, user: { id: user._id, email } });
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = generateToken(user._id);
  setTokenCookie(res, token);
  res.status(200).json({ success: true, user: { id: user._id, email } });
};

// Logout
export const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logout successful' });
};
```

**Key Points:**
- JWT stored in HTTP-only cookie (XSS protection)
- `secure: true` in production (HTTPS only)
- `sameSite: 'strict'` prevents CSRF attacks
- Password never sent back to client

---

### 3. Auth Middleware (`middleware/auth.js`)

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  
  if (!user) {
    return res.status(401).json({ message: 'User no longer exists' });
  }

  req.user = user; // Attach user to request
  next();
};
```

**Usage:**
```javascript
// Protect poll creation route
router.post('/polls', protect, createPoll);
```

---

### 4. Server Setup (`server.js`)

```javascript
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

app.use(cookieParser()); // Parse cookies
app.use('/api/auth', authRoutes);
```

---

## 🎨 Frontend Implementation

### 1. Auth Context (`context/AuthContext.jsx`)

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/me', { withCredentials: true });
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password }, 
      { withCredentials: true });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Key Points:**
- Global auth state management
- Auto-check auth on app load
- `withCredentials: true` sends cookies

---

### 2. Protected Route (`components/ProtectedRoute.jsx`)

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};
```

**Usage in App.jsx:**
```javascript
<Route path="/create" element={
  <ProtectedRoute>
    <CreatePoll />
  </ProtectedRoute>
} />
```

---

### 3. Login Page (`pages/Login.jsx`)

```javascript
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate('/create');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};
```

---

### 4. API Service Update (`services/api.js`)

```javascript
const api = axios.create({
  baseURL: '/api',
  withCredentials: true // Send cookies with every request
});
```

---

## 🔒 Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Password Hashing** | bcrypt (12 rounds) | Protect passwords in DB |
| **HTTP-Only Cookie** | `httpOnly: true` | Prevent XSS attacks |
| **Secure Cookie** | `secure: true` (prod) | HTTPS only |
| **SameSite Cookie** | `sameSite: 'strict'` | Prevent CSRF |
| **JWT Expiry** | 7 days | Auto logout |
| **Password Select** | `select: false` | Never return password |
| **Input Validation** | Email regex, min length | Prevent bad data |

---

## 🚀 Setup Instructions

### Backend

1. **Install packages:**
```bash
cd backend
npm install bcryptjs jsonwebtoken cookie-parser
```

2. **Add to `.env`:**
```env
JWT_SECRET=your-super-secret-key-min-32-characters-long
```

3. **Files created:**
- `models/User.js`
- `controllers/auth.controller.js`
- `middleware/auth.js`
- `routes/auth.routes.js`

4. **Updated files:**
- `server.js` (added cookie-parser, auth routes)
- `routes/poll.routes.js` (added protect middleware)

### Frontend

1. **Files created:**
- `context/AuthContext.jsx`
- `components/ProtectedRoute.jsx`
- `pages/Login.jsx`
- `pages/Register.jsx`

2. **Updated files:**
- `App.jsx` (wrapped with AuthProvider, added routes)
- `services/api.js` (added withCredentials)
- `components/Navbar.jsx` (added user display, logout)

---

## 🧪 Testing

### Manual Test Flow

1. **Register:**
```bash
POST http://localhost:5000/api/auth/register
Body: { "email": "test@example.com", "password": "password123" }
```

2. **Login:**
```bash
POST http://localhost:5000/api/auth/login
Body: { "email": "test@example.com", "password": "password123" }
```

3. **Check Auth:**
```bash
GET http://localhost:5000/api/auth/me
(Cookie sent automatically)
```

4. **Create Poll (Protected):**
```bash
POST http://localhost:5000/api/polls
Body: { "question": "Test?", "options": ["A", "B"] }
(Cookie sent automatically)
```

5. **Logout:**
```bash
POST http://localhost:5000/api/auth/logout
```

### Frontend Test

1. Go to `http://localhost:5173/register`
2. Register with email/password
3. Should redirect to `/create`
4. Try accessing `/create` without login → Redirects to `/login`
5. Vote on poll (no login required) → Works

---

## 📝 Interview Explanation

**Q: How does your authentication work?**

**A:** "I implemented JWT-based authentication with HTTP-only cookies:

1. **Registration/Login:** User submits email/password → Backend hashes password with bcrypt → Generates JWT token → Stores in HTTP-only cookie → Returns user data

2. **Protected Routes:** Frontend checks if user exists in AuthContext → If not, redirects to login → If yes, allows access

3. **API Requests:** Cookie automatically sent with requests → Backend middleware verifies JWT → Attaches user to request → Allows/denies access

4. **Security:** HTTP-only cookies prevent XSS, bcrypt protects passwords, JWT expires in 7 days, secure flag for HTTPS in production

5. **Public Access:** Poll voting doesn't require auth, only poll creation does"

---

## 🎯 Key Design Decisions

| Decision | Reason |
|----------|--------|
| JWT in cookie (not localStorage) | Prevent XSS attacks |
| HTTP-only cookie | JavaScript cannot access token |
| bcrypt (not plain text) | Industry standard password hashing |
| 7-day expiry | Balance security and UX |
| Protect only poll creation | Allow public voting via share links |
| No OAuth | Keep simple for interview |
| Context API (not Redux) | Sufficient for auth state |

---

## 🔮 Future Enhancements

- Email verification
- Password reset flow
- Refresh tokens
- OAuth (Google, GitHub)
- Rate limiting on auth endpoints
- Account deletion
- Profile management

---

## 🐛 Common Issues

**Issue:** Cookie not sent with requests
**Fix:** Add `withCredentials: true` to axios config

**Issue:** CORS error
**Fix:** Add `credentials: true` to CORS config

**Issue:** Cookie not set in production
**Fix:** Ensure `secure: true` and HTTPS enabled

**Issue:** User not persisting on refresh
**Fix:** Call `checkAuth()` in useEffect on mount

---

**Built with security and simplicity in mind** 🔐
