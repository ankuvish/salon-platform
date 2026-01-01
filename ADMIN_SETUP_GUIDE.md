# Admin Setup Guide - SalonBook Platform

## Complete System Hierarchy ✅

```
Admin (Website Owner)
  ↓
Moderators (Regional Managers)
  ↓
Salon Owners (Business Owners)
  ↓
Customers (End Users)
```

---

## How to Create Admin Account

### Step 1: Register a Normal Account
1. Go to `http://localhost:3000/register`
2. Register with your email (e.g., `admin@salonbook.com`)
3. Complete the registration

### Step 2: Promote to Admin
Use this API call to promote your account to admin:

**Using Postman/Thunder Client:**
```
POST http://localhost:4000/api/users/promote-admin
Content-Type: application/json

{
  "email": "admin@salonbook.com",
  "secretKey": "SUPER_ADMIN_SECRET_2024"
}
```

**Using curl (Command Line):**
```bash
curl -X POST http://localhost:4000/api/users/promote-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@salonbook.com","secretKey":"SUPER_ADMIN_SECRET_2024"}'
```

### Step 3: Login as Admin
1. Logout from current session
2. Login again with your admin email
3. You'll see "Admin Dashboard" in profile menu
4. Access: `http://localhost:3000/admin`

---

## Admin Capabilities

### 1. View All Moderators
- See all appointed moderators
- View their assigned regions
- See number of salons per region

### 2. View Approved Salons
- Filter by region/city
- See all approved salons
- View salon details and statistics

### 3. Appoint Moderators
Use this API to create moderators:

```
POST http://localhost:4000/api/users/promote-moderator
Content-Type: application/json

{
  "email": "moderator@example.com",
  "secretKey": "MODERATOR_SECRET_2024",
  "region": "Mumbai"
}
```

---

## Complete User Flow

### For Admin:
1. Register → Promote to Admin → Login
2. Access `/admin` dashboard
3. View moderators and approved salons
4. Appoint new moderators with regions

### For Moderator:
1. Register → Get promoted by Admin → Login
2. Access `/moderator` panel
3. Review pending salon applications
4. Approve or reject with feedback

### For Salon Owner:
1. Register as "owner" → Create salon
2. Salon status: "Pending"
3. Wait for moderator approval
4. If approved → Salon listed publicly
5. If rejected → Receive feedback, update details

### For Customer:
1. Register as "customer"
2. Browse approved salons
3. Book appointments
4. Leave reviews

---

## Security Notes

⚠️ **IMPORTANT**: Change these secret keys in production:
- `SUPER_ADMIN_SECRET_2024` (in users.ts line 52)
- `MODERATOR_SECRET_2024` (in users.ts line 72)

---

## Quick Test Commands

### Create Admin:
```bash
curl -X POST http://localhost:4000/api/users/promote-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","secretKey":"SUPER_ADMIN_SECRET_2024"}'
```

### Create Moderator:
```bash
curl -X POST http://localhost:4000/api/users/promote-moderator \
  -H "Content-Type: application/json" \
  -d '{"email":"MODERATOR_EMAIL","secretKey":"MODERATOR_SECRET_2024","region":"Mumbai"}'
```

---

## Dashboard URLs

- **Admin Dashboard**: `http://localhost:3000/admin`
- **Moderator Panel**: `http://localhost:3000/moderator`
- **Salon Owner Dashboard**: `http://localhost:3000/dashboard`
- **Customer Profile**: `http://localhost:3000/profile`

---

## Troubleshooting

**Q: Admin dashboard not showing?**
- Make sure you logged out and logged back in after promotion
- Check browser console for errors
- Verify role is "admin" in database

**Q: Can't promote to admin?**
- Check secret key is correct
- Make sure user exists (register first)
- Check backend logs for errors

**Q: Moderator can't see pending salons?**
- New salons default to "pending" status
- Only "approved" salons show to public
- Moderators see all pending salons at `/moderator`
