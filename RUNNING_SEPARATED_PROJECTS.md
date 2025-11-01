# Running Frontend and Backend Separately

This guide explains how to run the SalonBook application with separated frontend (Next.js) and backend (Express.js) in VS Code.

## 📁 Project Structure

```
salonbook/
├── backend/              # Express.js Backend API
│   ├── src/
│   │   ├── db/          # Database schemas and connection
│   │   ├── routes/      # Express API routes
│   │   ├── lib/         # Auth and utilities
│   │   ├── middleware/  # Auth middleware
│   │   └── index.ts     # Server entry point
│   ├── .env             # Backend environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── src/                 # Next.js Frontend
│   ├── app/            # Pages and UI
│   ├── components/     # React components
│   └── lib/            # Frontend utilities
├── .env.local          # Frontend environment variables
├── package.json
└── next.config.ts
```

## 🚀 Quick Start

### Option 1: VS Code Multi-Root Workspace (Recommended)

1. **Open VS Code**
2. **File → Add Folder to Workspace**
   - Add the root project folder
   - Save workspace as `salonbook.code-workspace`

3. **Open Two Integrated Terminals**:
   - Terminal 1 (Backend): `cd backend && npm run dev`
   - Terminal 2 (Frontend): `npm run dev`

### Option 2: Separate VS Code Windows

1. **Backend Window**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Window** (separate VS Code window):
   ```bash
   npm run dev
   ```

## 🔧 Setup Instructions

### Backend Setup

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (already done in `backend/.env`):
   ```env
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   
   # Database
   TURSO_CONNECTION_URL=your_turso_url
   TURSO_AUTH_TOKEN=your_turso_token
   
   # Authentication
   BETTER_AUTH_SECRET=your_secret
   BETTER_AUTH_URL=http://localhost:4000
   ```

4. **Run database migrations** (if needed):
   ```bash
   npm run db:push
   ```

5. **Start backend server**:
   ```bash
   npm run dev
   ```

   Backend will run on: **http://localhost:4000**

### Frontend Setup

1. **Navigate to root folder** (from backend):
   ```bash
   cd ..
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Configure environment** (already done in `.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. **Start frontend server**:
   ```bash
   npm run dev
   ```

   Frontend will run on: **http://localhost:3000**

## 📡 API Endpoints

The backend exposes these endpoints:

- **Health Check**: `GET /health`
- **Authentication**: `POST /api/auth/*` (better-auth endpoints)
- **Salons**: `GET|POST|PUT /api/salons`
- **Services**: `GET|POST /api/services`
- **Staff**: `GET|POST /api/staff`
- **Bookings**: `GET|POST /api/bookings`
- **Availability**: `GET /api/availability`
- **Reviews**: `GET|POST /api/reviews`
- **Promotions**: `GET|POST /api/promotions`
- **Users**: `GET|PUT /api/users`
- **Notifications**: `POST /api/notifications/send`

## 🔐 Authentication Flow

1. Frontend makes auth requests to: `http://localhost:4000/api/auth`
2. Backend validates credentials using better-auth
3. Backend returns session token
4. Frontend stores token in localStorage
5. Frontend includes token in all API requests via `Authorization: Bearer <token>`

## 🐛 Debugging in VS Code

### Backend Debugging

Create `.vscode/launch.json` in **backend** folder:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/tsx",
      "args": ["watch", "src/index.ts"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Frontend Debugging

Frontend debugging works with Next.js built-in dev tools.

## 📝 VS Code Workspace Configuration

Create `salonbook.code-workspace` in root:

```json
{
  "folders": [
    {
      "name": "Frontend (Next.js)",
      "path": "."
    },
    {
      "name": "Backend (Express)",
      "path": "./backend"
    }
  ],
  "settings": {
    "typescript.tsdk": "node_modules/typescript/lib",
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 🧪 Testing the Setup

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   Expected output: `🚀 SalonBook Backend API running on port 4000`

2. **Test Backend Health**:
   ```bash
   curl http://localhost:4000/health
   ```
   Expected: `{"status":"ok","message":"SalonBook Backend API is running"}`

3. **Start Frontend** (Terminal 2):
   ```bash
   npm run dev
   ```
   Expected output: `▲ Next.js 15.x.x`

4. **Open Browser**:
   Navigate to `http://localhost:3000`

## 🔄 Development Workflow

### Making Changes

**Backend Changes**:
1. Edit files in `backend/src/`
2. Server auto-restarts (via `tsx watch`)
3. Test via API calls or frontend

**Frontend Changes**:
1. Edit files in `src/`
2. Next.js hot-reloads automatically
3. Changes visible immediately in browser

### Database Changes

1. Edit `backend/src/db/schema.ts`
2. Generate migration:
   ```bash
   cd backend
   npm run db:generate
   ```
3. Apply migration:
   ```bash
   npm run db:push
   ```

## 🚨 Common Issues

### Issue: Backend won't start

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**: Kill process on port 4000
```bash
# On Mac/Linux
lsof -ti:4000 | xargs kill -9

# On Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Issue: Frontend can't connect to backend

**Check**:
1. Backend is running on port 4000
2. `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:4000`
3. CORS is enabled in backend (already configured)

### Issue: Authentication fails

**Check**:
1. `BETTER_AUTH_SECRET` matches in both `.env` files
2. `BETTER_AUTH_URL` points to backend: `http://localhost:4000`
3. Database tables exist (run `npm run db:push`)

## 📦 Production Deployment

### Backend Deployment

1. Build backend:
   ```bash
   cd backend
   npm run build
   ```

2. Deploy `backend/dist/` to your server

3. Set production environment variables

4. Start: `npm start`

### Frontend Deployment

1. Update `.env.local` or `.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

2. Build frontend:
   ```bash
   npm run build
   ```

3. Deploy to Vercel/Netlify or run:
   ```bash
   npm start
   ```

## 🎯 Advantages of Separation

✅ **Independent Scaling**: Scale frontend and backend separately  
✅ **Technology Flexibility**: Use different hosting providers  
✅ **Team Collaboration**: Frontend and backend teams work independently  
✅ **Clear Boundaries**: Better separation of concerns  
✅ **Easier Testing**: Test API independently of UI  
✅ **Multiple Frontends**: Same backend can serve web, mobile, etc.

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 💡 Tips

- Keep both servers running during development
- Use VS Code's split terminal for easy access
- Use Postman/Thunder Client for testing backend APIs
- Check browser console for frontend errors
- Check terminal output for backend errors
