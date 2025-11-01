# SalonBook Backend API

Express.js backend server for the SalonBook salon booking platform.

## Features

- RESTful API endpoints for salon booking functionality
- Better-auth integration for authentication
- Drizzle ORM with Turso (SQLite) database
- CORS enabled for frontend communication
- TypeScript for type safety

## Prerequisites

- Node.js 18+ or Bun
- Turso database account (or use the provided credentials)

## Installation

```bash
# Install dependencies
npm install
# or
bun install
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
TURSO_CONNECTION_URL=your_turso_connection_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Authentication
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:4000
```

## Development

```bash
# Run in development mode with hot reload
npm run dev
# or
bun run dev
```

The server will start on `http://localhost:4000`

## Database Operations

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes
npm run db:push

# Open database studio
npm run db:studio
```

## Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Login with email/password
- `POST /api/auth/sign-out` - Logout user
- `GET /api/auth/get-session` - Get current session

### Salons
- `GET /api/salons` - List all salons (with filters)
- `GET /api/salons/:id` - Get salon details
- `GET /api/salons/search` - Search salons
- `GET /api/salons/nearby` - Get nearby salons
- `PUT /api/salons/:id` - Update salon (owner only)

### Services
- `GET /api/services?salon_id=:id` - Get services by salon
- `POST /api/services` - Create service (owner only)
- `PUT /api/services/:id` - Update service (owner only)
- `DELETE /api/services/:id` - Delete service (owner only)

### Staff
- `GET /api/staff?salon_id=:id` - Get staff by salon
- `POST /api/staff` - Create staff member (owner only)
- `PUT /api/staff/:id` - Update staff member (owner only)
- `DELETE /api/staff/:id` - Delete staff member (owner only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/reschedule` - Reschedule booking

### Availability
- `GET /api/availability?staff_id=:id&service_id=:id&date=:date` - Check availability

### Reviews
- `GET /api/reviews?salon_id=:id` - Get salon reviews
- `POST /api/reviews` - Create review

### Promotions
- `GET /api/promotions?salon_id=:id` - Get active promotions
- `POST /api/promotions` - Create promotion (owner only)
- `PUT /api/promotions/:id` - Update promotion (owner only)
- `DELETE /api/promotions/:id` - Delete promotion (owner only)

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/set-password` - Set/update password

### Notifications
- `POST /api/notifications/send` - Send notification

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

Get the token from the login/register response or from `localStorage.getItem("bearer_token")` on the frontend.

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── index.ts         # Database connection
│   │   └── schema.ts        # Database schema
│   ├── lib/
│   │   └── auth.ts          # Better-auth configuration
│   ├── routes/
│   │   ├── salons.ts        # Salon endpoints
│   │   ├── services.ts      # Service endpoints
│   │   ├── staff.ts         # Staff endpoints
│   │   ├── bookings.ts      # Booking endpoints
│   │   ├── availability.ts  # Availability endpoints
│   │   ├── reviews.ts       # Review endpoints
│   │   ├── promotions.ts    # Promotion endpoints
│   │   ├── users.ts         # User endpoints
│   │   └── notifications.ts # Notification endpoints
│   └── index.ts             # Main Express server
├── drizzle/                 # Database migrations
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Turso (SQLite)
- **ORM**: Drizzle
- **Authentication**: Better-auth
- **CORS**: cors middleware

## VS Code Setup

To run this backend separately in VS Code:

1. Open the `backend` folder in VS Code
2. Install dependencies: `npm install`
3. Configure `.env` file with your credentials
4. Run development server: `npm run dev`
5. Backend will be available at `http://localhost:4000`

## License

MIT
