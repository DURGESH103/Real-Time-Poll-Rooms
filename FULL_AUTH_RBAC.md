# 🔐 Full Authentication & Role-Based Authorization

## Overview
Complete authentication system where ALL routes require login. Admin users have additional privileges to manage polls and view system stats.

---

## 🏗️ Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. USER REGISTRATION/LOGIN
   User → Register/Login Form → Backend validates
   → Hash password (bcrypt) → Generate JWT
   → Set HTTP-only cookie → Return user with role

2. ROUTE ACCESS (ALL PROTECTED)
   User → Try to access ANY route → Frontend checks AuthContext
   → No user? → Redirect to /login
   → Has user? → Allow access

3. ADMIN ACCESS
   Admin user → Try to access /admin → Check role
   → Not admin? → Redirect to home
   → Is admin? → Allow access

4. API REQUESTS
   Frontend → API call → Cookie sent automatically
   → Backend middleware verifies JWT → Check user exists
   → Attach user to req.user → Process request

5. ADMIN API REQUESTS
   Admin → Admin API call → Verify JWT → Check role
   → Not admin? → 403 Forbidden
   → Is admin? → Process request
```

---

## 📁 Backend Structure

```
backend/src/
├── models/
│   └── User.js                    # Added role field (user/admin)
├── controllers/
│   ├── auth.controller.js         # Updated to return role
│   └── admin.controller.js        # NEW: Admin operations
├── middleware/
│   └── auth.js                    # Added requireAdmin middleware
├── routes/
│   ├── auth.routes.js             # Auth endpoints
│   ├── admin.routes.js            # NEW: Admin endpoints
│   ├── poll.routes.js             # Protected with auth
│   └── vote.routes.js             # Protected with auth
└── server.js                      # Added admin routes
```

---

## 🔧 Backend Implementation

### 1. User Model (Updated)

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user'  // NEW
  },
  createdAt: { type: Date, default: Date.now }
});
```

**Key Changes:**
- Added `role` field with enum ['user', 'admin']
- Default role is 'user'

---

### 2. Auth Middleware (Updated)

```javascript
// middleware/auth.js

// Existing protect middleware (unchanged)
export const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ message: 'User not found' });
  
  req.user = user;
  next();
};

// NEW: Admin-only middleware
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};
```

**Usage:**
```javascript
// Protect route (any authenticated user)
router.get('/polls', protect, getAllPolls);

// Admin-only route
router.delete('/polls/:id', protect, requireAdmin, deletePoll);
```

---

### 3. Admin Controller (NEW)

```javascript
// controllers/admin.controller.js

// Get all polls with vote counts
export const getAllPolls = async (req, res) => {
  const polls = await Poll.find().sort({ createdAt: -1 });
  const pollsWithVotes = await Promise.all(
    polls.map(async (poll) => {
      const voteCount = await Vote.countDocuments({ pollId: poll.pollId });
      return { ...poll.toObject(), totalVotes: voteCount };
    })
  );
  res.json({ success: true, polls: pollsWithVotes });
};

// Delete poll and associated votes
export const deletePoll = async (req, res) => {
  const { pollId } = req.params;
  await Poll.deleteOne({ pollId });
  await Vote.deleteMany({ pollId });
  res.json({ success: true, message: 'Poll deleted' });
};

// Get system statistics
export const getStats = async (req, res) => {
  const totalPolls = await Poll.countDocuments();
  const totalVotes = await Vote.countDocuments();
  const totalUsers = await User.countDocuments();
  res.json({ success: true, stats: { totalPolls, totalVotes, totalUsers } });
};
```

---

### 4. Admin Routes (NEW)

```javascript
// routes/admin.routes.js
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(protect, requireAdmin);

router.get('/polls', getAllPolls);
router.delete('/polls/:pollId', deletePoll);
router.get('/stats', getStats);
```

---

### 5. Protected Routes (Updated)

```javascript
// routes/poll.routes.js
router.use(protect); // Protect ALL poll routes

router.get('/', getAllPolls);
router.post('/', createPoll);
router.get('/:pollId', getPoll);
router.get('/:pollId/results', getPollResults);

// routes/vote.routes.js
router.use(protect); // Protect ALL vote routes

router.post('/', submitVote);
router.post('/check', checkVoteStatus);
```

---

### 6. Auth Controller (Updated)

