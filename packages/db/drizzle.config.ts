/**
 * drizzle-kit configuration. `generate` writes SQL to ./migrations for human review;
 * `push` is never used (README §72).
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  casing: 'snake_case',
  strict: true,
  verbose: true,
});
