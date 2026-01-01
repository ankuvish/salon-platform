# 📚 Complete Code Documentation Guide

## 🏗️ Project Structure Overview

```
salon-platform/
├── src/
│   ├── app/              # Next.js pages (routes)
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utility functions & configs
│   └── hooks/           # Custom React hooks
├── backend/             # Express.js API server
└── public/              # Static assets
```

---

## 📄 FILE-BY-FILE DOCUMENTATION

### 1. `src/app/page.tsx` - Homepage
**Purpose**: Main landing page showing salon listings

**Key Functions**:
```typescript
// Fetches all salons from API
const fetchSalons = async () => {
  // Gets salon data from backend
  // Adds dummy salons for demo
  // Sorts by rating
}

// Filters salons based on search criteria
const filterSalons = () => {
  // Filters by: search query, city, rating, salon type
  // Updates filteredSalons state
}

// Gets user's location for nearby salons
const getUserLocation = () => {
  // Uses browser geolocation API
  // Stores lat/lng in state
}
```

**State Variables**:
- `salons` - All salons from database
- `filteredSalons` - Salons after applying filters
- `searchQuery` - User's search text
- `selectedCity` - Selected city filter
- `minRating` - Minimum rating filter
- `salonType` - Type filter (men/women/unisex)

**How to Modify**:
- Add new filter: Add state + update `filterSalons()`
- Change dummy data: Edit `dummySalons` array
- Modify layout: Update JSX in return statement

---

### 2. `src/app/login/page.tsx` - Login Page
**Purpose**: User authentication (customers & salon owners)

**Key Functions**:
```typescript
// Sends OTP to phone number
const handleSendOTP = async () => {
  // Validates phone format
  // Calls /api/auth/send-otp
  // Starts countdown timer
}

// Verifies OTP and logs in user
const handleVerifyOTP = async () => {
  // Validates OTP (6 digits)
  // Calls /api/auth/verify-otp
  // Stores JWT token in localStorage
  // Redirects based on user role
}

// Email/password login
const handleEmailLogin = async () => {
  // Validates email & password
  // Calls /api/auth/login-email
  // Stores token & redirects
}
```

**State Variables**:
- `userType` - "customer" or "owner"
- `loginMethod` - "otp" or "email"
- `phone` - Phone number input
- `otp` - OTP code input
- `email` - Email input
- `password` - Password input
- `otpSent` - Whether OTP was sent
- `countdown` - Resend OTP timer

**How to Modify**:
- Add social login: Add new button + API call
- Change OTP length: Update validation regex
- Modify redirect: Change router.push() destination

---

### 3. `src/app/register/page.tsx` - Registration Page
**Purpose**: New user registration (salon owners only now)

**Key Functions**:
```typescript
// Handles salon owner form submission
const handleSalonOwnerFormSubmit = (data) => {
  // Saves form data to state
  // Calls registration API
}

// Registers user with password
const handleRegisterWithPassword = async (salonData) => {
  // Calls /api/auth/register
  // Creates user account
  // Stores JWT token
  // Creates salon profile
}

// Creates salon with services & staff
const createSalonProfile = async (userId) => {
  // Converts images to base64
  // Creates salon via /api/salons
  // Creates services via /api/services
  // Creates staff via /api/staff
  // Redirects to dashboard
}
```

**State Variables**:
- `salonOwnerData` - Complete salon registration form data
- `isLoading` - Loading state during registration

**How to Modify**:
- Add customer registration: Add tab + simple form
- Change required fields: Update validation
- Add more services: Modify form in SalonOwnerRegistrationForm

---

### 4. `src/app/salons/[id]/page.tsx` - Salon Details
**Purpose**: Shows detailed information about a specific salon

**Key Functions**:
```typescript
// Fetches salon, services, staff, promotions
const fetchSalonDetails = async () => {
  // Checks if dummy salon (starts with 'dummy-')
  // If dummy: loads hardcoded data
  // If real: fetches from API
  // Extracts ID from slug-based URL
}
```

