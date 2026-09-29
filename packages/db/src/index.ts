/**
 * @finch/db — schema, migrations and seeds. The only package that touches the database
 * driver (README §24).
 */
export * from './schema/index.js';
export { connect, type ConnectOptions, type DatabaseHandle, type FinchDatabase } from './client.js';
export { runMigrations, MIGRATIONS_FOLDER } from './migrate.js';
export { seedPersonas } from './seed/seed.js';
export { PERSONAS, IDS, seedId } from './seed/personas.js';
