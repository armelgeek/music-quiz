import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/drizzle/schema';

dotenv.config();

// For testing without a real database, use a mock connection
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/music_quiz_db';

// Try to connect, but don't fail if database is unavailable in development
let client: postgres.Sql<any>;
let db: any;

try {
  client = postgres(databaseUrl);
  db = drizzle(client, { schema });
} catch (error) {
  console.warn('Database connection failed, using mock:', error);
  // Create a mock database object for development
  db = {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => [] }),
  };
}

export { client, db };
