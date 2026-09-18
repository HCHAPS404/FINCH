/**
 * Database client — README §24. The only place in this package a connection pool is
 * created; every other module receives a `Database` handle rather than reaching for
 * `pg` itself.
 */
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index.js';

export type Database = NodePgDatabase<typeof schema>;

export interface DbHandle {
  readonly db: Database;
  /** An arrow property, not a method — safe to tear off via destructuring. */
  readonly close: () => Promise<void>;
}

export function createDbClient(connectionString: string): DbHandle {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });
  return {
    db,
    close: async () => {
      await pool.end();
    },
  };
}
