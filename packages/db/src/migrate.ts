/**
 * Apply versioned migrations (README §72). Migrations are reviewed SQL files in
 * `packages/db/migrations`, never a schema `push`.
 */
import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/postgres-js/migrator';

import type { FinchDatabase } from './client.js';

export const MIGRATIONS_FOLDER = fileURLToPath(new URL('../migrations', import.meta.url));

export async function runMigrations(db: FinchDatabase): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER, migrationsSchema: 'drizzle' });
}
