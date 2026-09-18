/**
 * `pnpm db:migrate` entrypoint — README §81 bootstrap, §72.
 */
import { runMigrations } from './migrate.js';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined || connectionString === '') {
  console.error('DATABASE_URL is required to run migrations. See .env.example.');
  process.exit(1);
}

await runMigrations(connectionString);
// eslint-config's no-console only allows warn/error in production TS source — status
// output goes to stderr rather than special-casing this file.
console.error('Migrations applied.');
