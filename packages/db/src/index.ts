/**
 * @finch/db — Drizzle schema, migrations and seeds. The only package permitted to
 * touch the database driver. README §24.
 */
export * as schema from './schema/index.js';

export type { Database, DbHandle } from './client.js';
export { createDbClient } from './client.js';

export { runMigrations } from './migrate.js';
export { seedSyntheticPersonas } from './seed.js';
