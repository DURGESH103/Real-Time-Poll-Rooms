# 🔐 JWT Authentication Persistence - Complete Guide

## 🔴 Problem: Redirect to /login on Refresh

**What happens:**
1. Login → Works ✅
2. Navigate around → Works ✅
3. **Refresh page → Redirects to /login** ❌

---

## 🎯 Why This Happens

### The Flow on Refresh:

```
1. Page Refreshes
   ↓
2. React App Loads
   ↓
3. AuthContext mounts
   ↓
4. useEffect runs → checkAuth()
   ↓
5. Calls GET /api/auth/me
   ↓
6. Backend Response:
   - ✅ 200 + user data → Set user → Stay logged in
   - ❌ 404 Not Found → Set user = null → Redirect to login
   - ❌ 401 Unauthorized → Set user = null → Redirect to login
   ↓
7. ProtectedRoute checks user
   ↓
8. If user = null → <Navigate to="/login" />
```

### Root Cause in Your Case:

**Your backend auth routes are NOT deployed to production yet!**

When frontend calls:
```
GET https://poll-backend-sh3b.onrender.com/api/auth/me
```

It gets **404 Not Found** because the auth routes don't exist on your deployed backend.

---

## ✅ Your Implementation is CORRECT

### 1. Backend `/me` Endpoint ✅

```javascript
// routes/auth.routes.js
router.get('/me', protect, getMe);

// controllers/auth.controller.js
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// middleware/auth.js
export const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  req.user = user;
  next();
};
```

**How it works:**
- Client sends request with httpOnly cookie
- Middleware extracts JWT from cookie
- Verifies JWT and finds user
- Returns user data

---

### 2. Frontend AuthContext ✅

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Important!

  useEffect(() => {
    checkAuth(); // Runs on mount
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true // Sends cookie
      });
      if (response.data.success) {
        setUser(response.data.user); // Restore user
      }
    } catch (error) {
      setUser(null); // Not logged in
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // ... login, register, logout
};
```

**How it works:**
- On app load, `useEffect` runs
- Calls `/api/auth/me` with cookie
- If successful, restores user state
- Sets `loading = false` when done

---

### 3. ProtectedRoute Component ✅

```javascript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // CRITICAL: Wait for auth check to complete
  if (loading) {
    return <LoadingSpinner />;
  }

  // After loading, check if user exists
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

**Why `loading` is critical:**
- Without it, `user` is `null` initially
- Would redirect to login immediately
- With it, waits for `checkAuth()` to complete

---

## 🔧 The Solution

### Your code is correct! Just deploy the backend:

```bash
# 1. Commit changes
git add .
git commit -m "Add authentication system"
git push origin main

# 2. Add JWT_SECRET to Render
# Go to Render Dashboard → Environment
JWT_SECRET=<generate-strong-secret>

# 3. Wait for deployment (2-3 min)

# 4. Test
curl https://poll-backend-sh3b.onrender.com/api/auth/me
# Should return 401 (not 404!)
```

---

## 🧪 How to Test Locally

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Test Flow
```bash
# 1. Open http://localhost:5173
# 2. Register/Login
# 3. Check DevTools → Application → Cookies
#    Should see: token = <jwt>
# 4. Refresh page
# 5. Should stay logged in ✅
```

---

## 📊 Authentication Flow Diagram

### On Login:
```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Backend validates
    ↓
Generate JWT
    ↓
Set httpOnly cookie
    ↓
Return user data
    ↓
Frontend sets user state
    ↓
Navigate to home
```

### On Refresh:
```
Page loads
    ↓
AuthContext mounts
    ↓
loading = true (show spinner)
    ↓
GET /api/auth/me (with cookie)
    ↓
Backend verifies JWT from cookie
    ↓
Return user data
    ↓
Frontend sets user state
    ↓
loading = false
    ↓
ProtectedRoute checks user
    ↓
user exists → Show page ✅
```

---

## 🔒 Security Features (Already Implemented)

