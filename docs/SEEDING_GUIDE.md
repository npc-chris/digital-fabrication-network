# Database Seeding Instructions

This guide explains how to populate the DFN database with sample data for development and testing.

## Prerequisites

- PostgreSQL database running
- Database connection configured in `.env` file
- `JWT_SECRET` environment variable set in backend `.env` (for authentication)
- All migrations applied

## Prerequisites Checklist

Before seeding, ensure:
- ✅ PostgreSQL is running and accessible
- ✅ Backend `.env` file contains `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`
- ✅ Frontend `.env` contains `NEXT_PUBLIC_API_URL=http://localhost:4000` (or your backend URL)
- ✅ `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` configured for OAuth (optional, but recommended)

## Running the Seed Script

### 1. Clear existing seed data (optional, to reset database)

```bash
cd backend
ALLOW_DB_CLEAR=true npm run db:clear-seed
```

### 2. Run the seed script

```bash
cd backend
npm run seed
```

This will create:
- Users and profiles with proper authentication
- Components and affiliate stores
- Services and mentorship requests
- Orders with logistics tracking
- Forum categories and content

## What Gets Seeded

The seed script creates:

### Users

- **1 Admin** (platform admin)
  - Email: `admin@dfn.ng`
  - Password: `admin123!@#`
  - Full access to admin dashboard at `/admin`

- **3 Providers** (high-quality tech hubs)
  - `nerdshed@test.com` → Nerdshed Africa (Yaba, Lagos)
  - `makerspace@test.com` → Makerspace Pro (V/I, Lagos)
  - `fab_aba@test.com` → Aba Fab Lab (Aba, Abia)
  - All use password: `password123`

- **3 Explorers** (users searching for components/services)
  - `tunde@test.com`, `chioma@test.com`, `ibrahim@test.com`
  - All use password: `password123`

**All profiles are automatically created during registration/OAuth** with safe defaults:
- `firstName` defaults to email prefix if not provided by OAuth
- Optional fields (lastName, company, bio, location, phone) are skipped in the INSERT if undefined, preventing database constraint errors

### Components & Parts (6 items)

- Arduino Uno R3
- Raspberry Pi 4 Model B
- Servo Motor SG90
- Breadboard 830 Points
- PLA Filament
- Jumper Wire Set

### Services (5 offerings)

- FDM 3D Printing Service
- CNC Milling Service
- PCB Assembly Service
- Laser Cutting & Engraving
- Electronics Lab Access

### Community Posts (6 posts)

- Fabrication requests
- Innovation announcements
- Technical questions
- Partnership opportunities

### Notifications (2 sample notifications)

- New replies
- New orders

## Testing the Application

After seeding, use these credentials to test different user roles:

### 1. Admin Access

- **Email:** `admin@dfn.ng`
- **Password:** `admin123!@#`
- **Access:** Admin dashboard at `/admin`
- **Capabilities:**
  - View platform users and providers
  - Approve provider requests
  - Manage verifications
  - Moderate content
  - View platform overview and key metrics

### 2. Provider Access

- **Email:** `nerdshed@test.com`
- **Password:** `password123`
- **Access:** Provider dashboard and services management
- **Capabilities:**
  - List components and services
  - Receive orders and quotes
  - Manage shop listings
  - Offer mentorship

### 3. Explorer Access

- **Email:** `tunde@test.com`
- **Password:** `password123`
- **Access:** Dashboard, marketplace browsing, community
- **Capabilities:**
  - Browse components and services
  - Create orders
  - Join group buying
  - Access forum and community
  - Book mentorship

## Authentication Troubleshooting

### Issue: 401 Unauthorized when accessing protected routes

**Cause:** JWT token mismatch or missing environment variables.

**Fix:**
1. Ensure `JWT_SECRET` is set in `backend/.env`
2. Ensure `NEXT_PUBLIC_API_URL` is set in `frontend/.env` to point to backend
3. Clear browser localStorage: `localStorage.clear()`
4. Restart backend and frontend servers
5. Log in again

### Issue: Google OAuth fails with profile insert error

**Cause:** Optional profile fields being inserted as `default` without database defaults.

**Fix:** Already applied in AuthService. The fix:
- Only inserts defined profile fields
- Provides `firstName` fallback from email prefix
- Prevents Drizzle from converting undefined values to `default` keywords

## Authentication Flow

1. **Registration/Login:**
   - User credentials hashed with bcrypt
   - JWT token generated and returned upon successful login
   - JWT signed with `JWT_SECRET` environment variable

2. **Token Storage & Usage:**
   - Frontend stores token in `localStorage`
   - API client adds `Authorization: Bearer {token}` header to all requests
   - Backend middleware (`authenticate`) verifies token signature using same `JWT_SECRET`

3. **Google OAuth:**
   - User redirected to Google OAuth callback
   - Profile created with available data (or email-based defaults)
   - JWT token generated and passed to frontend via URL parameter
   - Frontend stores token and proceeds to dashboard

## Components & Marketplace Data

The seed also creates:
- **4 Components** (local + affiliate)
  - ESP32-S3-WROOM-1 microcontroller
  - Arduino Nano Every
  - NEMA 17 Stepper Motor
  - STM32F405RG (affiliate via Mouser)

- **Affiliate Store** (Mouser International for international components)

- **Services** (PCB Assembly, etc.)

- **Engineering Projects** (Phase 4 versioning with pipelines)

## Resetting the Database

To start fresh:

```bash
# Clear seeded data with environment variable
ALLOW_DB_CLEAR=true npm run db:clear-seed

# Or reset entire database schema
psql -d your_database_name -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations (if using Drizzle)
cd backend
npm run migrate

# Re-seed
npm run seed
```

## Notes

- All users are marked as verified and onboarding completed
- All providers are pre-approved (provider_approved = true)
- Admin user has full platform access
- JWT authentication is enabled; tokens expire in 7 days
- Profile creation is safe—optional fields are gracefully handled and don't cause database errors
- Images use placeholder URLs
- All prices are in USD for consistency

## Troubleshooting

**Error: "relation does not exist"**

- Make sure migrations are run before seeding
- Check database connection string in `.env`

**Error: "duplicate key value"**

- Database already has data
- Either reset the database or modify seed script to handle existing data

**Cannot connect to database**

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Ensure database exists
