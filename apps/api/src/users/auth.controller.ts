/**
 * Signup, login and password recovery — ADR-0041.
 *
 * Password recovery stops at issuing a reset token: no SMTP/email-sending capability
 * exists anywhere in this repo yet (ADR-0041, Consequences). The raw token is
 * returned directly in the response, but only when `isAuthSandboxEligible` says this
 * environment may see it — the same gate `AuthSandboxController` uses — so a real
 * deployment never gets a password-reset response it could use to take over another
 * account.
 */
import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '@finch/db';
import { schema } from '@finch/db';
import type { FinchConfig } from '@finch/config';
import type { PrincipalId, PartyId, WorkspaceId } from '@finch/contracts';
import {
  createPrincipal,
  createParty,
  createWorkspace,
  createMembership,
  isAuthSandboxEligible,
  isResetTokenExpired,
  PASSWORD_RESET_TTL_MS,
  systemClock,
  type AuthSessionPort,
} from '@finch/domain';
import { DATABASE } from '../infrastructure/db/db.tokens.js';
import { AUTH_SESSION_PORT } from '../infrastructure/auth/auth.tokens.js';
import { FINCH_CONFIG } from '../config/config.tokens.js';
import { FinchHttpException } from '../common/errors/finch-http-exception.js';
import { systemIdGenerator } from '../infrastructure/security/id-generator.adapter.js';
import { hashPassword, verifyPassword } from '../infrastructure/security/password.adapter.js';
import {
  generateResetToken,
  hashResetToken,
} from '../infrastructure/security/reset-token.adapter.js';

const PERSONAL_WORKSPACE_CAPABILITIES = [
  'workspace.read',
  'finance.debts.read',
  'finance.debts.write',
  'finance.cards.read',
  'finance.cards.write',
  'documents.read',
  'documents.write',
];

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const resetRequestSchema = z.object({ email: z.email() });

const resetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

interface SessionResponse {
  readonly token: string;
  readonly principalId: string;
  readonly workspaceId: string;
}

@Controller('auth')
export class AuthController {
  private readonly idGenerator = systemIdGenerator();

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(AUTH_SESSION_PORT) private readonly sessions: AuthSessionPort,
    @Inject(FINCH_CONFIG) private readonly config: FinchConfig,
  ) {}

  @Post('signup')
  async signup(@Body() body: unknown): Promise<SessionResponse> {
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid signup request');
    }
    const { email, password, displayName } = parsed.data;

    const existing = await this.db
      .select({ principalId: schema.credentials.principalId })
      .from(schema.credentials)
      .where(eq(schema.credentials.email, email))
      .limit(1);
    if (existing[0] !== undefined) {
      throw new FinchHttpException('FINCH_VALIDATION_EMAIL_TAKEN', 'Email is already registered');
    }

    const passwordHash = await hashPassword(password);

    const principalId = createPrincipal(
      this.idGenerator.next('principal') as PrincipalId,
      'HUMAN',
    ).id;
    const partyId = createParty(this.idGenerator.next('party') as PartyId, 'PERSON').id;
    const workspaceId = createWorkspace(
      this.idGenerator.next('workspace') as WorkspaceId,
      'PERSONAL',
    ).id;
    const membership = createMembership({
      principalId,
      workspaceId,
      capabilities: PERSONAL_WORKSPACE_CAPABILITIES,
    });

    await this.db.transaction(async (tx) => {
      await tx.insert(schema.principals).values({ id: principalId, type: 'HUMAN' });
      await tx.insert(schema.parties).values({ id: partyId, type: 'PERSON' });
      await tx.insert(schema.partyProfiles).values({
        partyId,
        principalId,
        displayName,
      });
      await tx.insert(schema.workspaces).values({ id: workspaceId, type: 'PERSONAL' });
      await tx.insert(schema.memberships).values({
        principalId: membership.principalId,
        workspaceId: membership.workspaceId,
        capabilities: [...membership.capabilities],
        status: membership.status,
      });
      await tx.insert(schema.credentials).values({ principalId, email, passwordHash });
    });

    return { token: this.sessions.issue(principalId), principalId, workspaceId };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown): Promise<SessionResponse> {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid login request');
    }
    const { email, password } = parsed.data;

    const rows = await this.db
      .select()
      .from(schema.credentials)
      .where(eq(schema.credentials.email, email))
      .limit(1);
    const credential = rows[0];

    // Never reveal whether the email exists — same generic failure either way.
    if (credential === undefined) {
      throw new FinchHttpException('FINCH_AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }
    const passwordValid = await verifyPassword(password, credential.passwordHash);
    if (!passwordValid) {
      throw new FinchHttpException('FINCH_AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const membershipRows = await this.db
      .select({ workspaceId: schema.memberships.workspaceId })
      .from(schema.memberships)
      .where(eq(schema.memberships.principalId, credential.principalId))
      .limit(1);
    const workspaceId = membershipRows[0]?.workspaceId ?? '';

    return {
      token: this.sessions.issue(credential.principalId as PrincipalId),
      principalId: credential.principalId,
      workspaceId,
    };
  }

  @Post('password-reset/request')
  @HttpCode(200)
  async requestPasswordReset(@Body() body: unknown): Promise<{ readonly token?: string }> {
    const parsed = resetRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid request');
    }

    const rows = await this.db
      .select({ principalId: schema.credentials.principalId })
      .from(schema.credentials)
      .where(eq(schema.credentials.email, parsed.data.email))
      .limit(1);
    const credential = rows[0];

    // Always 200 regardless of whether the account exists (README §58 / ADR-0041).
    if (credential === undefined) {
      return {};
    }

    const rawToken = generateResetToken();
    const now = systemClock.now();
    await this.db.insert(schema.passwordResetTokens).values({
      id: this.idGenerator.next('reset'),
      principalId: credential.principalId,
      tokenHash: hashResetToken(rawToken),
      expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
    });

    const sandboxEligible = isAuthSandboxEligible(this.config.public.finchEnv);
    return sandboxEligible ? { token: rawToken } : {};
  }

  @Post('password-reset/confirm')
  @HttpCode(200)
  async confirmPasswordReset(@Body() body: unknown): Promise<{ readonly ok: true }> {
    const parsed = resetConfirmSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid request');
    }

    const tokenHash = hashResetToken(parsed.data.token);
    const rows = await this.db
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.tokenHash, tokenHash))
      .limit(1);
    const resetToken = rows[0];

    if (resetToken?.usedAt !== null) {
      throw new FinchHttpException(
        'FINCH_AUTH_RESET_TOKEN_INVALID',
        'Reset token is invalid or expired',
      );
    }
    if (isResetTokenExpired(resetToken.expiresAt, systemClock)) {
      throw new FinchHttpException(
        'FINCH_AUTH_RESET_TOKEN_INVALID',
        'Reset token is invalid or expired',
      );
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.credentials)
        .set({ passwordHash, updatedAt: systemClock.now() })
        .where(eq(schema.credentials.principalId, resetToken.principalId));
      await tx
        .update(schema.passwordResetTokens)
        .set({ usedAt: systemClock.now() })
        .where(eq(schema.passwordResetTokens.id, resetToken.id));
    });

    return { ok: true };
  }
}
