# Quick Start Guide

## ⚠️ Important: Start Both Servers

You need to run **both** the backend and frontend servers for the app to work.

## Step-by-Step Instructions

### 1. Build the Shared Package (First Time Only)

```bash
cd shared
npm run build
cd ..
```

### 2. Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:3001
```

**If you see "Port 3001 is already in use":**
- Find and close any other process using port 3001
- Or use a different port: `PORT=3002 npm run dev`

### 3. Start the Frontend Server

Open a **NEW** terminal (keep the backend running) and run:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 4. Open the App

Open your browser and go to: **http://localhost:3000**

## Troubleshooting

### Connection Errors (ECONNREFUSED, ECONNRESET)

**Problem**: Frontend can't connect to backend

**Solutions**:
1. ✅ Make sure backend is running on port 3001
2. ✅ Check backend terminal for errors
3. ✅ Verify both servers are running simultaneously
4. ✅ Check firewall isn't blocking port 3001

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3001`

**Solutions**:

**Windows:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with the number from above)
taskkill /F /PID <PID>
```

**Mac/Linux:**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)
```

**Or use a different port:**
```bash
PORT=3002 npm run dev
```

### Shared Package Not Built

**Problem**: Import errors from `@energy-manager/shared`

**Solution**:
```bash
cd shared
npm run build
cd ..
```

## Quick Check

To verify everything is working:

1. Backend health check: http://localhost:3001/health
   - Should return: `{"status":"ok"}`

2. Frontend: http://localhost:3000
   - Should load the app without connection errors

## Need Help?

- Check both terminal windows for error messages
- Make sure all dependencies are installed: `npm install` in root
- Verify Node.js version: `node --version` (should be 18+)
