import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './src/models/schema';

dotenv.config();

/**
 * Run database migrations
 * Usage: npm run migrate or node migrate.ts
 * 
 * Make sure DATABASE_URL is set in your .env file
 * For Railway: Use the PostgreSQL connection string from Railway dashboard
 */
async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please set DATABASE_URL in your .env file or environment variables');
    process.exit(1);
  }

  console.log('🚀 Starting database migration...');

  const requiresSsl =
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production' ||
    connectionString.includes('sslmode=require') ||
    connectionString.includes('neon.tech');
  
  const pool = new Pool({
    connectionString,
    ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('📦 Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : String(error));
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migrations
runMigrations();