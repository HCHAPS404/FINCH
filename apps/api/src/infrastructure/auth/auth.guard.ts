/**
 * Authentication guard — README §12 ("authorization is always evaluated server-side").
 * Verifies the bearer token via whatever `AuthSessionPort` is wired in and attaches
 * the resulting `principalId` to the request for downstream guards/handlers.
 */
import { Injectable, Inject, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthSessionPort } from '@finch/domain';
import { AUTH_SESSION_PORT } from './auth.tokens.js';
import { FinchHttpException } from '../../common/errors/finch-http-exception.js';

export interface AuthenticatedRequest extends FastifyRequest {
  principalId?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SESSION_PORT) private readonly sessions: AuthSessionPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const token =
      typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (token === undefined) {
      throw new FinchHttpException('FINCH_AUTH_MISSING_TOKEN', 'Authorization header is required');
    }

    const session = await this.sessions.verify(token);
    if (session === undefined) {
      throw new FinchHttpException(
        'FINCH_AUTH_INVALID_TOKEN',
        'Session token is invalid or expired',
      );
    }

    request.principalId = session.principalId;
    return true;
  }
}
