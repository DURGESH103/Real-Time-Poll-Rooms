# 🚀 Deployment Checklist - Authentication System

## ❌ Current Issue
**404 errors on `/api/auth/*` endpoints** - Backend deployment doesn't have the new auth files.

---

## ✅ Deployment Steps

### 1. Backend Deployment (Render)

#### A. Add Environment Variables
Go to Render Dashboard → Your Service → Environment → Add:

```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-in-production
PRODUCTION_URL=https://real-time-poll-rooms-beta.vercel.app
```

**Important:** Generate a strong JWT secret for production:
```bash
# Generate random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### B. Commit & Push Changes
```bash
cd backend

# Check what files were added/modified
git status

# Add all new files
git add .

# Commit
git commit -m "Add authentication and role-based authorization"

# Push to trigger redeployment
git push origin main
```

#### C. Verify Deployment
After Render redeploys (2-3 minutes):
```bash
# Test health check
curl https://poll-backend-sh3b.onrender.com/health

# Test auth endpoint
curl https://poll-backend-sh3b.onrender.com/api/auth/me
# Should return 401 (not 404)
```

---

### 2. Frontend Deployment (Vercel)

#### A. Update Environment Variables
Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
VITE_API_URL=https://poll-backend-sh3b.onrender.com
VITE_SOCKET_URL=https://poll-backend-sh3b.onrender.com
```

#### B. Commit & Push
```bash
cd frontend

git add .
git commit -m "Add authentication UI and protected routes"
git push origin main
```

Vercel will auto-deploy.

---

### 3. Database Setup (MongoDB Atlas)

#### A. Create Admin User
Connect to MongoDB Atlas and run:

```javascript
// Option 1: Using MongoDB Compass
// Connect to your cluster
// Go to "polling" database → "users" collection
// Find your user and update:
{
  "email": "admin@example.com",
  "role": "admin"
}

// Option 2: Using MongoDB Shell
use polling
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Or register a new admin user:**
1. Register normally via UI
2. Update role in database manually
3. Logout and login again

---

## 🧪 Testing After Deployment

### 1. Test Registration
```bash
curl -X POST https://poll-backend-sh3b.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  --cookie-jar cookies.txt
```

### 2. Test Login
```bash
curl -X POST https://poll-backend-sh3b.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  --cookie-jar cookies.txt
```

### 3. Test Protected Route
```bash
curl https://poll-backend-sh3b.onrender.com/api/polls \
  --cookie cookies.txt
```

### 4. Test Frontend
1. Go to https://real-time-poll-rooms-beta.vercel.app
2. Should redirect to /login
3. Register new account
4. Should redirect to home
5. Try creating poll (should work)
6. Logout and try accessing home (should redirect to login)

---

## 📋 Files Added/Modified

### Backend Files Added:
- ✅ `src/models/User.js`
- ✅ `src/controllers/auth.controller.js`
- ✅ `src/controllers/admin.controller.js`
- ✅ `src/middleware/auth.js`
- ✅ `src/routes/auth.routes.js`
- ✅ `src/routes/admin.routes.js`

### Backend Files Modified:
- ✅ `src/server.js`
- ✅ `src/routes/poll.routes.js`
- ✅ `src/routes/vote.routes.js`
- ✅ `package.json` (added bcryptjs, jsonwebtoken, cookie-parser)

### Frontend Files Added:
- ✅ `src/context/AuthContext.jsx`
- ✅ `src/components/ProtectedRoute.jsx`
- ✅ `src/components/AdminRoute.jsx`
- ✅ `src/pages/Login.jsx`
- ✅ `src/pages/Register.jsx`
- ✅ `src/pages/Admin.jsx`

### Frontend Files Modified:
- ✅ `src/App.jsx`
- ✅ `src/services/api.js`
- ✅ `src/components/Navbar.jsx`

---

## 🔧 Quick Fix Commands

### If backend still shows 404:

```bash
# 1. Verify files exist
ls backend/src/routes/
# Should show: auth.routes.js, admin.routes.js

# 2. Check package.json has dependencies
cat backend/package.json | grep bcryptjs
cat backend/package.json | grep jsonwebtoken
cat backend/package.json | grep cookie-parser

# 3. Install dependencies
cd backend
npm install

# 4. Test locally first
npm run dev
# Then test: curl http://localhost:5000/api/auth/me

# 5. If local works, commit and push
git add .
git commit -m "Fix: Add authentication system"
git push origin main
```

---

## 🐛 Common Deployment Issues

### Issue 1: 404 on auth routes
**Cause:** Files not pushed to Git
**Fix:** 
```bash
git add backend/src/routes/auth.routes.js
git add backend/src/controllers/auth.controller.js
git commit -m "Add auth files"
git push
```

### Issue 2: 500 Internal Server Error
**Cause:** Missing JWT_SECRET
**Fix:** Add JWT_SECRET in Render environment variables

### Issue 3: CORS errors
**Cause:** PRODUCTION_URL not set
**Fix:** Add PRODUCTION_URL=https://real-time-poll-rooms-beta.vercel.app in Render

### Issue 4: Cookie not set
**Cause:** secure flag requires HTTPS
**Fix:** Already handled - secure: process.env.NODE_ENV === 'production'

### Issue 5: Can't login after deployment
**Cause:** Database connection issue
**Fix:** Verify MONGODB_URI in Render environment variables

---

## 📝 Environment Variables Summary

### Render (Backend)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://durgesh_kumar:GQI6yL3PzHeUbT0L@cluster0.3wydx.mongodb.net/polling
FRONTEND_URL=http://localhost:5173
PRODUCTION_URL=https://real-time-poll-rooms-beta.vercel.app
JWT_SECRET=<generate-strong-secret-here>
```

### Vercel (Frontend)
```env
VITE_API_URL=https://poll-backend-sh3b.onrender.com
VITE_SOCKET_URL=https://poll-backend-sh3b.onrender.com
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend health check works: `/health`
- [ ] Auth endpoints return 401 (not 404): `/api/auth/me`
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Cookie is set in browser
- [ ] Protected routes require login
- [ ] Can create poll after login
- [ ] Can vote on poll after login
- [ ] Admin user can access `/admin`
- [ ] Regular user cannot access `/admin`
- [ ] Logout works correctly

---

## 🚀 Next Steps After Deployment

1. **Test the full flow:**
   - Register → Login → Create Poll → Vote → Logout

2. **Create admin user:**
   - Register via UI
   - Update role in MongoDB
   - Test admin features

3. **Monitor logs:**
   - Check Render logs for errors
   - Check browser console for errors

4. **Update documentation:**
   - Add production URLs to README
   - Document admin user creation process

---

**Once deployed, all routes will require authentication!** 🔐
