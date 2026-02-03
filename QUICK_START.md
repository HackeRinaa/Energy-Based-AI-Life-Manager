# Quick Start Guide - Energy-Based AI Life Manager

## 🚀 Getting Started

### Step 1: Install Dependencies

From the root directory:
```bash
npm install
```

This will install dependencies for all workspaces (shared, backend, frontend).

### Step 2: Build Shared Package

```bash
cd shared
npm run build
cd ..
```

**Important**: The shared package must be built before running backend or frontend.

### Step 3: Start Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:3001
```

**Keep this terminal open!**

### Step 4: Start Frontend Server

Open a **NEW** terminal and run:
```bash
cd frontend
npm install  # Install @types/node if needed
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### Step 5: Open the App

Open your browser and go to: **http://localhost:3000**

## 🔧 Troubleshooting

### "Module not found" or Import Errors

1. **Make sure shared package is built:**
   ```bash
   cd shared && npm run build && cd ..
   ```

2. **Clear Vite cache:**
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Reinstall dependencies:**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

### Port Already in Use

If port 3001 is in use:
- **Windows**: `netstat -ano | findstr :3001` then `taskkill /F /PID <PID>`
- **Mac/Linux**: `lsof -ti:3001 | xargs kill -9`

Or use a different port: `PORT=3002 npm run dev`

### Backend Won't Start

1. Check if shared package is built
2. Check for TypeScript errors: `cd backend && npx tsc --noEmit`
3. Make sure all dependencies are installed: `npm install`

### Frontend Won't Start

1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Reinstall: `npm install`
3. Check for TypeScript errors: `cd frontend && npx tsc --noEmit`

## 📝 Development Workflow

1. **Make changes to shared package:**
   - Edit files in `shared/src/`
   - Run `cd shared && npm run build`
   - Restart backend/frontend if needed

2. **Backend changes:**
   - Edit files in `backend/src/`
   - Server auto-reloads with `tsx watch`

3. **Frontend changes:**
   - Edit files in `frontend/src/`
   - Vite auto-reloads on save

## ✅ Verification

To verify everything works:

1. **Backend health check:**
   - Open: http://localhost:3001/health
   - Should return: `{"status":"ok"}`

2. **Frontend:**
   - Open: http://localhost:3000
   - Should load without errors
   - Try checking in energy and creating a task

## 🎯 Features to Test

- ✅ Energy check-in (1-5 scale)
- ✅ Sleep hours tracking
- ✅ Task creation with all fields
- ✅ Automatic break scheduling
- ✅ Calendar view
- ✅ Filtering and search
- ✅ Task completion
