/**
 * Authorization guard — README §9, §12, §102.11.
 *
 * Looks up the caller's Membership for the route's `:workspaceId` and hands it to
 * `@finch/authorization`'s pure `authorize()` — this guard is the composition root
 * that connects "a request arrived" to "a policy decision," it does not decide
 * anything itself.
 */
import { Injectable, Inject, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq, and } from 'drizzle-orm';
import type { PrincipalId, WorkspaceId } from '@finch/contracts';
import type { Database } from '@finch/db';
import { schema } from '@finch/db';
import { authorize } from '@finch/authorization';
import { MEMBERSHIP_STATUSES, type Membership } from '@finch/domain';
import { DATABASE } from '../db/db.tokens.js';
import { REQUIRE_CAPABILITY_KEY } from './require-capability.decorator.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { FinchHttpException } from '../../common/errors/finch-http-exception.js';

function toDomainMembership(row: typeof schema.memberships.$inferSelect): Membership {
  const status = MEMBERSHIP_STATUSES.find((candidate) => candidate === row.status) ?? 'REVOKED';
  return {
    principalId: row.principalId as PrincipalId,
    workspaceId: row.workspaceId as WorkspaceId,
    capabilities: row.capabilities,
    status,
  };
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const capability = this.reflector.get<string | undefined>(
      REQUIRE_CAPABILITY_KEY,
      context.getHandler(),
    );
    if (capability === undefined) {
      return true; // no @RequireCapability on this handler — nothing to enforce.
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const principalId = request.principalId;
    if (principalId === undefined) {
      throw new FinchHttpException(
        'FINCH_AUTHZ_NO_PRINCIPAL',
        'Authentication is required before authorization',
      );
    }

    const params = request.params as Record<string, string | undefined>;
    const workspaceId = params['workspaceId'];
    if (workspaceId === undefined) {
      throw new FinchHttpException(
        'FINCH_AUTHZ_NO_WORKSPACE',
        'This route does not declare a :workspaceId parameter',
      );
    }

    const rows = await this.db
      .select()
      .from(schema.memberships)
      .where(
        and(
          eq(schema.memberships.principalId, principalId),
          eq(schema.memberships.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    const row = rows[0];
    const membership = row === undefined ? undefined : toDomainMembership(row);

    const decision = authorize({
      request: {
        principalId: principalId as PrincipalId,
        action: capability,
        resourceType: 'workspace',
        resourceId: workspaceId,
        workspaceId: workspaceId as WorkspaceId,
        context: {},
      },
      membership,
    });

    if (!decision.allowed) {
      throw new FinchHttpException('FINCH_AUTHZ_DENIED', decision.reason);
    }

    return true;
  }
}
