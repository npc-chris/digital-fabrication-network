# Database Seeding Instructions

This guide explains how to populate the DFN database with sample data for development and testing.

## Prerequisites

- PostgreSQL database running
- Database connection configured in `.env` file
- All migrations applied

## Running the Seed Script

### 1. Apply the new migration for onboarding fields

```bash
cd backend
npm run migrate
```

Or manually run the SQL migration:
```bash
psql -d your_database_name -f drizzle/0001_add_onboarding_fields.sql
```

### 2. Run the seed script

```bash
cd backend
npm run seed
```

## What Gets Seeded

The seed script creates:

### Users
- **3 Explorers** (users looking for components/services)
  - explorer1@test.com
  - explorer2@test.com
  - explorer3@test.com

- **4 Providers** (sellers/service providers)
  - provider1@test.com - TechParts Nigeria
  - provider2@test.com - 3D Print Hub
  - provider3@test.com - MakerSpace Pro
  - provider4@test.com - Electronics Supply Co

**All test accounts use password:** `password123`

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

After seeding:

1. **Login as Explorer:**
   - Email: `explorer1@test.com`
   - Password: `password123`
   - You can browse components, services, and community posts

2. **Login as Provider:**
   - Email: `provider1@test.com`
   - Password: `password123`
   - Access the provider dashboard to manage listings

3. **Browse without logging in:**
   - Visit `http://localhost:3000/dashboard`
   - View all public components, services, and posts

## Resetting the Database

To start fresh:

```bash
# Drop all tables (careful!)
psql -d your_database_name -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
cd backend
npm run migrate

# Re-seed
npm run seed
```

## Notes

- All users are marked as verified and onboarding completed
- Providers are automatically approved
- Ratings and review counts are simulated
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
