/**
 * `pnpm db:migrate` · `pnpm db:seed` — operator entrypoint.
 *
 * Reads DATABASE_URL only; never prints it (it contains a password, README §12).
 */
import { connect } from './client.js';
import { runMigrations } from './migrate.js';
import { seedPersonas } from './seed/seed.js';

const command = process.argv[2];
const url = process.env['DATABASE_URL'];

if (command !== 'migrate' && command !== 'seed') {
  console.error('Usage: cli.js <migrate|seed>');
  process.exit(2);
}
if (url === undefined || url.trim() === '') {
  console.error('DATABASE_URL is not set. See .env.example (README §61).');
  process.exit(2);
}

const handle = connect({ url, maxConnections: 1 });
try {
  await runMigrations(handle.db);
  if (command === 'seed') await seedPersonas(handle.db);
  console.warn(command === 'seed' ? 'Migrations applied; personas seeded.' : 'Migrations applied.');
} finally {
  await handle.close();
}
