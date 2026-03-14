import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../models/schema';

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = isProduction
  ? process.env.DATABASE_URL
  : process.env.SEED_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Database URL is not configured. Set DATABASE_URL (and optionally SEED_DB_URL for non-production).');
}

const requiresSsl =
  process.env.DB_SSL === 'true' ||
  isProduction ||
  (connectionString?.includes('sslmode=require') ?? false) ||
  (connectionString?.includes('neon.tech') ?? false);

const pool = new Pool({
  connectionString,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

export default db;
