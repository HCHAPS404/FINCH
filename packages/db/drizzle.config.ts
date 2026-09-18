/**
 * drizzle-kit config — used only by the `db:generate` CLI to diff the schema in
 * `src/schema/` against `migrations/` and write new migration SQL. Never imported by
 * application code.
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  dbCredentials: {
    url:
      process.env['DATABASE_URL'] ?? 'postgresql://finch:finch_local_dev@localhost:5432/finch_dev',
  },
});
