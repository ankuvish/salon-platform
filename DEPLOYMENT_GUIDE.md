# 🚀 SalonBook - Deployment Guide

## Architecture Overview

Your SalonBook application has been successfully separated into two independent projects:

```
📁 Project Root
├── 📁 backend/          # Express.js API Server (Port 4000)
│   ├── src/
│   │   ├── db/         # Database connection & schema
│   │   ├── lib/        # Auth configuration
│   │   ├── routes/     # API route handlers
│   │   └── index.ts    # Main Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── 📁 frontend/         # Next.js Client (Port 3000)
    ├── src/
    │   ├── app/        # Next.js pages
    │   ├── components/ # React components
    │   └── lib/        # API config & utilities
    ├── package.json
    └── .env.local
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- Two terminal windows (or VS Code split terminals)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
# or
bun install

# The .env file is already configured with:
# - PORT=4000
# - FRONTEND_URL=http://localhost:3000
# - TURSO_CONNECTION_URL (database)
# - TURSO_AUTH_TOKEN (database auth)
# - BETTER_AUTH_SECRET (authentication)

# Start backend development server
npm run dev
# or
bun run dev
```

**Backend will run on:** `http://localhost:4000`

### Step 2: Frontend Setup

```bash
# Open a new terminal

# Install dependencies (if not already done)
npm install
# or
bun install

# The .env.local file is configured with:
# NEXT_PUBLIC_API_URL=http://localhost:4000

# Start frontend development server
npm run dev
# or
bun run dev
```

**Frontend will run on:** `http://localhost:3000`

---

## ✅ Verification Checklist

After starting both servers, verify:

1. **Backend API Health**
   - Visit: `http://localhost:4000/health`
   - Should return: `{"status":"ok","message":"SalonBook Backend API is running"}`

2. **Frontend Loading**
   - Visit: `http://localhost:3000`
   - Homepage should load with salon listings

3. **API Communication**
   - Check browser console for any CORS errors
   - Salon data should load from backend

---

## 🔧 VS Code Setup (Recommended)

### Option 1: Two VS Code Windows

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

### Option 2: Split Terminal in One Window

1. Open VS Code at project root
2. Open terminal (`` Ctrl+` ``)
3. Click "Split Terminal" icon
4. In left terminal: `cd backend && npm run dev`
5. In right terminal: `npm run dev`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/sign-up/email` - Register
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get session

### Salons
- `GET /api/salons` - List salons
- `GET /api/salons/:id` - Get salon details
- `GET /api/salons/search?q=query` - Search salons
- `PUT /api/salons/:id` - Update salon (owner)

### Services
- `GET /api/services?salon_id=:id` - Get services
- `POST /api/services` - Create service (owner)
- `PUT /api/services/:id` - Update service (owner)
- `DELETE /api/services/:id` - Delete service (owner)

### Staff
- `GET /api/staff?salon_id=:id` - Get staff
- `POST /api/staff` - Create staff (owner)
- `PUT /api/staff/:id` - Update staff (owner)
- `DELETE /api/staff/:id` - Delete staff (owner)

### Bookings
- `GET /api/bookings` - Get bookings (filtered by user)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/reschedule` - Reschedule booking

### Availability
- `GET /api/availability?staff_id=&service_id=&date=` - Check availability

### Reviews
- `GET /api/reviews?salon_id=:id` - Get reviews
- `POST /api/reviews` - Create review

### Promotions
- `GET /api/promotions?salon_id=:id` - Get promotions
- `POST /api/promotions` - Create promotion (owner)

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile

---

## 🔒 Authentication Flow

1. User logs in via `/login` page
2. Backend validates credentials and returns session token
3. Token stored in `localStorage` as `bearer_token`
4. Frontend includes token in all API requests:
   ```typescript
   Authorization: Bearer <token>
   ```
5. Backend validates token using better-auth middleware

---

## 🐛 Troubleshooting

### Backend not starting
- Check if port 4000 is available
- Verify `.env` file exists in `backend/` directory
- Check database credentials are correct

### Frontend not connecting to backend
- Verify `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local`
- Check backend is running on port 4000
- Clear browser cache and localStorage

### CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Restart backend server after changing environment variables

### Authentication issues
- Clear `localStorage` in browser DevTools
- Verify `BETTER_AUTH_SECRET` is set in backend `.env`
- Check session token is being stored correctly

---

## 📦 Production Deployment

### Backend Deployment (e.g., Railway, Render, Fly.io)

1. Push backend code to Git repository
2. Set environment variables:
   ```
   PORT=4000
   FRONTEND_URL=https://your-frontend-domain.com
   TURSO_CONNECTION_URL=your_production_db_url
   TURSO_AUTH_TOKEN=your_production_db_token
   BETTER_AUTH_SECRET=your_production_secret
   BETTER_AUTH_URL=https://your-backend-domain.com
   ```
3. Deploy with build command: `npm run build`
4. Start command: `npm start`

### Frontend Deployment (e.g., Vercel, Netlify)

1. Push frontend code to Git repository
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```
3. Deploy with build command: `npm run build`
4. Vercel/Netlify will auto-detect Next.js

---

## 🎯 Key Features Working

✅ User authentication (login/register)
✅ Salon browsing and search
✅ Salon details with services and staff
✅ Real-time booking with availability
✅ Color-coded time slots (green/red)
✅ Booking management (cancel/reschedule)
✅ Salon owner dashboard
✅ Service and staff management
✅ Banner upload for salons
✅ Payment method selection
✅ Reviews and ratings

---

## 📚 Additional Resources

- **Backend README:** `backend/README.md`
- **Frontend README:** `frontend-README.md`
- **Database Studio:** Access via Turso dashboard
- **API Testing:** Use Postman or Thunder Client with `http://localhost:4000`

---

## 💡 Tips

1. **Development:** Always start backend before frontend
2. **Database:** Use Turso Studio to view/edit data directly
3. **Debugging:** Check both terminal outputs for errors
4. **API Testing:** Use `curl` or Postman to test endpoints directly
5. **Session Management:** Tokens are valid for the duration set in better-auth

---

## 🎉 Success!

Your SalonBook application is now fully separated and ready to run independently in VS Code or any environment. Both projects can be developed, tested, and deployed separately while communicating seamlessly via REST API.

**Happy Coding! 🚀**
