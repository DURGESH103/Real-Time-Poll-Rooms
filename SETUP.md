# 🚀 Quick Setup Instructions

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 2: Configure Environment Variables

### Backend (.env)
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pollrooms
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10
POLL_TTL_DAYS=30
MAX_POLL_OPTIONS=10
MIN_POLL_OPTIONS=2
```

### Frontend (.env)
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Step 3: Start MongoDB

### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/docs/manual/installation/

# Start MongoDB service
mongod
```

### Option B: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend/.env

---

## Step 4: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

---

## Step 5: Test the Application

1. Open browser: http://localhost:5173
2. Create a poll
3. Copy share link
4. Open link in incognito window
5. Vote and see real-time updates!

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service or use MongoDB Atlas

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in backend/.env or kill process using port

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Ensure FRONTEND_URL in backend/.env matches frontend URL

### Socket Connection Failed
```
WebSocket connection failed
```
**Solution**: 
- Check backend is running
- Verify VITE_SOCKET_URL in frontend/.env
- Check browser console for errors

---

## Next Steps

1. ✅ Read [README.md](README.md) for full documentation
2. ✅ Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. ✅ Check [TESTING.md](TESTING.md) for test cases
4. ✅ Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy

---

## Development Commands

### Backend
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Project Structure Overview

```
Real-Time Poll Rooms/
├── backend/          # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── server.js       # Entry point
│   │   ├── config/         # DB & Socket config
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Validation, rate limiting
│   └── package.json
│
└── frontend/         # React + Vite + Tailwind
    ├── src/
    │   ├── main.jsx        # Entry point
    │   ├── App.jsx         # Main component
    │   ├── pages/          # Page components
    │   ├── components/     # Reusable components
    │   ├── services/       # API & Socket clients
    │   └── hooks/          # Custom hooks
    └── package.json
```

---

## Tech Stack

**Frontend:**
- React 18.2
- Vite 5.0
- Tailwind CSS 3.4
- Socket.io Client 4.6
- Axios 1.6
- React Router 6.21

**Backend:**
- Node.js 20+
- Express 4.18
- Socket.io 4.6
- MongoDB + Mongoose 8.0
- Joi (validation)
- Helmet (security)

---

## Useful Links

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Render (Backend)**: https://render.com
- **Vercel (Frontend)**: https://vercel.com
- **Socket.io Docs**: https://socket.io/docs/v4/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Ready to build! 🎉**
