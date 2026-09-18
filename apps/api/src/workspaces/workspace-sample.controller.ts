/**
 * Proves the identity chain end to end (README §102.10, §102.11): a bearer token
 * issued by the auth sandbox resolves to a Principal, `AuthorizationGuard` looks up
 * that Principal's Membership in `:workspaceId` and asks `@finch/authorization`
 * whether it grants `workspace.read`, and only then does this handler run.
 */
import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Database } from '@finch/db';
import { schema } from '@finch/db';
import { DATABASE } from '../infrastructure/db/db.tokens.js';
import { AuthGuard } from '../infrastructure/auth/auth.guard.js';
import { CurrentPrincipal } from '../infrastructure/auth/principal.decorator.js';
import { AuthorizationGuard } from '../infrastructure/authorization/authorization.guard.js';
import { RequireCapability } from '../infrastructure/authorization/require-capability.decorator.js';
import { FinchHttpException } from '../common/errors/finch-http-exception.js';

interface SampleResponse {
  readonly workspace: typeof schema.workspaces.$inferSelect;
  readonly viewedByPrincipalId: string;
}

@Controller('workspaces/:workspaceId')
@UseGuards(AuthGuard, AuthorizationGuard)
export class WorkspaceSampleController {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  @Get('sample')
  @RequireCapability('workspace.read')
  async sample(
    @Param('workspaceId') workspaceId: string,
    @CurrentPrincipal() principalId: string,
  ): Promise<SampleResponse> {
    const rows = await this.db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, workspaceId))
      .limit(1);
    const workspace = rows[0];
    if (workspace === undefined) {
      throw new FinchHttpException('FINCH_VALIDATION_NOT_FOUND', 'Workspace not found');
    }
    return { workspace, viewedByPrincipalId: principalId };
  }
}
