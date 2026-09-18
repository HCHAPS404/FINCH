/**
 * PostgreSQL Testcontainers harness — README §73, §63.
 *
 * `@finch/db`'s migration and query tests run against a real, ephemeral PostgreSQL
 * instance rather than a mock — a mocked driver cannot catch a migration that is valid
 * SQL but wrong, or a query that only fails under the real engine's constraint
 * enforcement. The image tag matches `infra/docker/compose.yaml` exactly (README §24:
 * the repo fixes one supported Postgres patch across IaC and container tooling), so a
 * passing test says something about the same engine version developers run locally.
 */
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

/** Kept in lockstep with infra/docker/compose.yaml's `postgres` service image. */
export const POSTGRES_HARNESS_IMAGE = 'postgres:18.6-trixie';

export interface PostgresHarness {
  readonly connectionUri: string;
  stop(): Promise<void>;
}

export async function startPostgresHarness(): Promise<PostgresHarness> {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    POSTGRES_HARNESS_IMAGE,
  )
    .withDatabase('finch_test')
    .withUsername('finch_test')
    .withPassword('finch_test')
    .start();

  return {
    connectionUri: container.getConnectionUri(),
    async stop() {
      await container.stop();
    },
  };
}
