/**
 * Migration + schema integration test — README §102.12 ("DB migration executes"),
 * §21.1 (outbox), §8.6 (mandatory workspace_id).
 *
 * One container is shared across the tests in this file (each spinning up its own
 * would multiply an already-slow image pull + boot); the tests use disjoint rows so
 * sharing the database doesn't couple them.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startPostgresHarness, SYNTHETIC_PERSONAS, type PostgresHarness } from '@finch/testing';
import { runMigrations } from './migrate.js';
import { createDbClient, type DbHandle } from './client.js';
import { seedSyntheticPersonas } from './seed.js';
import { principals, workspaces, memberships, outbox } from './schema/index.js';

let harness: PostgresHarness;
let handle: DbHandle;

beforeAll(async () => {
  harness = await startPostgresHarness();
  await runMigrations(harness.connectionUri);
  handle = createDbClient(harness.connectionUri);
}, 120_000);

afterAll(async () => {
  await handle.close();
  await harness.stop();
});

describe('runMigrations', () => {
  it('creates identity tables that accept a valid Principal/Workspace/Membership row', async () => {
    const { db } = handle;
    await db.insert(principals).values({ id: 'p1', type: 'HUMAN' });
    await db.insert(workspaces).values({ id: 'w1', type: 'PERSONAL' });
    await db.insert(memberships).values({
      principalId: 'p1',
      workspaceId: 'w1',
      capabilities: ['workspace.owner'],
    });

    const rows = await db.select().from(memberships);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.capabilities).toEqual(['workspace.owner']);
    expect(rows[0]?.status).toBe('ACTIVE');
  });

  it('enforces §8.6: a membership cannot reference a workspace that does not exist', async () => {
    const { db } = handle;
    await expect(
      db.insert(memberships).values({
        principalId: 'p1',
        workspaceId: 'does-not-exist',
        capabilities: ['workspace.owner'],
      }),
    ).rejects.toThrow();
  });

  it('creates the integration.outbox table matching the EventEnvelope shape (§21.1, §21.2)', async () => {
    const { db } = handle;
    await db.insert(principals).values({ id: 'p-outbox', type: 'SERVICE' });
    await db.insert(workspaces).values({ id: 'w-outbox', type: 'PERSONAL' });
    await db.insert(outbox).values({
      eventId: 'evt-1',
      eventType: 'test.event',
      eventVersion: 1,
      workspaceId: 'w-outbox',
      aggregateType: 'Test',
      aggregateId: 'w-outbox',
      occurredAt: new Date(),
      producer: 'migrate.test',
      correlationId: 'corr-1',
      causationId: null,
      payload: { hello: 'world' },
    });

    const rows = await db.select().from(outbox);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.publishedAt).toBeNull();
    expect(rows[0]?.attempts).toBe(0);
  });

  it('rejects a duplicate eventId — the outbox deduplication key (§21.2)', async () => {
    const { db } = handle;
    await expect(
      db.insert(outbox).values({
        eventId: 'evt-1',
        eventType: 'test.event',
        eventVersion: 1,
        workspaceId: 'w-outbox',
        aggregateType: 'Test',
        aggregateId: 'w-outbox',
        occurredAt: new Date(),
        producer: 'migrate.test',
        correlationId: 'corr-2',
        causationId: null,
        payload: {},
      }),
    ).rejects.toThrow();
  });
});

describe('seedSyntheticPersonas', () => {
  it('seeds every synthetic persona exactly once', async () => {
    const { db } = handle;
    const count = await seedSyntheticPersonas(db);
    expect(count).toBe(SYNTHETIC_PERSONAS.length);

    const rows = await db.select().from(workspaces);
    // At least one workspace per persona, plus the two rows the earlier tests inserted.
    expect(rows.length).toBeGreaterThanOrEqual(SYNTHETIC_PERSONAS.length);
  });
});
