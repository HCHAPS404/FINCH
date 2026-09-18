/**
 * Dev-only session issuance — README §102.10.
 *
 * Only ever registered when `AuthModule.forRoot` decides the environment is sandbox
 * eligible (`isAuthSandboxEligible`); there is no runtime check inside this controller
 * because the safety property is "this route does not exist in production," not "this
 * route refuses requests in production."
 */
import { Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import type { PrincipalId } from '@finch/contracts';
import { FinchHttpException } from '../../common/errors/finch-http-exception.js';
import { DevAuthSessionAdapter } from './dev-auth-session.adapter.js';

const devSessionRequestSchema = z.object({ principalId: z.string().min(1) });

@Controller('auth')
export class AuthSandboxController {
  constructor(private readonly adapter: DevAuthSessionAdapter) {}

  @Post('dev-session')
  createDevSession(@Body() body: unknown): { token: string } {
    const parsed = devSessionRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'principalId is required');
    }
    return { token: this.adapter.issue(parsed.data.principalId as PrincipalId) };
  }
}
