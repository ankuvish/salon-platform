# 🔧 Function Reference Guide

## Quick lookup for every function in the project

---

## 🏠 HOMEPAGE FUNCTIONS (`src/app/page.tsx`)

### `fetchSalons()`
**What it does**: Gets all salons from database
**When called**: On page load
**Returns**: Array of salon objects
**Modifies**: `salons` and `filteredSalons` state
```typescript
// Example usage:
useEffect(() => {
  fetchSalons();
}, []);
```

### `filterSalons()`
**What it does**: Filters salons by search criteria
**When called**: When user changes filters
**Uses**: `searchQuery`, `selectedCity`, `minRating`, `salonType`
**Modifies**: `filteredSalons` state
```typescript
// Triggered by:
- Search input change
- City dropdown change
- Rating filter change
- Salon type change
```

### `getUserLocation()`
**What it does**: Gets user's GPS coordinates
**When called**: On page load
**Uses**: Browser Geolocation API
**Modifies**: `userLocation` state
```typescript
// Returns: { lat: number, lng: number }
```

---

## 🔐 LOGIN FUNCTIONS (`src/app/login/page.tsx`)

### `handleSendOTP()`
**What it does**: Sends OTP to phone number
**Validates**: Phone format (+919876543210)
**API Call**: `POST /api/auth/send-otp`
**Modifies**: `otpSent`, `countdown` states
```typescript
// Flow:
1. Validate phone format
2. Call API
3. Set otpSent = true
4. Start 30s countdown
```

### `handleVerifyOTP()`
**What it does**: Verifies OTP and logs in user
**Validates**: OTP is 6 digits
**API Call**: `POST /api/auth/verify-otp`
**Stores**: JWT token in localStorage
**Redirects**: Based on user role
```typescript
// Flow:
1. Validate OTP format
2. Call API with phone + OTP
3. Check user role matches selected type
4. Store token
5. Redirect (owner → /dashboard, customer → /)
```

### `handleEmailLogin()`
**What it does**: Logs in with email/password
**Validates**: Email and password not empty
**API Call**: `POST /api/auth/login-email`
**Stores**: JWT token
**Redirects**: Based on role
```typescript
// Flow:
1. Validate inputs
2. Call API
3. Check role
4. Store token
5. Redirect
```

### `handleResendOTP()`
**What it does**: Resends OTP
**Clears**: OTP input
**Calls**: `handleSendOTP()`
```typescript
// Disabled when countdown > 0
```

---

## 📝 REGISTER FUNCTIONS (`src/app/register/page.tsx`)

### `handleSalonOwnerFormSubmit(data)`
**What it does**: Processes salon registration form
**Receives**: Complete salon form data
**Calls**: `handleRegisterWithPassword()`
```typescript
// Data includes:
- ownerName, email, phone, password
- salonName, description, address
- services[], shopImages[]
```

### `handleRegisterWithPassword(salonData)`
**What it does**: Creates user account
**API Call**: `POST /api/auth/register`
**Stores**: JWT token
**Calls**: `createSalonProfile()` after success
```typescript
// Flow:
1. Register user
2. Get JWT token
3. Create salon profile
```

### `createSalonProfile(userId)`
**What it does**: Creates salon with services & staff
**Converts**: Images to base64
**API Calls**: 
- `POST /api/salons` - Create salon
- `POST /api/staff` - Create staff (for each service)
- `POST /api/services` - Create services
**Redirects**: To /dashboard
```typescript
// Flow:
1. Convert first image to base64
2. Create salon
3. For each service:
   - Create staff member
   - Create service
4. Redirect to dashboard
```

---

## 🏪 SALON DETAILS FUNCTIONS (`src/app/salons/[id]/page.tsx`)

### `fetchSalonDetails()`
**What it does**: Gets salon information
**Handles**: Both dummy and real salons
**API Calls**:
- `GET /api/salons/:id`
- `GET /api/services?salon_id=:id`
- `GET /api/staff?salon_id=:id`
- `GET /api/promotions?salon_id=:id`
**Modifies**: `salon`, `services`, `staff`, `promotions` states
```typescript
// URL parsing:
// /salons/luxury-hair-studio-123
// Extracts: "123" as salonId
const salonId = urlParam.split('-').pop();
```

---

## 📅 BOOKING FUNCTIONS (`src/app/book/[id]/page.tsx`)

### `fetchBookingData()`
**What it does**: Gets salon, services, staff for booking
**Handles**: Dummy salons with hardcoded data
**API Calls**: Same as salon details
**Modifies**: `salon`, `services`, `staff` states
```typescript
// For dummy salons:
- Loads predefined services (₹500, ₹2500, etc.)
- Loads predefined staff
```

### `fetchAvailability()`
**What it does**: Gets available time slots
**Calculates**: Total duration of selected services
**Filters**: Slots that fit total duration
**API Call**: `GET /api/availability?salon_id=&staff_id=&date=&duration=`
**Modifies**: `availableSlots`, `bookedSlots` states
```typescript
// Example:
// Service 1: 30 min
// Service 2: 45 min
// Total: 75 min
// Only shows slots with 75+ min available
```

