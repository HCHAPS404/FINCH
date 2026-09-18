/**
 * Composition root for authentication — README §102.10, §104 ("composition root: this
 * is where adapters are wired to ports"). Only this file decides which
 * `AuthSessionPort` implementation exists; everything else in the app depends on the
 * port, never on `DevAuthSessionAdapter` directly (the controller excepted, which
 * needs `.issue()`, a sandbox-only capability outside the port's interface).
 */
import { randomBytes } from 'node:crypto';
import { Global, Module, type DynamicModule } from '@nestjs/common';
import type { FinchConfig } from '@finch/config';
import { isAuthSandboxEligible, systemClock } from '@finch/domain';
import { DevAuthSessionAdapter } from './dev-auth-session.adapter.js';
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
        { provide: AUTH_SESSION_PORT, useExisting: DevAuthSessionAdapter },
        AuthGuard,
      ],
      exports: [AUTH_SESSION_PORT, AuthGuard],
    };
  }
}
