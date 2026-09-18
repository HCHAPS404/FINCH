/**
 * `pnpm db:seed` entrypoint — README §81 bootstrap, §80.
 */
import { createDbClient } from './client.js';
import { seedSyntheticPersonas } from './seed.js';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined || connectionString === '') {
  console.error('DATABASE_URL is required to seed the database. See .env.example.');
  process.exit(1);
}

const { db, close } = createDbClient(connectionString);
try {
  const count = await seedSyntheticPersonas(db);
  // eslint-config's no-console only allows warn/error in production TS source.
  console.error(`Seeded ${count} synthetic personas.`);
} finally {
  await close();
}
