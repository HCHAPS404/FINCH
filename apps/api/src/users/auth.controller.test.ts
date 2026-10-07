/**
 * `AuthController` tests — signup/login/password-reset, ADR-0041. Real Postgres (see
 * `test-support/postgres-test-db.ts`): signup's write is a multi-table transaction,
 * and "does this actually commit all five rows together" is exactly the kind of thing
 * a mocked driver would wave through even if the transaction were silently broken.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema, type Database } from '@finch/db';
import type { FinchConfig } from '@finch/config';
import type { AuthSessionPort } from '@finch/domain';
import type { PrincipalId } from '@finch/contracts';
import { createTestDatabase, type TestDatabase } from '../test-support/postgres-test-db.js';
import { AuthController } from './auth.controller.js';

let testDb: TestDatabase;
let db: Database;

beforeAll(async () => {
  testDb = await createTestDatabase();
  db = testDb.db;
}, 120_000);

afterAll(async () => {
  await testDb.teardown();
});

function fakeSessions(): AuthSessionPort {
  return {
    issue: vi.fn((principalId: PrincipalId) => `token-for-${principalId}`),
    verify: vi.fn(),
  };
}

function configFor(finchEnv: string): FinchConfig {
  return { public: { finchEnv } } as unknown as FinchConfig;
}

function controllerFor(finchEnv = 'local'): AuthController {
  return new AuthController(db, fakeSessions(), configFor(finchEnv));
}

describe('AuthController.signup', () => {
  it('creates principal, party, profile, workspace, membership and credentials together', async () => {
    const controller = controllerFor();

    const result = await controller.signup({
      email: 'signup-1@example.test',
      password: 'correct-horse-battery',
      displayName: 'Grace Hopper',
    });

    expect(result.token).toBe(`token-for-${result.principalId}`);

    const [credential] = await db
      .select()
      .from(schema.credentials)
      .where(eq(schema.credentials.principalId, result.principalId));
    expect(credential?.email).toBe('signup-1@example.test');

    const [membership] = await db
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.principalId, result.principalId));
    expect(membership?.workspaceId).toBe(result.workspaceId);
    expect(membership?.capabilities).toEqual(
      expect.arrayContaining(['finance.debts.write', 'documents.write']),
    );

    const [profile] = await db
      .select()
      .from(schema.partyProfiles)
      .where(eq(schema.partyProfiles.principalId, result.principalId));
    expect(profile?.displayName).toBe('Grace Hopper');
  });

  it('rejects a payload that fails schema validation', async () => {
    const controller = controllerFor();

    await expect(
      controller.signup({ email: 'not-an-email', password: 'short', displayName: '' }),
    ).rejects.toMatchObject({ code: 'FINCH_VALIDATION_REQUEST_INVALID' });
  });

  it('rejects a second signup with an email already registered', async () => {
    const controller = controllerFor();
    await controller.signup({
      email: 'signup-2@example.test',
      password: 'correct-horse-battery',
      displayName: 'Katherine Johnson',
    });

    await expect(
      controller.signup({
        email: 'signup-2@example.test',
        password: 'another-password',
        displayName: 'Impersonator',
      }),
    ).rejects.toMatchObject({ code: 'FINCH_VALIDATION_EMAIL_TAKEN' });
  });
});

describe('AuthController.login', () => {
  it('issues a session for the correct email/password and returns the home workspace', async () => {
    const controller = controllerFor();
    const signedUp = await controller.signup({
      email: 'login-1@example.test',
      password: 'correct-horse-battery',
      displayName: 'Margaret Hamilton',
    });

    const result = await controller.login({
      email: 'login-1@example.test',
      password: 'correct-horse-battery',
    });

    expect(result.principalId).toBe(signedUp.principalId);
    expect(result.workspaceId).toBe(signedUp.workspaceId);
  });

  it('rejects a wrong password without revealing which part was wrong', async () => {
    const controller = controllerFor();
    await controller.signup({
      email: 'login-2@example.test',
      password: 'correct-horse-battery',
      displayName: 'Radia Perlman',
    });

    await expect(
      controller.login({ email: 'login-2@example.test', password: 'wrong-password' }),
    ).rejects.toMatchObject({ code: 'FINCH_AUTH_INVALID_CREDENTIALS' });
  });

  it('rejects an email that was never registered, with the same error as a wrong password', async () => {
    const controller = controllerFor();

    await expect(
      controller.login({ email: 'never-registered@example.test', password: 'whatever12' }),
    ).rejects.toMatchObject({ code: 'FINCH_AUTH_INVALID_CREDENTIALS' });
  });
});

describe('AuthController password reset', () => {
  it('returns the raw token in a sandbox-eligible environment', async () => {
    const controller = controllerFor('local');
    await controller.signup({
      email: 'reset-1@example.test',
      password: 'correct-horse-battery',
      displayName: 'Hedy Lamarr',
    });

    const response = await controller.requestPasswordReset({ email: 'reset-1@example.test' });
    expect(response.token).toBeDefined();
  });

  it('never returns a raw token outside a sandbox-eligible environment', async () => {
    const controller = controllerFor('prod');
    await controller.signup({
      email: 'reset-2@example.test',
      password: 'correct-horse-battery',
      displayName: 'Mary Keller',
    });

    const response = await controller.requestPasswordReset({ email: 'reset-2@example.test' });
    expect(response.token).toBeUndefined();
  });

  it('responds identically whether or not the email exists, so enumeration gains nothing', async () => {
    const controller = controllerFor('prod');

    const response = await controller.requestPasswordReset({ email: 'no-such-email@example.test' });
    expect(response).toEqual({});
  });

  it('confirms with a valid token, and the new password then works for login', async () => {
    const controller = controllerFor('local');
    await controller.signup({
      email: 'reset-3@example.test',
      password: 'original-password',
      displayName: 'Shafi Goldwasser',
    });
    const { token } = await controller.requestPasswordReset({ email: 'reset-3@example.test' });

    await expect(
      controller.confirmPasswordReset({ token, newPassword: 'brand-new-password' }),
    ).resolves.toEqual({ ok: true });

    await expect(
      controller.login({ email: 'reset-3@example.test', password: 'original-password' }),
    ).rejects.toMatchObject({ code: 'FINCH_AUTH_INVALID_CREDENTIALS' });
    await expect(
      controller.login({ email: 'reset-3@example.test', password: 'brand-new-password' }),
    ).resolves.toMatchObject({});
  });

  it('rejects reusing an already-confirmed token', async () => {
    const controller = controllerFor('local');
    await controller.signup({
      email: 'reset-4@example.test',
      password: 'original-password',
      displayName: 'Barbara Liskov',
    });
    const { token } = await controller.requestPasswordReset({ email: 'reset-4@example.test' });
    await controller.confirmPasswordReset({ token, newPassword: 'first-new-password' });

    await expect(
      controller.confirmPasswordReset({ token, newPassword: 'second-new-password' }),
    ).rejects.toMatchObject({ code: 'FINCH_AUTH_RESET_TOKEN_INVALID' });
  });

  it('rejects a token that has expired', async () => {
    const controller = controllerFor('local');
    const signedUp = await controller.signup({
      email: 'reset-5@example.test',
      password: 'original-password',
      displayName: 'Jean Bartik',
    });
    const { token } = await controller.requestPasswordReset({ email: 'reset-5@example.test' });
    await db
      .update(schema.passwordResetTokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.passwordResetTokens.principalId, signedUp.principalId));

    await expect(
      controller.confirmPasswordReset({ token, newPassword: 'too-late-password' }),
    ).rejects.toMatchObject({ code: 'FINCH_AUTH_RESET_TOKEN_INVALID' });
  });

  it('rejects an unrecognized token', async () => {
    const controller = controllerFor('local');

    await expect(
      controller.confirmPasswordReset({ token: 'not-a-real-token', newPassword: 'whatever123' }),
    ).rejects.toMatchObject({ code: 'FINCH_AUTH_RESET_TOKEN_INVALID' });
  });
});
