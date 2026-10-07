/**
 * Real session adapter — ADR-0041. Same HMAC-signed opaque token shape as
 * `DevAuthSessionAdapter` (deliberately not a JWT, see that file's doc comment), but
 * signed with a configured, stable secret (`AUTH_SESSION_SECRET`) instead of a
 * per-process random one — a real user's session must still verify after a process
 * restart, unlike the sandbox's intentionally-ephemeral one. This is the identity
 * mechanism for every environment, including production, until ADR-0015 selects and
 * wires a federated provider.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PrincipalId } from '@finch/contracts';
import {
  isSessionExpired,
  type AuthSession,
  type AuthSessionPort,
  type Clock,
} from '@finch/domain';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — a real session, not a sandbox one.

interface SessionTokenPayload {
  readonly principalId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export class PasswordAuthSessionAdapter implements AuthSessionPort {
  constructor(
    private readonly secret: string,
    private readonly clock: Clock,
  ) {}

  issue(principalId: PrincipalId): string {
    const issuedAt = this.clock.now();
    const expiresAt = new Date(issuedAt.getTime() + SESSION_TTL_MS);
    const payload: SessionTokenPayload = {
      principalId,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    return `${encoded}.${sign(encoded, this.secret)}`;
  }

  verify(token: string): Promise<AuthSession | undefined> {
    const [encoded, signature] = token.split('.');
    if (encoded === undefined || signature === undefined) {
      return Promise.resolve(undefined);
    }

    const expectedBuffer = Buffer.from(sign(encoded, this.secret));
    const signatureBuffer = Buffer.from(signature);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return Promise.resolve(undefined);
    }

    let payload: SessionTokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as SessionTokenPayload;
    } catch {
      return Promise.resolve(undefined);
    }

    const session: AuthSession = {
      principalId: payload.principalId as PrincipalId,
      issuedAt: new Date(payload.issuedAt),
      expiresAt: new Date(payload.expiresAt),
    };

    return Promise.resolve(isSessionExpired(session, this.clock) ? undefined : session);
  }
}
