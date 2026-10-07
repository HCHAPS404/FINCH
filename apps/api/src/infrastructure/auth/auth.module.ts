/**
 * Composition root for authentication — README §102.10, §104 ("composition root: this
 * is where adapters are wired to ports"). Only this file decides which
 * `AuthSessionPort` implementation exists; everything else in the app depends on the
 * port, never on an adapter directly.
 *
 * `PasswordAuthSessionAdapter` (ADR-0041) is wired to `AUTH_SESSION_PORT`
 * unconditionally — it is the identity mechanism for every environment, including
 * production, until ADR-0015 selects and wires a federated provider.
 * `DevAuthSessionAdapter` continues to exist only as the sandbox shortcut, additive
 * and gated by `isAuthSandboxEligible`, exposed solely through `AuthSandboxController`
 * which needs `.issue()`, a capability outside the formal port surface callers use.
 */
import { randomBytes } from 'node:crypto';
import { Global, Module, type DynamicModule } from '@nestjs/common';
import type { FinchConfig } from '@finch/config';
import { isAuthSandboxEligible, systemClock } from '@finch/domain';
import { DevAuthSessionAdapter } from './dev-auth-session.adapter.js';
import { PasswordAuthSessionAdapter } from './password-auth-session.adapter.js';
import { AuthSandboxController } from './auth-sandbox.controller.js';
import { AUTH_SESSION_PORT } from './auth.tokens.js';
import { AuthGuard } from './auth.guard.js';

@Global()
@Module({})
export class AuthModule {
  static forRoot(config: FinchConfig): DynamicModule {
    const sandboxEligible = isAuthSandboxEligible(config.public.finchEnv);
    // Generated per process, not configured: a sandbox token that survives a restart
    // is one step closer to looking like a real credential worth protecting.
    const sandboxSecret = randomBytes(32).toString('hex');

    return {
      module: AuthModule,
      controllers: sandboxEligible ? [AuthSandboxController] : [],
      providers: [
        {
          provide: DevAuthSessionAdapter,
          useFactory: (): DevAuthSessionAdapter =>
            new DevAuthSessionAdapter(sandboxSecret, systemClock),
        },
        {
          provide: PasswordAuthSessionAdapter,
          useFactory: (): PasswordAuthSessionAdapter =>
            new PasswordAuthSessionAdapter(config.secrets.authSessionSecret, systemClock),
        },
        { provide: AUTH_SESSION_PORT, useExisting: PasswordAuthSessionAdapter },
        AuthGuard,
      ],
      exports: [AUTH_SESSION_PORT, AuthGuard],
    };
  }
}
