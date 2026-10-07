/**
 * Shared Postgres Testcontainers setup for controller integration tests — same
 * rationale as `@finch/db`'s `migrate.test.ts`: these controllers build real Drizzle
 * queries (joins, FK-backed inserts, `.returning()`); a mocked driver cannot catch a
 * query that is wrong only under the real engine's constraint enforcement.
 */
import { startPostgresHarness, type PostgresHarness } from '@finch/testing';
import { runMigrations, createDbClient, type Database } from '@finch/db';

export interface TestDatabase {
  readonly db: Database;
  teardown(): Promise<void>;
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const harness: PostgresHarness = await startPostgresHarness();
  await runMigrations(harness.connectionUri);
  const handle = createDbClient(harness.connectionUri);

  return {
    db: handle.db,
    async teardown(): Promise<void> {
      await handle.close();
      await harness.stop();
    },
  };
}
