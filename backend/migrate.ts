import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './src/models/schema';

dotenv.config({ path: '../.env' });

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  console.log('Running migrations...');

  // Create tables directly
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'service_provider', 'researcher', 'admin', 'platform_manager');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE TYPE booking_status AS ENUM ('queued', 'in_progress', 'completed', 'pickup', 'delivery');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE TYPE component_type AS ENUM ('electrical', 'mechanical', 'materials', 'consumables');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      google_id VARCHAR(255),
      role user_role NOT NULL DEFAULT 'buyer',
      is_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      company VARCHAR(255),
      bio TEXT,
      location VARCHAR(255),
      phone VARCHAR(50),
      avatar VARCHAR(500),
      portfolio TEXT,
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS components (
      id SERIAL PRIMARY KEY,
      seller_id INTEGER NOT NULL REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type component_type NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      availability INTEGER DEFAULT 0,
      images TEXT,
      technical_details TEXT,
      datasheet_url VARCHAR(500),
      compatibilities TEXT,
      location VARCHAR(255),
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      seller_id INTEGER NOT NULL REFERENCES users(id),
      component_id INTEGER NOT NULL REFERENCES components(id),
      quantity INTEGER NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      status order_status NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER NOT NULL REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      equipment_specs TEXT,
      pricing_model VARCHAR(50),
      price_per_unit DECIMAL(10,2),
      lead_time INTEGER,
      images TEXT,
      location VARCHAR(255),
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      service_id INTEGER NOT NULL REFERENCES services(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      provider_id INTEGER NOT NULL REFERENCES users(id),
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      status booking_status NOT NULL DEFAULT 'queued',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Migrations completed successfully!');
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
