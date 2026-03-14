import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

async function clearSeedData() {
  const connectionString = process.env.SEED_DB_URL;

  if (!connectionString) {
    console.error('❌ SEED_DB_URL environment variable is not set');
    process.exit(1);
  }

  if (process.env.ALLOW_DB_CLEAR !== 'true') {
    console.error('❌ Refusing to clear database. Set ALLOW_DB_CLEAR=true to continue.');
    process.exit(1);
  }

  const requiresSsl =
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production' ||
    connectionString.includes('sslmode=require') ||
    connectionString.includes('neon.tech');

  const pool = new Pool({
    connectionString,
    ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    console.log('🧹 Clearing seeded data...');
    await client.query('BEGIN');

    const { rows } = await client.query<{ fqtn: string }>(`
      SELECT quote_ident(schemaname) || '.' || quote_ident(tablename) AS fqtn
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> '__drizzle_migrations'
    `);

    if (rows.length === 0) {
      console.log('ℹ️ No tables found in public schema.');
      await client.query('COMMIT');
      return;
    }

    const tables = rows.map((row) => row.fqtn).join(', ');
    await client.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);

    await client.query('COMMIT');
    console.log('✅ Seeded data cleared successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to clear seeded data:', error instanceof Error ? error.message : String(error));
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

clearSeedData();
