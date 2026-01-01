# Home Service & Event Packages Feature Guide

## Overview
This feature allows salons to offer three types of services:
1. **Home Service** - Professionals visit customer's home
2. **Event Packages** - For weddings, parties, corporate events
3. **In-Salon Packages** - Combo deals at the salon

## For Salon Owners

### How to Create Packages

#### 1. Home Service Packages
```typescript
{
  id: "home-bridal-1",
  name: "Bridal Makeup at Home",
  type: "home",
  description: "Complete bridal makeup and hairstyling at your doorstep",
  services: [
    "HD Bridal Makeup",
    "Hair Styling & Setting",
    "Draping Service",
    "Touch-up Kit"
  ],
  duration: 180, // 3 hours
  price: 8500,
  travelCharge: 500, // Additional travel cost
  availableFor: ["Weddings", "Engagement", "Reception"]
}
```

**Benefits:**
- Reach customers who can't visit salon
- Premium pricing for convenience
- Expand service area
- Build customer loyalty

**Requirements:**
- Mobile kit for stylists
- Travel allowance
- Minimum booking notice (24-48 hours)
- Service radius (e.g., within 10km)

#### 2. Event Packages
```typescript
{
  id: "event-wedding-1",
  name: "Wedding Party Package",
  type: "event",
  description: "Complete beauty services for bride + 5 family members",
  services: [
    "Bridal Makeup & Hair",
    "5 Family Member Makeup",
    "Pre-wedding Consultation",
    "On-site Touch-ups",
    "Complimentary Trial"
  ],
  duration: 360, // 6 hours
  price: 25000,
  discount: 15, // 15% off individual pricing
  minPeople: 6,
  maxPeople: 6,
  travelCharge: 1000,
  availableFor: ["Weddings", "Sangeet", "Mehendi"]
}
```

**Popular Event Types:**
- Weddings (Bride + Family)
- Corporate Events (Team grooming)
- Birthday Parties
- Fashion Shows
- Photo Shoots
- Festivals (Diwali, Eid, Christmas)

**Pricing Strategy:**
- Bundle discount (10-20% off)
- Per-person pricing
- Travel charges based on distance
- Equipment rental if needed

#### 3. In-Salon Combo Packages
```typescript
{
  id: "salon-combo-1",
  name: "Glow & Go Package",
  type: "salon",
  description: "Perfect combo for a complete makeover",
  services: [
    "Haircut & Styling",
    "Facial Treatment",
    "Manicure & Pedicure",
    "Threading"
  ],
  duration: 150,
  price: 2499,
  discount: 20, // Save 20%
  availableFor: ["Walk-in", "Appointment"]
}
```

## Implementation in Salon Details Page

### Add to `src/app/salons/[id]/page.tsx`:

```typescript
import ServicePackages from "@/components/ServicePackages";

// Add dummy packages
const dummyPackages = [
  // Home Service
  {
    id: "home-1",
    name: "Bridal Makeup at Home",
    type: "home" as const,
    description: "Complete bridal makeup and hairstyling at your doorstep",
    services: ["HD Bridal Makeup", "Hair Styling", "Draping", "Touch-up Kit"],
    duration: 180,
    price: 8500,
    travelCharge: 500,
    availableFor: ["Weddings", "Engagement"]
  },
  {
    id: "home-2",
    name: "Party Makeup at Home",
    type: "home" as const,
    description: "Glamorous party makeup and hairstyle at your convenience",
    services: ["Party Makeup", "Hair Styling", "Accessories Setting"],
    duration: 90,
    price: 3500,
    travelCharge: 300,
    availableFor: ["Parties", "Events"]
  },
  
  // Event Packages
  {
    id: "event-1",
    name: "Wedding Party Package",
    type: "event" as const,
    description: "Complete beauty services for bride + 5 family members",
    services: [
      "Bridal Makeup & Hair",
      "5 Family Member Makeup",
      "Pre-wedding Consultation",
      "On-site Touch-ups"
    ],
    duration: 360,
    price: 25000,
    discount: 15,
    minPeople: 6,
    maxPeople: 6,
    travelCharge: 1000,
    availableFor: ["Weddings"]
  },
  {
    id: "event-2",
    name: "Corporate Event Package",
    type: "event" as const,
    description: "Professional grooming for corporate teams",
    services: [
      "Professional Makeup (10 people)",
      "Hair Styling",
      "Quick Touch-ups"
    ],
    duration: 240,
    price: 15000,
    discount: 10,
    minPeople: 10,
    maxPeople: 15,
    travelCharge: 800,
    availableFor: ["Corporate Events", "Conferences"]
  },
  
  // Salon Packages
  {
    id: "salon-1",
    name: "Glow & Go Package",
    type: "salon" as const,
    description: "Perfect combo for a complete makeover",
    services: ["Haircut & Styling", "Facial", "Manicure & Pedicure", "Threading"],
    duration: 150,
    price: 2499,
    discount: 20,
    availableFor: ["Walk-in", "Appointment"]
  },
  {
    id: "salon-2",
    name: "Men's Grooming Package",
    type: "salon" as const,
    description: "Complete grooming package for men",
    services: ["Haircut", "Beard Styling", "Facial", "Head Massage"],
    duration: 90,
    price: 1499,
    discount: 15,
    availableFor: ["Walk-in", "Appointment"]
  }
];

// Add in the component after Services section:
<ServicePackages 
  packages={dummyPackages}
  onSelectPackage={(packageId, type) => {
    if (!session?.user) {
      toast.error("Please sign in to book");
      router.push('/login');
    } else {
      router.push(`/book/${salon._id || salon.id}?package=${packageId}&type=${type}`);
    }
  }}
/>
```

