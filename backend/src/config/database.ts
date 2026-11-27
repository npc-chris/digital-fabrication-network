import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../models/schema';

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = isProduction
  ? process.env.DATABASE_URL || process.env.SHARED_DATABASE_URL
  : process.env.SEED_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.SHARED_DATABASE_URL ||
    (process.env.NODE_ENV === 'test' ? 'postgresql://test:test@localhost:5432/dfn_shareddb_test' : '');

if (!connectionString) {
  throw new Error(
    'Database URL is not configured. Set DATABASE_URL or SHARED_DATABASE_URL.'
  );
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

export function getSharedDbMetadata() {
  return {
    role: 'shareddb-owner',
    sslEnabled: requiresSsl,
    poolTotalCount: pool.totalCount,
    poolIdleCount: pool.idleCount,
    poolWaitingCount: pool.waitingCount,
  };
}

export default db;