### `handleBooking()`
**What it does**: Creates booking
**Validates**: All fields filled, user logged in
**Calculates**: End time based on services
**API Call**: `POST /api/bookings` (for each service)
**Processes**: Payment based on method
**Redirects**: To success page → /my-bookings
```typescript
// Flow:
1. Check user logged in
2. Validate all fields
3. Calculate total duration
4. Calculate end time
5. Create booking for each service
6. Process payment
7. Show success
8. Redirect after 3s
```

---

## 🧭 NAVIGATION FUNCTIONS (`src/components/Navigation.tsx`)

### Mobile Menu Toggle
**State**: `mobileMenuOpen`
**Toggle**: `setMobileMenuOpen(!mobileMenuOpen)`
**Shows**: When screen < 768px (md breakpoint)
```typescript
// Desktop: Hidden on mobile
// Mobile: Hamburger menu
```

---

## 🎴 SALON CARD FUNCTIONS (`src/components/SalonCard.tsx`)

### URL Slug Generation
**What it does**: Creates SEO-friendly URL
**Input**: "Luxury Hair Studio"
**Output**: "luxury-hair-studio"
```typescript
const salonSlug = salon.name
  .toLowerCase()                    // "luxury hair studio"
  .replace(/[^a-z0-9]+/g, '-')     // "luxury-hair-studio"
  .replace(/^-|-$/g, '');          // Remove leading/trailing -
```

### Link Generation
**Combines**: Slug + ID
**Result**: `/salons/luxury-hair-studio-123`
```typescript
<Link href={`/salons/${salonSlug}-${salonId}`}>
```

---

## 🔒 AUTH CLIENT FUNCTIONS (`src/lib/auth-client.ts`)

### `useSession()`
**What it does**: Gets current user session
**Returns**: `{ data: session, isPending, refetch }`
**Session contains**: `{ user: { id, name, email, role } }`
```typescript
// Usage:
const { data: session, isPending } = useSession();

if (session?.user) {
  // User is logged in
  console.log(session.user.role); // "customer" or "owner"
}
```

### `authClient.signOut()`
**What it does**: Logs out user
**Clears**: Token from localStorage
**Redirects**: To login page
```typescript
// Usage:
await authClient.signOut();
router.push('/login');
```

---

## 🌐 API CONFIG FUNCTIONS (`src/lib/api-config.ts`)

### `apiRequest(endpoint, options)`
**What it does**: Makes authenticated API calls
**Adds**: Authorization header with JWT token
**Handles**: Errors
**Returns**: Fetch response
```typescript
// Usage:
const response = await apiRequest('/api/salons', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Salon' })
});

const data = await response.json();
```

**Auto-adds**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

---

## 🎨 UTILITY FUNCTIONS

### Currency Formatting
**Symbol**: ₹ (INR)
**Format**: `₹{price.toFixed(2)}`
```typescript
// Example:
const price = 500;
display: ₹500.00
```

### Date Formatting
**Input**: Date object
**Output**: Locale string
```typescript
selectedDate.toLocaleDateString()
// Output: "1/1/2024"
```

### Time Slot Formatting
**Input**: "09:00"
**Display**: 09:00 - 10:00
```typescript
{slot.startTime} - {slot.endTime}
```

---

## 🔄 STATE UPDATE PATTERNS

### Simple State
```typescript
const [value, setValue] = useState('');
setValue('new value');
```

### Array State (Add)
```typescript
const [items, setItems] = useState([]);
setItems([...items, newItem]);
```

### Array State (Remove)
```typescript
setItems(items.filter(item => item.id !== removeId));
```

### Object State
```typescript
const [data, setData] = useState({});
setData({ ...data, key: 'value' });
```

---

## 🎯 USEEFFECT PATTERNS

### Run Once (On Mount)
```typescript
useEffect(() => {
  fetchData();
}, []); // Empty dependency array
```

### Run When Value Changes
```typescript
useEffect(() => {
  filterData();
}, [searchQuery]); // Runs when searchQuery changes
```

### Cleanup
```typescript
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer); // Cleanup
}, []);
```

---

## 🚨 ERROR HANDLING PATTERNS

### Try-Catch
```typescript
try {
  const response = await apiRequest('/api/endpoint');
  const data = await response.json();
} catch (error) {
  toast.error('Failed to load data');
  console.error(error);
}
```

### Response Check
```typescript
if (response.ok) {
  // Success
} else {
  // Error
  const error = await response.json();
  toast.error(error.message);
}
```

---

## 📱 RESPONSIVE PATTERNS

### Conditional Rendering
```typescript
// Desktop only
<div className="hidden md:block">Desktop</div>

// Mobile only
<div className="block md:hidden">Mobile</div>
```

### Responsive Sizes
```typescript
// Small on mobile, large on desktop
<h1 className="text-2xl md:text-4xl">Title</h1>
```

---

## 🎨 STYLING PATTERNS

### Gradient Text
```typescript
className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent"
```

### Hover Effects
```typescript
className="hover:scale-105 transition-all duration-300"
```

### Backdrop Blur
```typescript
className="bg-white/90 backdrop-blur-xl"
```

---

This reference guide covers all major functions.
Use Ctrl+F to quickly find what you need!
