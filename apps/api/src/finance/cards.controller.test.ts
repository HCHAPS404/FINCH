/**
 * `CardsController` tests — ADR-0041, ADR-0016 (money stays `bigint` end to end).
 * Real Postgres (see `test-support/postgres-test-db.ts`) for the same reason
 * `debts.controller.test.ts` uses it: FK-backed inserts and `bigint` round-trips.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema, type Database } from '@finch/db';
import { createTestDatabase, type TestDatabase } from '../test-support/postgres-test-db.js';
import { CardsController } from './cards.controller.js';

let testDb: TestDatabase;
let db: Database;
const principalId = 'principal-cards-owner';
const workspaceId = 'workspace-cards-1';

beforeAll(async () => {
  testDb = await createTestDatabase();
  db = testDb.db;
  await db.insert(schema.principals).values({ id: principalId, type: 'HUMAN' });
  await db.insert(schema.workspaces).values({ id: workspaceId, type: 'PERSONAL' });
}, 120_000);

afterAll(async () => {
  await testDb.teardown();
});

function validCardPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    issuer: 'Bancolombia',
    network: 'Visa',
    lastFour: '1234',
    creditLimitMinor: '500000000',
    currency: 'COP',
    cutDay: 15,
    paymentDueDay: 5,
    ...overrides,
  };
}

describe('CardsController', () => {
  it('never stores more than the last four digits, even if more were sent', async () => {
    const controller = new CardsController(db);

    await expect(
      controller.create(workspaceId, principalId, validCardPayload({ lastFour: '12345' })),
    ).rejects.toMatchObject({ code: 'FINCH_VALIDATION_REQUEST_INVALID' });
  });

  it('creates a card with the credit limit stored as bigint minor units', async () => {
    const controller = new CardsController(db);

    const created = await controller.create(workspaceId, principalId, validCardPayload());

    expect(created.creditLimitMinor).toBe('500000000');
    const [row] = await db.select().from(schema.cards).where(eq(schema.cards.id, created.id));
    expect(typeof row?.creditLimitMinor).toBe('bigint');
    expect(row?.creditLimitMinor).toBe(500000000n);
  });

  it('allows a card with no credit limit recorded yet', async () => {
    const controller = new CardsController(db);
    const payload = validCardPayload({ lastFour: '9999' });
    delete payload['creditLimitMinor'];

    const created = await controller.create(workspaceId, principalId, payload);

    expect(created.creditLimitMinor).toBeNull();
  });

  it('update changes only the submitted fields', async () => {
    const controller = new CardsController(db);
    const created = await controller.create(workspaceId, principalId, validCardPayload());

    const updated = await controller.update(workspaceId, created.id, { cutDay: 20 });

    expect(updated.cutDay).toBe(20);
    expect(updated.issuer).toBe('Bancolombia');
  });

  it('remove deletes the row', async () => {
    const controller = new CardsController(db);
    const created = await controller.create(workspaceId, principalId, validCardPayload());

    await expect(controller.remove(workspaceId, created.id)).resolves.toEqual({ ok: true });
    await expect(controller.get(workspaceId, created.id)).rejects.toMatchObject({
      code: 'FINCH_VALIDATION_NOT_FOUND',
    });
  });
});