```javascript
// controllers/auth.controller.js

// Register - now returns role
export const register = async (req, res) => {
  const user = await User.create({ email, password });
  const token = generateToken(user._id);
  setTokenCookie(res, token);
  res.json({ 
    success: true, 
    user: { id: user._id, email: user.email, role: user.role } // Added role
  });
};

// Login - now returns role
export const login = async (req, res) => {
  const user = await User.findOne({ email }).select('+password');
  const isValid = await user.comparePassword(password);
  const token = generateToken(user._id);
  setTokenCookie(res, token);
  res.json({ 
    success: true, 
    user: { id: user._id, email: user.email, role: user.role } // Added role
  });
};

// GetMe - now returns role
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ 
    success: true, 
    user: { id: user._id, email: user.email, role: user.role } // Added role
  });
};
```

---

## 🎨 Frontend Implementation

### 1. Auth Context (Updated)

```javascript
// context/AuthContext.jsx

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const res = await axios.get('/api/auth/me', { withCredentials: true });
    setUser(res.data.user); // Now includes role
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAdmin: user?.role === 'admin' // NEW: Helper
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### 2. Protected Route (Existing)

```javascript
// components/ProtectedRoute.jsx

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};
```

---

### 3. Admin Route (NEW)

```javascript
// components/AdminRoute.jsx

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />; // Not admin
  
  return children;
};
```

---

### 4. Admin Page (NEW)

```javascript
// pages/Admin.jsx