**URL Structure**:
- Old: `/salons/123`
- New: `/salons/luxury-hair-studio-123` (SEO-friendly)
- ID extracted from end of URL

**State Variables**:
- `salon` - Salon information
- `services` - List of services with prices
- `staff` - List of staff members
- `promotions` - Active promotions/discounts

**How to Modify**:
- Add reviews section: Fetch reviews + display
- Change layout: Modify JSX structure
- Add booking button: Already present, modify onClick

---

### 5. `src/app/book/[id]/page.tsx` - Booking Page
**Purpose**: Complete booking flow with service selection

**Key Functions**:
```typescript
// Fetches salon, services, staff
const fetchBookingData = async () => {
  // Handles dummy salons
  // Fetches real data from API
}

// Gets available time slots
const fetchAvailability = async () => {
  // Calculates total service duration
  // Fetches slots from API
  // Filters slots by duration
  // For dummy salons: generates slots
}

// Creates booking
const handleBooking = async () => {
  // Validates all fields
  // Checks if user logged in
  // Creates booking for each service
  // Processes payment
  // Redirects to success page
}
```

**State Variables**:
- `selectedServices` - Array of selected service IDs
- `selectedStaffId` - Chosen staff member
- `selectedDate` - Booking date
- `selectedSlot` - Time slot
- `paymentMethod` - "cash", "online", or "netbanking"
- `availableSlots` - Available time slots
- `bookedSlots` - Already booked slots

**How to Modify**:
- Add more payment methods: Add to RadioGroup
- Change slot duration: Modify slot generation logic
- Add service packages: Group services together

---

### 6. `src/components/Navigation.tsx` - Navigation Bar
**Purpose**: Top navigation with mobile menu

**Key Functions**:
```typescript
// Mobile menu toggle
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

**Features**:
- Desktop: Horizontal menu
- Mobile: Hamburger menu (Menu/X icon)
- Shows login/signup or profile menu
- Sticky at top (z-50)

**How to Modify**:
- Add menu item: Add Link in both desktop & mobile sections
- Change logo: Update "SalonBook" text
- Modify colors: Update Tailwind classes

---

### 7. `src/components/SalonCard.tsx` - Salon Card Component
**Purpose**: Displays salon information in card format

**Key Features**:
```typescript
// Creates SEO-friendly URL slug
const salonSlug = salon.name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

// Combines slug with ID for URL
const salonId = salon._id || salon.id;
// Result: /salons/luxury-hair-studio-123
```

**Props**:
- `salon` - Salon object with name, rating, services, etc.

**How to Modify**:
- Change card layout: Modify JSX structure
- Add more info: Display additional salon fields
- Modify hover effect: Update Tailwind hover classes

---

### 8. `src/components/AuthDialog.tsx` - Login/Signup Modal
**Purpose**: Popup dialog for quick authentication

**Key Functions**:
- Same as login page but in modal format
- Used when user tries to book without login
- Supports OTP and email login
- Customer and owner tabs

**How to Modify**:
- Change modal size: Update `sm:max-w-md`
- Add forgot password: Already included
- Modify styling: Update gradient classes

---

### 9. `src/lib/auth-client.ts` - Authentication Client
**Purpose**: Manages user sessions and authentication

**Key Functions**:
```typescript
// Gets current user session
export const useSession = () => {
  // Returns: { data: session, isPending, refetch }
  // session.user contains: id, name, email, role
}

