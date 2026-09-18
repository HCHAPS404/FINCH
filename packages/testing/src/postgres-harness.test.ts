/**
 * PostgreSQL Testcontainers harness — integration test.
 *
 * Pulls the same image `infra/docker/compose.yaml` runs and proves the harness yields
 * a connection string that a real client can use. Slow by unit-test standards (image
 * pull + container boot), which is exactly why `@finch/db`'s migration tests build on
 * this harness instead of each reimplementing container lifecycle management.
 */
import { describe, it, expect } from 'vitest';
import pg from 'pg';
import { startPostgresHarness } from './postgres-harness.js';

describe('startPostgresHarness', () => {
  it('starts a real, connectable PostgreSQL instance', async () => {
    const harness = await startPostgresHarness();
    try {
      const client = new pg.Client({ connectionString: harness.connectionUri });
      await client.connect();
      try {
        const result = await client.query<{ answer: number }>('SELECT 1 AS answer');
        expect(result.rows[0]?.answer).toBe(1);
      } finally {
        await client.end();
      }
    } finally {
      await harness.stop();
    }
  }, 120_000);
});
