import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export default {
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://dfn_user:dfn_password_lol@localhost:5432/digital_fabrication_network',
  },
} satisfies Config;
