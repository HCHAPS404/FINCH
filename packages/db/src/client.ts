/**
 * Database client — the only place the driver is constructed (README §24,
 * `no-direct-db-outside-adapters`).
 */
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
