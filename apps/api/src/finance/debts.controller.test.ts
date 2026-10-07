/**
 * `DebtsController` tests — ADR-0041, ADR-0016 (money stays `bigint` end to end).
 * Real Postgres (see `test-support/postgres-test-db.ts`): the FK chain
 * (`workspace_id` → `identity.workspaces`, `created_by_principal_id` →
 * `identity.principals`) and the `bigint` column round-trip are exactly the things a
 * mocked driver would not catch.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema, type Database } from '@finch/db';
import { createTestDatabase, type TestDatabase } from '../test-support/postgres-test-db.js';
import { DebtsController } from './debts.controller.js';

let testDb: TestDatabase;
let db: Database;
const principalId = 'principal-debts-owner';
const workspaceId = 'workspace-debts-1';
const otherWorkspaceId = 'workspace-debts-2';

beforeAll(async () => {
  testDb = await createTestDatabase();
  db = testDb.db;
  await db.insert(schema.principals).values({ id: principalId, type: 'HUMAN' });
  await db.insert(schema.workspaces).values([
    { id: workspaceId, type: 'PERSONAL' },
    { id: otherWorkspaceId, type: 'PERSONAL' },
  ]);
}, 120_000);

afterAll(async () => {
  await testDb.teardown();
});

function validDebtPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Tarjeta de crédito',
    creditor: 'Bancolombia',
    principalAmountMinor: '250000000',
    currency: 'COP',
    interestRateBps: 2450,
    ...overrides,
  };
}

describe('DebtsController', () => {
  it('creates a debt with money stored as bigint minor units, never a float', async () => {
    const controller = new DebtsController(db);

    const created = await controller.create(workspaceId, principalId, validDebtPayload());

    expect(created.principalAmountMinor).toBe('250000000');
    expect(typeof created.principalAmountMinor).toBe('string');
    const [row] = await db.select().from(schema.debts).where(eq(schema.debts.id, created.id));
    expect(typeof row?.principalAmountMinor).toBe('bigint');
    expect(row?.principalAmountMinor).toBe(250000000n);
    expect(row?.truthClass).toBe('USER_ASSERTED');
  });

  it('rejects a payload with a float-looking amount', async () => {
    const controller = new DebtsController(db);

    await expect(
      controller.create(
        workspaceId,
        principalId,
        validDebtPayload({ principalAmountMinor: '1.50' }),
      ),
    ).rejects.toMatchObject({ code: 'FINCH_VALIDATION_REQUEST_INVALID' });
  });

  it('list only returns debts scoped to the requested workspace', async () => {
    const controller = new DebtsController(db);
    await controller.create(workspaceId, principalId, validDebtPayload({ name: 'Debt A' }));
    await controller.create(otherWorkspaceId, principalId, validDebtPayload({ name: 'Debt B' }));

    const rows = await controller.list(otherWorkspaceId);

    expect(rows.every((row) => row.workspaceId === otherWorkspaceId)).toBe(true);
    expect(rows.some((row) => row.name === 'Debt B')).toBe(true);
    expect(rows.some((row) => row.name === 'Debt A')).toBe(false);
  });

  it('get throws FINCH_VALIDATION_NOT_FOUND for an id outside the workspace', async () => {
    const controller = new DebtsController(db);
    const created = await controller.create(workspaceId, principalId, validDebtPayload());

    await expect(controller.get(otherWorkspaceId, created.id)).rejects.toMatchObject({
      code: 'FINCH_VALIDATION_NOT_FOUND',
    });
  });

  it('update changes only the submitted fields', async () => {
    const controller = new DebtsController(db);
    const created = await controller.create(workspaceId, principalId, validDebtPayload());

    const updated = await controller.update(workspaceId, created.id, {
      principalAmountMinor: '100000000',
    });

    expect(updated.principalAmountMinor).toBe('100000000');
    expect(updated.creditor).toBe('Bancolombia');
  });

  it('remove deletes the row scoped to the workspace', async () => {
    const controller = new DebtsController(db);
    const created = await controller.create(workspaceId, principalId, validDebtPayload());

    await expect(controller.remove(workspaceId, created.id)).resolves.toEqual({ ok: true });
    await expect(controller.get(workspaceId, created.id)).rejects.toMatchObject({
      code: 'FINCH_VALIDATION_NOT_FOUND',
    });
  });

  it('remove on an id from another workspace does not delete it', async () => {
    const controller = new DebtsController(db);
    const created = await controller.create(otherWorkspaceId, principalId, validDebtPayload());

    await expect(controller.remove(workspaceId, created.id)).rejects.toMatchObject({
      code: 'FINCH_VALIDATION_NOT_FOUND',
    });
    await expect(controller.get(otherWorkspaceId, created.id)).resolves.toMatchObject({
      id: created.id,
    });
  });
});