// Signs out user
authClient.signOut()
```

**How to Modify**:
- Change token storage: Modify localStorage logic
- Add refresh token: Implement token refresh
- Change session duration: Update expiry time

---

### 10. `src/lib/api-config.ts` - API Configuration
**Purpose**: Centralized API request handler

**Key Function**:
```typescript
export const apiRequest = async (endpoint, options) => {
  // Adds Authorization header with JWT token
  // Handles errors
  // Returns fetch response
}
```

**Usage**:
```typescript
const response = await apiRequest('/api/salons');
const data = await response.json();
```

**How to Modify**:
- Change API URL: Update base URL
- Add interceptors: Add request/response middleware
- Add retry logic: Wrap in retry function

---

## 🔄 DATA FLOW DIAGRAMS

### Login Flow:
```
User enters phone → handleSendOTP() → API sends OTP
User enters OTP → handleVerifyOTP() → API validates
API returns JWT token → Store in localStorage
Redirect to homepage or dashboard
```

### Booking Flow:
```
User selects services → Updates selectedServices[]
User selects staff → Fetches available slots
User selects date & time → Validates selection
User chooses payment → handleBooking()
API creates booking → Success page
```

### Salon Details Flow:
```
URL: /salons/luxury-hair-studio-123
Extract ID: "123" from URL
fetchSalonDetails(123) → API returns salon data
Display: services, staff, promotions
User clicks "Book" → Redirect to /book/123
```

---

## 🎨 STYLING SYSTEM

### Tailwind Classes Used:
- `luxury-gradient` - Purple/pink/amber gradient
- `luxury-card` - Card with backdrop blur
- `luxury-button` - Gradient button
- `luxury-gradient-text` - Gradient text color

### Responsive Breakpoints:
- `sm:` - 640px (mobile)
- `md:` - 768px (tablet)
- `lg:` - 1024px (desktop)
- `xl:` - 1280px (large desktop)

### Color Scheme:
- Primary: Purple (#9333ea)
- Secondary: Pink
- Accent: Amber
- Background: White/Gray-900 (dark mode)

---

## 🔐 SECURITY FEATURES

### Authentication:
- JWT tokens stored in localStorage
- Role-based access (customer/owner)
- Session validation on protected routes

### Input Validation:
- Phone: `/^\+[1-9]\d{1,14}$/` (international format)
- Email: Standard email regex
- OTP: `/^\d{6}$/` (6 digits)

### API Security:
- Bearer token in Authorization header
- CORS configured
- Rate limiting (production)

---

## 🛠️ COMMON MODIFICATIONS

### Add New Page:
1. Create file in `src/app/new-page/page.tsx`
2. Add Navigation link
3. Export default component

### Add New API Endpoint:
1. Create in `backend/src/routes/`
2. Add to `backend/src/index.ts`
3. Call from frontend using `apiRequest()`

### Add New Component:
1. Create in `src/components/NewComponent.tsx`
2. Import where needed
3. Pass props as needed

### Change Currency:
- Search for `$` and replace with `₹`
- Already done for INR

### Add New Filter:
1. Add state: `const [newFilter, setNewFilter] = useState()`
2. Add UI: Select/Input component
3. Update `filterSalons()` function

---

## 📝 QUICK REFERENCE

### State Management:
- `useState()` - Component state
- `useEffect()` - Side effects
- `useSession()` - User session

### Navigation:
- `router.push('/path')` - Programmatic navigation
- `<Link href="/path">` - Declarative navigation

### API Calls:
```typescript
const response = await apiRequest('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### Form Handling:
```typescript
const [value, setValue] = useState('');
<Input value={value} onChange={(e) => setValue(e.target.value)} />
```

---

## 🐛 DEBUGGING TIPS

### Check Console:
- `console.log()` for debugging
- Browser DevTools → Console tab

### Check Network:
- DevTools → Network tab
- See API requests/responses

### Check State:
- React DevTools extension
- Inspect component state

### Common Issues:
1. **Page not loading**: Check console for errors
2. **API not working**: Check backend is running
3. **Login fails**: Check token in localStorage
4. **Booking fails**: Check all fields filled

---

This documentation covers all major files and functions. 
Refer to specific sections when making changes.
