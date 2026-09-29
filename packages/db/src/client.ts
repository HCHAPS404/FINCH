/**
 * Database client — the only place the driver is constructed (README §24,
 * `no-direct-db-outside-adapters`).
 */
import { sql as rawSql } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

export type FinchDatabase = PostgresJsDatabase<typeof schema>;

export interface DatabaseHandle {
  readonly db: FinchDatabase;
  close(): Promise<void>;
}

export interface ConnectOptions {
  readonly url: string;
  readonly maxConnections?: number;
}

export function connect(options: ConnectOptions): DatabaseHandle {
  const sql = postgres(options.url, {
    max: options.maxConnections ?? 10,
    // bigint columns come back as JS bigint, never as a lossy number.
    types: { bigint: postgres.BigInt },
    onnotice: () => undefined,
  });
  const db = drizzle(sql, { schema, casing: 'snake_case' });
  return {
    db,
    close: () => sql.end({ timeout: 5 }),
  };
}

/**
 * Readiness probe: true when the database answers a trivial query within `timeoutMs`.
 * Never throws, so a health endpoint can report the state instead of crashing.
 */
export async function ping(db: FinchDatabase, timeoutMs = 2_000): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<false>((resolve) => {
    timer = setTimeout(() => {
      resolve(false);
    }, timeoutMs);
  });
  const query = db
    .execute(rawSql`SELECT 1`)
    .then(() => true)
    .catch(() => false);
  try {
    return await Promise.race([query, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
