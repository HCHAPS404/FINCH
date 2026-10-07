/**
 * `MeController` tests — README §8.2, ADR-0041. Runs against a real Postgres
 * (see `test-support/postgres-test-db.ts`): `getMe`/`updateMe` are plain Drizzle
 * queries, nothing here is worth mocking.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { schema, type Database } from '@finch/db';
import { createTestDatabase, type TestDatabase } from '../test-support/postgres-test-db.js';
import { MeController } from './me.controller.js';

let testDb: TestDatabase;
let db: Database;

beforeAll(async () => {
  testDb = await createTestDatabase();
  db = testDb.db;
}, 120_000);

afterAll(async () => {
  await testDb.teardown();
});

async function seedProfile(principalId: string, partyId: string): Promise<void> {
  await db.insert(schema.principals).values({ id: principalId, type: 'HUMAN' });
  await db.insert(schema.parties).values({ id: partyId, type: 'PERSON' });
  await db.insert(schema.partyProfiles).values({
    partyId,
    principalId,
    displayName: 'Ada Lovelace',
  });
}

describe('MeController', () => {
  it('getMe returns the caller own profile', async () => {
    await seedProfile('principal-me-1', 'party-me-1');
    const controller = new MeController(db);

    const profile = await controller.getMe('principal-me-1');

    expect(profile.displayName).toBe('Ada Lovelace');
    expect(profile.principalId).toBe('principal-me-1');
    expect(profile.locale).toBe('es-CO');
  });

  it('getMe throws FINCH_VALIDATION_NOT_FOUND for a principal with no profile', async () => {
    const controller = new MeController(db);

    await expect(controller.getMe('principal-does-not-exist')).rejects.toMatchObject({
      code: 'FINCH_VALIDATION_NOT_FOUND',
    });
  });

  it('updateMe patches only the submitted fields and bumps updatedAt', async () => {
    await seedProfile('principal-me-2', 'party-me-2');
    const controller = new MeController(db);
    const before = await controller.getMe('principal-me-2');

    const updated = await controller.updateMe('principal-me-2', { phone: '+57 300 1234567' });

    expect(updated.phone).toBe('+57 300 1234567');
    expect(updated.displayName).toBe('Ada Lovelace');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.updatedAt.getTime());
  });

  it('updateMe rejects a payload that fails schema validation', async () => {
    await seedProfile('principal-me-3', 'party-me-3');
    const controller = new MeController(db);

    await expect(controller.updateMe('principal-me-3', { locale: 'x' })).rejects.toMatchObject({
      code: 'FINCH_VALIDATION_REQUEST_INVALID',
    });
  });

  it('updateMe throws FINCH_VALIDATION_NOT_FOUND for a principal with no profile', async () => {
    const controller = new MeController(db);

    await expect(
      controller.updateMe('principal-does-not-exist', { displayName: 'Nobody' }),
    ).rejects.toMatchObject({ code: 'FINCH_VALIDATION_NOT_FOUND' });
  });
});
