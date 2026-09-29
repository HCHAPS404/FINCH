import { defineConfig } from 'vitest/config';

// Integration tests start PostgreSQL 18.6 with Testcontainers (requires Docker).
export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 180_000,
  },
});
