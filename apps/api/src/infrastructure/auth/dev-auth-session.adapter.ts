/**
 * Dev-only auth sandbox adapter — README §102.10, ADR-0015 (still Proposed).
 *
 * Implements `AuthSessionPort` with an HMAC-signed opaque token instead of a real OIDC
 * provider, since ADR-0015 has not chosen a vendor. This is intentionally not a JWT or
 * any standard token format — using one would look like a real identity integration it
 * is not. `AuthModule.forRoot` only wires this in, and only registers the issuing
 * controller, when `isAuthSandboxEligible` says the environment allows it.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PrincipalId } from '@finch/contracts';
import {
  isSessionExpired,
  type AuthSession,
  type AuthSessionPort,
  type Clock,
} from '@finch/domain';

const SESSION_TTL_MS = 60 * 60 * 1000; // one hour — a sandbox session, not a real one.

interface SandboxTokenPayload {
  readonly principalId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export class DevAuthSessionAdapter implements AuthSessionPort {
  constructor(
    private readonly secret: string,
    private readonly clock: Clock,
  ) {}

  issue(principalId: PrincipalId): string {
    const issuedAt = this.clock.now();
    const expiresAt = new Date(issuedAt.getTime() + SESSION_TTL_MS);
    const payload: SandboxTokenPayload = {
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

    let payload: SandboxTokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as SandboxTokenPayload;
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