## Booking Flow Updates

### Modify `src/app/book/[id]/page.tsx`:

```typescript
// Add package selection state
const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
const [serviceType, setServiceType] = useState<"salon" | "home" | "event">("salon");
const [address, setAddress] = useState("");
const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
const [guestCount, setGuestCount] = useState(1);

// Get package from URL
useEffect(() => {
  const packageId = searchParams.get("package");
  const type = searchParams.get("type");
  if (packageId && type) {
    setSelectedPackage(packageId);
    setServiceType(type as any);
  }
}, [searchParams]);

// Add service type selector
<Card>
  <CardHeader>
    <CardTitle>1. Select Service Type</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-3">
      <Button
        variant={serviceType === "salon" ? "default" : "outline"}
        onClick={() => setServiceType("salon")}
        className="flex flex-col items-center gap-2 h-auto py-4"
      >
        <Sparkles className="h-6 w-6" />
        <span>At Salon</span>
      </Button>
      <Button
        variant={serviceType === "home" ? "default" : "outline"}
        onClick={() => setServiceType("home")}
        className="flex flex-col items-center gap-2 h-auto py-4"
      >
        <Home className="h-6 w-6" />
        <span>Home Service</span>
      </Button>
      <Button
        variant={serviceType === "event" ? "default" : "outline"}
        onClick={() => setServiceType("event")}
        className="flex flex-col items-center gap-2 h-auto py-4"
      >
        <Users className="h-6 w-6" />
        <span>Event</span>
      </Button>
    </div>
  </CardContent>
</Card>

// Add address input for home/event
{(serviceType === "home" || serviceType === "event") && (
  <Card>
    <CardHeader>
      <CardTitle>Service Location</CardTitle>
    </CardHeader>
    <CardContent>
      <Label>Complete Address</Label>
      <Textarea
        placeholder="Enter your complete address with landmark..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={3}
      />
      {serviceType === "event" && (
        <div className="mt-4">
          <Label>Number of Guests</Label>
          <Input
            type="number"
            min="1"
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value))}
          />
        </div>
      )}
    </CardContent>
  </Card>
)}
```

## Database Schema

### Add to your database:

```sql
-- Packages Table
CREATE TABLE packages (
  id VARCHAR(50) PRIMARY KEY,
  salon_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  type ENUM('home', 'event', 'salon') NOT NULL,
  description TEXT,
  services JSON, -- Array of service names
  duration INT NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  discount INT DEFAULT 0,
  min_people INT,
  max_people INT,
  travel_charge DECIMAL(10,2),
  available_for JSON, -- Array of occasions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id)
);

-- Update Bookings Table
ALTER TABLE bookings ADD COLUMN service_type ENUM('salon', 'home', 'event') DEFAULT 'salon';
ALTER TABLE bookings ADD COLUMN service_address TEXT;
ALTER TABLE bookings ADD COLUMN guest_count INT DEFAULT 1;
ALTER TABLE bookings ADD COLUMN package_id VARCHAR(50);
ALTER TABLE bookings ADD COLUMN travel_charge DECIMAL(10,2) DEFAULT 0;
```

## API Endpoints

### Create `/api/packages` endpoint:

```typescript
// GET /api/packages?salon_id=123
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const salonId = searchParams.get('salon_id');
  
  // Fetch packages from database
  const packages = await db.query(
    'SELECT * FROM packages WHERE salon_id = ? AND is_active = true',
    [salonId]
  );
  
  return Response.json(packages);
}

// POST /api/packages (Salon owner creates package)
export async function POST(req: Request) {
  const data = await req.json();
  
  // Validate salon ownership
  // Insert package
  
  return Response.json({ success: true });
}
```

## Pricing Guidelines

### Home Service Pricing:
- Base service price + 30-50% premium
- Travel charge: ₹300-1000 based on distance
- Minimum booking: ₹2000

### Event Package Pricing:
- Per-person rate with bulk discount
- 10-20% discount for packages
- Advance booking required (7-30 days)
- 50% advance payment

### Salon Package Pricing:
- Bundle discount: 15-25% off
- Valid for 30-90 days
- Non-transferable

## Marketing Tips

1. **Home Service:**
   - Target working professionals
   - Promote convenience
   - Highlight safety & hygiene

2. **Event Packages:**
   - Partner with wedding planners
   - Showcase portfolio
   - Offer free trials

3. **Salon Packages:**
   - Monthly specials
   - Loyalty rewards
   - Referral bonuses

## Customer Benefits

✅ **Convenience** - Service at doorstep
✅ **Cost Savings** - Package discounts
✅ **Time Saving** - No travel needed
✅ **Personalized** - Dedicated attention
✅ **Flexible** - Choose location & time

## Next Steps

1. Add ServicePackages component to salon details page
2. Update booking page with service type selection
3. Create packages API endpoints
4. Add package management in salon dashboard
5. Test booking flow for all three types
6. Add travel charge calculator
7. Implement advance payment for events

## Example Packages by Salon Type

### Bridal Salon:
- Pre-wedding Package (Home)
- Wedding Day Package (Event)
- Post-wedding Glow Package (Salon)

### Men's Salon:
- Executive Grooming (Home)
- Corporate Team Package (Event)
- Monthly Maintenance (Salon)

### Unisex Salon:
- Family Package (Home)
- Birthday Party Package (Event)
- Couple's Spa Package (Salon)
