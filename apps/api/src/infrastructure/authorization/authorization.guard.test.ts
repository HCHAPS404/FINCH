/**
 * `AuthorizationGuard` tests — README §9, §12, §102.11. This is the only place a
 * Membership row turns into an allow/deny decision for a real request; `authorize()`
 * itself is covered by `packages/authorization`'s own tests, so these focus on the
 * DB-row-to-policy-request wiring and the guard's own error paths.
 */
import { describe, it, expect, vi } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Database } from '@finch/db';
import { FinchHttpException } from '../../common/errors/finch-http-exception.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { AuthorizationGuard } from './authorization.guard.js';

function contextFor(
  principalId: string | undefined,
  params: Record<string, string | undefined>,
): ExecutionContext {
  const request = { principalId, params } as AuthenticatedRequest;
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => (): void => {
      /* no-op — only here for `reflector.get` to key off */
    },
  } as unknown as ExecutionContext;
}

function reflectorReturning(capability: string | undefined): Reflector {
  return { get: vi.fn().mockReturnValue(capability) } as unknown as Reflector;
}

function dbReturningMembershipRows(
  rows: readonly {
    principalId: string;
    workspaceId: string;
    capabilities: string[];
    status: string;
  }[],
): Database {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(rows),
        }),
      }),
    }),
  } as unknown as Database;
}

describe('AuthorizationGuard', () => {
  it('allows the request when the route declares no @RequireCapability', async () => {
    const guard = new AuthorizationGuard(
      reflectorReturning(undefined),
      dbReturningMembershipRows([]),
    );
    const context = contextFor('principal-1', { workspaceId: 'workspace-1' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('throws FINCH_AUTHZ_NO_PRINCIPAL when AuthGuard has not run', async () => {
    const guard = new AuthorizationGuard(
      reflectorReturning('finance.debts.read'),
      dbReturningMembershipRows([]),
    );
    const context = contextFor(undefined, { workspaceId: 'workspace-1' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTHZ_NO_PRINCIPAL',
    } satisfies Partial<FinchHttpException>);
  });

  it('throws FINCH_AUTHZ_NO_WORKSPACE when the route has no :workspaceId param', async () => {
    const guard = new AuthorizationGuard(
      reflectorReturning('finance.debts.read'),
      dbReturningMembershipRows([]),
    );
    const context = contextFor('principal-1', {});

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTHZ_NO_WORKSPACE',
    } satisfies Partial<FinchHttpException>);
  });

  it('denies when no membership row exists for this principal/workspace pair', async () => {
    const guard = new AuthorizationGuard(
      reflectorReturning('finance.debts.read'),
      dbReturningMembershipRows([]),
    );
    const context = contextFor('principal-1', { workspaceId: 'workspace-1' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTHZ_DENIED',
    } satisfies Partial<FinchHttpException>);
  });

  it('denies when the membership exists but lacks the required capability', async () => {
    const guard = new AuthorizationGuard(
      reflectorReturning('finance.debts.write'),
      dbReturningMembershipRows([
        {
          principalId: 'principal-1',
          workspaceId: 'workspace-1',
          capabilities: ['finance.debts.read'],
          status: 'ACTIVE',
        },
      ]),
    );
    const context = contextFor('principal-1', { workspaceId: 'workspace-1' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTHZ_DENIED',
    } satisfies Partial<FinchHttpException>);
  });

  it('allows when an active membership grants the required capability', async () => {
    const guard = new AuthorizationGuard(
      reflectorReturning('finance.debts.read'),
      dbReturningMembershipRows([
        {
          principalId: 'principal-1',
          workspaceId: 'workspace-1',
          capabilities: ['finance.debts.read'],
          status: 'ACTIVE',
        },
      ]),
    );
    const context = contextFor('principal-1', { workspaceId: 'workspace-1' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('denies when the membership has been revoked, even with the capability listed', async () => {
    const guard = new AuthorizationGuard(
      reflectorReturning('finance.debts.read'),
      dbReturningMembershipRows([
        {
          principalId: 'principal-1',
          workspaceId: 'workspace-1',
          capabilities: ['finance.debts.read'],
          status: 'REVOKED',
        },
      ]),
    );
    const context = contextFor('principal-1', { workspaceId: 'workspace-1' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTHZ_DENIED',
    } satisfies Partial<FinchHttpException>);
  });
});
