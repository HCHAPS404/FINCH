/**
 * Migrations and seeds against real PostgreSQL 18.6 (the pinned baseline, README §110)
 * started with Testcontainers. Requires Docker.
 */
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { count, eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { connect, type DatabaseHandle } from './client.js';
import { runMigrations } from './migrate.js';
import {
  accounts,
  aiCalls,
  auditEvents,
  calcReceipts,
  financialSnapshots,
  transactions,
  workspaces,
} from './schema/index.js';
import { IDS, PERSONAS } from './seed/personas.js';
import { seedPersonas } from './seed/seed.js';

let container: StartedPostgreSqlContainer;
let handle: DatabaseHandle;

const HEX64 = 'a'.repeat(64);

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:18.6-trixie').start();
  handle = connect({ url: container.getConnectionUri(), maxConnections: 2 });
  await runMigrations(handle.db);
}, 180_000);

afterAll(async () => {
  await handle.close();
  await container.stop();
});

/** Assert that a statement is rejected by the database, with a message fragment. */
async function rejects(run: () => Promise<unknown>, fragment: RegExp): Promise<void> {
  let message = '';
  try {
    await run();
  } catch (error) {
    const cause = (error as { cause?: { message?: string } }).cause;
    message = `${(error as Error).message} ${cause?.message ?? ''}`;
  }
  expect(message).toMatch(fragment);
}

describe('migrations', () => {
  it('create the seven schemas on PostgreSQL 18', async () => {
    const version = await handle.db.execute<{ server_version: string }>(sql`SHOW server_version`);
    expect(version[0]?.server_version).toMatch(/^18\./);
    const schemas = await handle.db.execute<{ nspname: string }>(
      sql`SELECT nspname FROM pg_namespace WHERE nspname IN
          ('identity','finance','planning','decision','documents','audit','integration')`,
    );
    expect(schemas).toHaveLength(7);
  });

  it('are idempotent', async () => {
    await expect(runMigrations(handle.db)).resolves.toBeUndefined();
  });
});

describe('seed', () => {
  it('loads the personas and is idempotent', async () => {
    await seedPersonas(handle.db);
    await seedPersonas(handle.db);
    const [ws] = await handle.db.select({ n: count() }).from(workspaces);
    const [tx] = await handle.db.select({ n: count() }).from(transactions);
    expect(ws?.n).toBe(PERSONAS.workspaces.length);
    expect(tx?.n).toBe(PERSONAS.transactions.length);
  });

  it('round-trips bigint minor units exactly', async () => {
    const rows = await handle.db
      .select({ amount: transactions.amountMinor })
      .from(transactions)
      .where(eq(transactions.workspaceId, IDS.laura.workspace));
    expect(rows.map((r) => r.amount)).toContain(420_000_000n);
    for (const row of rows) expect(typeof row.amount).toBe('bigint');
  });
});

describe('constraints', () => {
  it('rejects a malformed currency code', async () => {
    await rejects(
      () =>
        handle.db.insert(accounts).values({
          workspaceId: IDS.laura.workspace,
          kind: 'CASH',
          name: 'Wallet',
          currency: 'cop',
          truthClass: 'USER_ASSERTED',
          sourceType: 'USER_INPUT',
          sourceRef: 'test',
        }),
      /accounts_currency_iso/,
    );
  });

  it('rejects a full card number in the masked column', async () => {
    await rejects(
      () =>
        handle.db.insert(accounts).values({
          workspaceId: IDS.laura.workspace,
          kind: 'CREDIT_CARD',
          name: 'Leaky',
          currency: 'COP',
          maskedNumber: '4111111111111111',
          truthClass: 'USER_ASSERTED',
          sourceType: 'USER_INPUT',
          sourceRef: 'test',
        }),
      /accounts_masked_last4/,
    );
  });

  it('rejects a duplicate import line', async () => {
    const { id: _id, ...original } = PERSONAS.transactions[0]!;
    await rejects(
      () => handle.db.insert(transactions).values(original),
      /transactions_workspace_dedupe/,
    );
  });

  it('refuses a receipt claiming a narrative truth class', async () => {
    await rejects(
      () =>
        handle.db.insert(calcReceipts).values({
          workspaceId: IDS.laura.workspace,
          skill: 'finance.convert_rate',
          formulaId: 'rate.convert',
          formulaVersion: 1,
          engineVersion: '0.0.0',
          inputs: {},
          inputsHash: HEX64,
          outputs: {},
          truthClass: 'GENERATED_NARRATIVE',
        }),
      /calc_receipts_truth_class/,
    );
  });

  it('refuses to delete a workspace that still owns data', async () => {
    await rejects(
      () => handle.db.delete(workspaces).where(eq(workspaces.id, IDS.laura.workspace)),
      /foreign key/,
    );
  });
});

describe('append-only guards', () => {
  it('keeps snapshots immutable', async () => {
    const [row] = await handle.db
      .insert(financialSnapshots)
      .values({ workspaceId: IDS.laura.workspace, checksum: HEX64, payload: {}, ruleVersions: {} })
      .returning({ id: financialSnapshots.id });
    await rejects(
      () =>
        handle.db
          .update(financialSnapshots)
          .set({ checksum: 'b'.repeat(64) })
          .where(eq(financialSnapshots.id, row!.id)),
      /append-only/,
    );
    await rejects(
      () => handle.db.delete(financialSnapshots).where(eq(financialSnapshots.id, row!.id)),
      /append-only/,
    );
  });

  it('keeps receipts, audit events and AI calls append-only, including TRUNCATE', async () => {
    await handle.db.insert(calcReceipts).values({
      workspaceId: IDS.laura.workspace,
      skill: 'finance.convert_rate',
      formulaId: 'rate.convert',
      formulaVersion: 1,
      engineVersion: '0.0.0',
      inputs: {},
      inputsHash: HEX64,
      outputs: {},
      truthClass: 'DERIVED_DETERMINISTIC',
    });
    await handle.db.insert(auditEvents).values({
      action: 'workspace.read',
      resourceType: 'workspace',
      outcome: 'ALLOWED',
      correlationId: 'test-correlation',
    });
    await handle.db.insert(aiCalls).values({
      correlationId: 'test-correlation',
      tier: 'FAST',
      outcome: 'OK',
      latencyMs: 12,
      redactionsCount: 0,
    });
    await rejects(() => handle.db.delete(calcReceipts), /append-only/);
    await rejects(() => handle.db.update(auditEvents).set({ action: 'x' }), /append-only/);
    await rejects(() => handle.db.delete(aiCalls), /append-only/);
    await rejects(() => handle.db.execute(sql`TRUNCATE audit.audit_events`), /append-only/);
  });
});
