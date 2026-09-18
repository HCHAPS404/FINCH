import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard.js';

/** The authenticated principal id. Only valid on a route guarded by `AuthGuard`. */
export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.principalId === undefined) {
      throw new Error('@CurrentPrincipal() used on a route without AuthGuard');
    }
    return request.principalId;
  },
);