### 1. httpOnly Cookie ✅
```javascript
res.cookie('token', token, {
  httpOnly: true,        // Cannot access via JavaScript
  secure: NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',    // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

**Benefits:**
- XSS protection (JS can't read cookie)
- Automatic sending with requests
- Secure in production (HTTPS)

### 2. JWT Verification ✅
```javascript
const decoded = jwt.verify(token, JWT_SECRET);
```

**Benefits:**
- Tamper-proof
- Stateless
- Expires automatically

### 3. User Validation ✅
```javascript
const user = await User.findById(decoded.id);
if (!user) return res.status(401);
```

**Benefits:**
- Ensures user still exists
- Can revoke access by deleting user

---

## 🐛 Common Issues & Solutions

### Issue 1: Still redirects after deployment
**Cause:** Cookie not being sent
**Check:**
```javascript
// Frontend - axios config
axios.create({
  withCredentials: true // ✅ Already set
});
```

**Check:**
```javascript
// Backend - CORS config
cors({
  origin: FRONTEND_URL,
  credentials: true // ✅ Already set
});
```

### Issue 2: 401 Unauthorized
**Cause:** JWT_SECRET mismatch
**Fix:** Ensure same secret in both environments

### Issue 3: Cookie not set
**Cause:** Domain mismatch
**Fix:** Check CORS allows your frontend domain

### Issue 4: Works locally, not in production
**Cause:** `secure: true` requires HTTPS
**Fix:** Already handled with `NODE_ENV` check

---

## 📝 Complete Code Reference

### Backend Structure
```
backend/src/
├── models/User.js              # User model
├── controllers/
│   └── auth.controller.js      # register, login, logout, getMe
├── middleware/
│   └── auth.js                 # protect middleware
├── routes/
│   └── auth.routes.js          # /api/auth/*
└── server.js                   # Register routes
```

### Frontend Structure
```
frontend/src/
├── context/
│   └── AuthContext.jsx         # Auth state + checkAuth
├── components/
│   └── ProtectedRoute.jsx      # Route guard
├── pages/
│   ├── Login.jsx               # Login form
│   └── Register.jsx            # Register form
└── App.jsx                     # Routes
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend health: `GET /health` → 200
- [ ] Auth endpoint exists: `GET /api/auth/me` → 401 (not 404)
- [ ] Can register: `POST /api/auth/register` → 201
- [ ] Can login: `POST /api/auth/login` → 200
- [ ] Cookie is set: Check DevTools → Application → Cookies
- [ ] Refresh works: Login → Refresh → Still logged in ✅
- [ ] Logout works: Logout → Cookie cleared → Redirects to login

---

## 🎯 Why Your Implementation is Best Practice

✅ **httpOnly cookies** - XSS protection  
✅ **JWT with expiry** - Stateless + auto-logout  
✅ **Loading state** - Prevents flash of login page  
✅ **Automatic restore** - Seamless UX  
✅ **Protected middleware** - Backend security  
✅ **Route guards** - Frontend protection  
✅ **CORS with credentials** - Secure cross-origin  

---

## 🚀 Quick Fix Summary

**Your code is correct!** The issue is:

1. **Backend not deployed** → Getting 404 on `/api/auth/me`
2. **Solution:** Deploy backend to Render
3. **Add:** JWT_SECRET environment variable
4. **Result:** Refresh will work perfectly ✅

---

## 📞 Debug Commands

```bash
# Check if backend is deployed
curl https://poll-backend-sh3b.onrender.com/health

# Check if auth endpoint exists
curl https://poll-backend-sh3b.onrender.com/api/auth/me
# Should return: {"success":false,"message":"Not authenticated"}
# NOT: 404 Not Found

# Test login
curl -X POST https://poll-backend-sh3b.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}' \
  --cookie-jar cookies.txt

# Test /me with cookie
curl https://poll-backend-sh3b.onrender.com/api/auth/me \
  --cookie cookies.txt
# Should return user data
```

---

**Once deployed, authentication will persist perfectly across refreshes!** 🎉
