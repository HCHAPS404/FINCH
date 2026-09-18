/**
 * `AuthGuard` tests — README §12 ("authorization is always evaluated server-side").
 */
import { describe, it, expect, vi } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthSessionPort } from '@finch/domain';
import type { PrincipalId } from '@finch/contracts';
import { FinchHttpException } from '../../common/errors/finch-http-exception.js';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard.js';

const principalId = 'principal-1' as PrincipalId;

function contextFor(headers: Record<string, string>): {
  context: ExecutionContext;
  request: AuthenticatedRequest;
} {
  const request = { headers } as AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('AuthGuard', () => {
  it('rejects a request with no Authorization header', async () => {
    const sessions: AuthSessionPort = { verify: vi.fn() };
    const guard = new AuthGuard(sessions);
    const { context } = contextFor({});

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTH_MISSING_TOKEN',
    } satisfies Partial<FinchHttpException>);
    expect(sessions.verify).not.toHaveBeenCalled();
  });

  it('rejects a header that is not a Bearer token', async () => {
    const sessions: AuthSessionPort = { verify: vi.fn() };
    const guard = new AuthGuard(sessions);
    const { context } = contextFor({ authorization: 'Basic dXNlcjpwYXNz' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTH_MISSING_TOKEN',
    } satisfies Partial<FinchHttpException>);
  });

  it('rejects a Bearer token the session port cannot verify', async () => {
    const sessions: AuthSessionPort = { verify: vi.fn().mockResolvedValue(undefined) };
    const guard = new AuthGuard(sessions);
    const { context } = contextFor({ authorization: 'Bearer bad-token' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: 'FINCH_AUTH_INVALID_TOKEN',
    } satisfies Partial<FinchHttpException>);
    expect(sessions.verify).toHaveBeenCalledWith('bad-token');
  });

  it('accepts a valid Bearer token and attaches the principal to the request', async () => {
    const session = { principalId, issuedAt: new Date(), expiresAt: new Date() };
    const sessions: AuthSessionPort = { verify: vi.fn().mockResolvedValue(session) };
    const guard = new AuthGuard(sessions);
    const { context, request } = contextFor({ authorization: 'Bearer good-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.principalId).toBe(principalId);
  });
});
