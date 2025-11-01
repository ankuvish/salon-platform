# SalonBook Frontend

Next.js 15 frontend application for the SalonBook salon booking platform.

## Features

- Modern React 19 with Next.js 15 App Router
- Shadcn/UI components with Tailwind CSS
- Better-auth integration for authentication
- Real-time salon booking and availability
- Responsive design for all devices
- AI-powered recommendations

## Prerequisites

- Node.js 18+ or Bun
- Backend API running on `http://localhost:4000`

## Installation

```bash
# Install dependencies
npm install
# or
bun install
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Development

```bash
# Run development server
npm run dev
# or
bun dev
```

The frontend will start on `http://localhost:3000`

**Important**: Make sure the backend server is running on port 4000 before starting the frontend.

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # Salon owner dashboard
│   ├── book/              # Booking pages
│   ├── my-bookings/       # User bookings
│   ├── salons/            # Salon details
│   └── recommendations/   # AI recommendations
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── Navigation.tsx    # Main navigation
│   ├── SalonCard.tsx     # Salon card component
│   └── Footer.tsx        # Footer component
├── lib/                  # Utility libraries
│   ├── api-config.ts     # API configuration
│   ├── auth-client.ts    # Auth client setup
│   └── utils.ts          # Helper functions
└── hooks/                # Custom React hooks
```

## Key Pages

- **Homepage** (`/`) - Browse and search salons
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Salon Details** (`/salons/[id]`) - View salon information
- **Book Appointment** (`/book/[id]`) - Book salon services
- **My Bookings** (`/my-bookings`) - View and manage bookings
- **Dashboard** (`/dashboard`) - Salon owner management (owners only)
- **AI Recommendations** (`/recommendations`) - Personalized suggestions

## Authentication Flow

1. User registers or logs in via `/login` or `/register`
2. Auth token stored in localStorage as `bearer_token`
3. Token automatically included in all API requests
4. Protected routes redirect to login if not authenticated

## API Integration

All API calls go through the backend at `http://localhost:4000/api/*`

The frontend uses:
- `apiRequest()` helper for authenticated requests
- `getAuthHeaders()` to include bearer tokens
- `API_BASE_URL` constant for consistent API URLs

Example:
```typescript
import { apiRequest } from '@/lib/api-config';

const response = await apiRequest('/api/salons', {
  method: 'GET'
});
const salons = await response.json();
```

## Running Separately in VS Code

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

Or open two VS Code windows:
1. One for `/backend` folder
2. One for the root folder (frontend)

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/UI
- **Authentication**: Better-auth
- **Icons**: Lucide React
- **Animation**: Framer Motion

## Design System

The app uses a custom design system defined in `src/app/globals.css`:
- CSS variables for theming
- Dark mode support via `.dark` class
- Consistent spacing and typography
- Accessible color contrasts

## License

MIT