const Admin = () => {
  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [pollsRes, statsRes] = await Promise.all([
      axios.get('/api/admin/polls', { withCredentials: true }),
      axios.get('/api/admin/stats', { withCredentials: true })
    ]);
    setPolls(pollsRes.data.polls);
    setStats(statsRes.data.stats);
  };

  const handleDelete = async (pollId) => {
    await axios.delete(`/api/admin/polls/${pollId}`, { withCredentials: true });
    setPolls(polls.filter(p => p.pollId !== pollId));
  };

  return (
    <div>
      {/* Stats Cards */}
      <div>Total Polls: {stats.totalPolls}</div>
      <div>Total Votes: {stats.totalVotes}</div>
      <div>Total Users: {stats.totalUsers}</div>

      {/* Polls Table */}
      <table>
        {polls.map(poll => (
          <tr key={poll.pollId}>
            <td>{poll.question}</td>
            <td>{poll.totalVotes}</td>
            <td>
              <button onClick={() => handleDelete(poll.pollId)}>Delete</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};
```

---

### 5. App Routes (Updated)

```javascript
// App.jsx

<Routes>
  {/* All routes protected */}
  <Route element={<MainLayout />}>
    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/create" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  </Route>
  
  <Route element={<PublicPollLayout />}>
    <Route path="/poll/:pollId" element={<ProtectedRoute><PollRoom /></ProtectedRoute>} />
  </Route>
  
  {/* Admin route */}
  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
  
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Routes>
```

---

### 6. Navbar (Updated)

```javascript
// components/Navbar.jsx

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav>
      <button onClick={() => navigate('/')}>Home</button>
      <button onClick={() => navigate('/dashboard')}>Dashboard</button>
      <button onClick={() => navigate('/create')}>Create</button>
      
      {/* Show admin button only for admins */}
      {isAdmin && (
        <button onClick={() => navigate('/admin')}>Admin</button>
      )}
      
      <div>{user.email}</div>
      <button onClick={logout}>Logout</button>
    </nav>
  );
};
```

---

## 🔒 Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Password Hashing** | bcrypt (12 rounds) | Protect passwords |
| **HTTP-Only Cookie** | `httpOnly: true` | Prevent XSS |
| **Secure Cookie** | `secure: true` (prod) | HTTPS only |
| **JWT Expiry** | 7 days | Auto logout |
| **Role-Based Access** | Enum validation | Prevent privilege escalation |
| **Middleware Chain** | protect → requireAdmin | Layered security |
| **Frontend Guards** | ProtectedRoute, AdminRoute | UI protection |

---

## 🚀 Setup Instructions

### Backend

1. **No new packages needed** (already installed)

2. **Create admin user manually in MongoDB:**
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

3. **Files created:**
- `controllers/admin.controller.js`
- `routes/admin.routes.js`

4. **Files updated:**
- `models/User.js` (added role)
- `middleware/auth.js` (added requireAdmin)
- `controllers/auth.controller.js` (return role)
- `routes/poll.routes.js` (protect all)
- `routes/vote.routes.js` (protect all)
- `server.js` (added admin routes)

### Frontend

1. **Files created:**
- `components/AdminRoute.jsx`
- `pages/Admin.jsx`

2. **Files updated:**
- `context/AuthContext.jsx` (added isAdmin)
- `App.jsx` (protect all routes, add admin route)
- `components/Navbar.jsx` (add admin button)
- `pages/Login.jsx` (redirect to home)
- `pages/Register.jsx` (redirect to home)

---

## 🧪 Testing

### 1. Test Regular User Flow

```bash
# Register new user
POST /api/auth/register
Body: { "email": "user@test.com", "password": "password123" }

# Try to access home (should work)
GET / → Redirects to home page

# Try to access admin (should fail)
GET /admin → Redirects to home

# Try admin API (should fail)
GET /api/admin/polls → 403 Forbidden
```

### 2. Test Admin User Flow

```bash
# Login as admin
POST /api/auth/login
Body: { "email": "admin@example.com", "password": "password123" }

# Access admin page (should work)
GET /admin → Shows admin dashboard

# Access admin API (should work)
GET /api/admin/polls → Returns all polls
GET /api/admin/stats → Returns system stats
DELETE /api/admin/polls/:pollId → Deletes poll
```

### 3. Test Protected Routes

```bash
# Without login
GET / → Redirects to /login
GET /create → Redirects to /login
GET /poll/:id → Redirects to /login
GET /dashboard → Redirects to /login

# With login
GET / → Shows home page
GET /create → Shows create poll page
GET /poll/:id → Shows poll page
GET /dashboard → Shows dashboard
```

---

## 📝 Interview Explanation

**Q: Explain your authentication and authorization system**

**A:** "I implemented a complete JWT-based authentication with role-based authorization:

**Authentication (Who are you?):**
1. User registers/logs in → Password hashed with bcrypt → JWT generated → Stored in HTTP-only cookie
2. ALL routes require authentication → Frontend checks AuthContext → Redirects to login if not authenticated
3. Backend verifies JWT on every API call → Middleware checks token → Attaches user to request

**Authorization (What can you do?):**
1. User model has role field: 'user' or 'admin'
2. Regular users can create polls, vote, view dashboard
3. Admin users have additional privileges:
   - Access /admin page
   - View all polls with stats
   - Delete any poll
   - View system statistics

**Implementation:**
- Backend: Two middleware layers - `protect` (auth) and `requireAdmin` (authorization)
- Frontend: Two route guards - `ProtectedRoute` (auth) and `AdminRoute` (admin only)
- Security: HTTP-only cookies, bcrypt hashing, role validation, layered middleware

**Flow:**
- User tries to access route → Check if logged in → Check if has required role → Allow/deny access"

---

## 🎯 Key Design Decisions

| Decision | Reason |
|----------|--------|
| All routes protected | Requirement: Must login for ANY action |
| Role in User model | Simple enum, easy to validate |
| Two middleware layers | Separation of concerns (auth vs authorization) |
| Two route guards | Frontend protection + UX |
| Admin role only | Simple RBAC, can extend to more roles |
| Manual admin creation | Prevent unauthorized admin registration |
| HTTP-only cookies | Security best practice |

---

## 🔮 Future Enhancements

- Multiple roles (moderator, viewer, etc.)
- Permission-based access (RBAC → ABAC)
- Admin user management UI
- Audit logs for admin actions
- Role assignment by super admin
- Temporary role elevation
- API key authentication for integrations

---

## 🐛 Common Issues

**Issue:** Can't access any route after login
**Fix:** Check if AuthContext is properly checking auth on mount

**Issue:** Admin button not showing
**Fix:** Verify user.role === 'admin' in database

**Issue:** 403 on admin API
**Fix:** Ensure user has admin role and middleware order is correct

**Issue:** Redirect loop
**Fix:** Make sure /login and /register are NOT protected

---

## 📊 API Endpoints Summary

### Public Endpoints
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Protected Endpoints (Any authenticated user)
- `GET /api/auth/me` - Get current user
- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create poll
- `GET /api/polls/:pollId` - Get poll
- `GET /api/polls/:pollId/results` - Get results
- `POST /api/vote` - Submit vote
- `POST /api/vote/check` - Check vote status

### Admin-Only Endpoints
- `GET /api/admin/polls` - Get all polls with stats
- `DELETE /api/admin/polls/:pollId` - Delete poll
- `GET /api/admin/stats` - Get system statistics

---

**Production-ready, secure, and interview-friendly!** 🔐
