# Deployment Guide - Real-Time Poll Rooms

## Prerequisites
- MongoDB Atlas account (free tier)
- Render/Railway account (backend hosting)
- Vercel account (frontend hosting)
- Git repository

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click "Build a Database"
4. Choose **FREE** tier (M0 Sandbox)
5. Select cloud provider and region (closest to your users)
6. Click "Create Cluster"

### 1.2 Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `polluser` (or your choice)
5. Password: Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to your server IPs
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials
6. Add database name: `mongodb+srv://...mongodb.net/pollrooms?retryWrites=true&w=majority`

---

## Step 2: Backend Deployment (Render)

### 2.1 Prepare Repository
1. Push your code to GitHub
2. Ensure `.gitignore` excludes `node_modules/` and `.env`

### 2.2 Deploy on Render
1. Go to [Render](https://render.com)
2. Sign up / Log in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `poll-rooms-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 2.3 Set Environment Variables
Click "Advanced" → "Add Environment Variable":

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://polluser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pollrooms?retryWrites=true&w=majority
FRONTEND_URL=https://your-app.vercel.app
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10
POLL_TTL_DAYS=30
MAX_POLL_OPTIONS=10
MIN_POLL_OPTIONS=2
```

**Important**: Replace:
- `YOUR_PASSWORD` with your MongoDB password
- `your-app.vercel.app` with your actual Vercel URL (update after frontend deployment)

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://poll-rooms-backend.onrender.com`

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Create .env for Production
In `frontend/.env`:
```
VITE_API_URL=https://poll-rooms-backend.onrender.com
VITE_SOCKET_URL=https://poll-rooms-backend.onrender.com
```

### 3.2 Deploy on Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up / Log in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Set Environment Variables
Add environment variables:
```
VITE_API_URL=https://poll-rooms-backend.onrender.com
VITE_SOCKET_URL=https://poll-rooms-backend.onrender.com
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL: `https://your-app.vercel.app`

---

## Step 4: Update Backend CORS

### 4.1 Update Backend Environment Variable
1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Save changes (will trigger redeploy)

---

## Step 5: Verify Deployment

### 5.1 Test Backend
Visit: `https://poll-rooms-backend.onrender.com/health`

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Create a test poll
3. Open poll link in incognito window
4. Vote and verify real-time updates

---

## Alternative: Railway Deployment

### Backend on Railway
1. Go to [Railway](https://railway.app)
2. Sign up / Log in
3. Click "New Project" → "Deploy from GitHub repo"
4. Select repository
5. Add environment variables (same as Render)
6. Railway will auto-detect Node.js and deploy

### Environment Variables
Same as Render setup above.

---

## Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly (no trailing slash)

### Issue: Socket Connection Failed
**Solution**: 
- Check `VITE_SOCKET_URL` matches backend URL
- Ensure backend is running (check health endpoint)
- Check browser console for errors

### Issue: Database Connection Failed
**Solution**:
- Verify MongoDB connection string is correct
- Check MongoDB Atlas network access allows 0.0.0.0/0
- Verify database user credentials

### Issue: Votes Not Updating in Real-Time
**Solution**:
- Check socket connection status (green "Live" indicator)
- Verify backend logs for socket errors
- Test with multiple browser windows

### Issue: Rate Limit Errors
**Solution**:
- Adjust `RATE_LIMIT_MAX_REQUESTS` in backend env
- Clear browser cache and cookies
- Try from different network/IP

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 for testing)
- [ ] Backend deployed on Render/Railway
- [ ] All backend environment variables set
- [ ] Backend health endpoint returns 200
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables set
- [ ] CORS configured correctly (FRONTEND_URL matches)
- [ ] Test poll creation works
- [ ] Test voting works
- [ ] Test real-time updates work
- [ ] Test from multiple devices/browsers
- [ ] Test error handling (invalid poll ID, duplicate votes)

---

## Monitoring & Maintenance

### Check Backend Logs
**Render**: Dashboard → Service → Logs
**Railway**: Dashboard → Project → Deployments → Logs

### Check Frontend Logs
**Vercel**: Dashboard → Project → Deployments → Function Logs

### Database Monitoring
**MongoDB Atlas**: Dashboard → Metrics

### Expected Metrics
- Response time: <500ms
- Socket connection: <2s
- Vote submission: <1s
- Real-time update latency: <500ms

---

## Scaling Considerations

### Free Tier Limits
- **Render**: 750 hours/month, sleeps after 15min inactivity
- **Vercel**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage, shared CPU

### When to Upgrade
- >1000 concurrent users → Upgrade Render instance
- >10GB data → Upgrade MongoDB cluster
- >100GB bandwidth → Upgrade Vercel plan

### Performance Optimization
1. Enable MongoDB indexes (already configured)
2. Add Redis for rate limiting (optional)
3. Enable CDN for static assets
4. Add database connection pooling
5. Implement caching for poll data

---

## Security Hardening (Production)

1. **Restrict MongoDB Network Access**
   - Remove 0.0.0.0/0
   - Add only Render/Railway IP ranges

2. **Enable Rate Limiting**
   - Already configured in code
   - Adjust limits based on usage

3. **Add Helmet Security Headers**
   - Already configured in code

4. **Environment Variables**
   - Never commit `.env` files
   - Use platform secret management

5. **HTTPS Only**
   - Render/Vercel provide HTTPS by default
   - Ensure `FRONTEND_URL` uses `https://`

---

## Cost Estimate

### Free Tier (Sufficient for 2-3 day project)
- MongoDB Atlas: $0
- Render: $0
- Vercel: $0
- **Total: $0/month**

### Production Scale (1000+ users)
- MongoDB Atlas M10: $57/month
- Render Standard: $7/month
- Vercel Pro: $20/month
- **Total: ~$84/month**
