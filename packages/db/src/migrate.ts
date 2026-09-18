/**
 * Migration runner — README §72 (expand → migrate/backfill → contract). Applies every
 * migration in `migrations/` that has not yet run, tracked by drizzle's own
 * `__drizzle_migrations` table.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDbClient } from './client.js';

const MIGRATIONS_FOLDER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations',
);

export async function runMigrations(connectionString: string): Promise<void> {
  const { db, close } = createDbClient(connectionString);
  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await close();
  }
}
