/**
 * The caller's own profile — `identity.party_profiles`, keyed by `principalId`
 * (README §8.2, ADR-0041). `AuthGuard` only: no workspace capability check, this is
 * always the caller's own data, never another principal's.
 */
import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '@finch/db';
import { schema } from '@finch/db';
import { systemClock } from '@finch/domain';
import { DATABASE } from '../infrastructure/db/db.tokens.js';
import { AuthGuard } from '../infrastructure/auth/auth.guard.js';
import { CurrentPrincipal } from '../infrastructure/auth/principal.decorator.js';
import { FinchHttpException } from '../common/errors/finch-http-exception.js';

const updateMeSchema = z.object({
  displayName: z.string().min(1).optional(),
  dateOfBirth: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  locale: z.string().min(2).optional(),
});

@Controller('me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  @Get()
  async getMe(
    @CurrentPrincipal() principalId: string,
  ): Promise<typeof schema.partyProfiles.$inferSelect> {
    const rows = await this.db
      .select()
      .from(schema.partyProfiles)
      .where(eq(schema.partyProfiles.principalId, principalId))
      .limit(1);
    const profile = rows[0];
    if (profile === undefined) {
      throw new FinchHttpException('FINCH_VALIDATION_NOT_FOUND', 'Profile not found');
    }
    return profile;
  }

  @Patch()
  async updateMe(
    @CurrentPrincipal() principalId: string,
    @Body() body: unknown,
  ): Promise<typeof schema.partyProfiles.$inferSelect> {
    const parsed = updateMeSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid profile update');
    }

    const rows = await this.db
      .update(schema.partyProfiles)
      .set({ ...parsed.data, updatedAt: systemClock.now() })
      .where(eq(schema.partyProfiles.principalId, principalId))
      .returning();
    const profile = rows[0];
    if (profile === undefined) {
      throw new FinchHttpException('FINCH_VALIDATION_NOT_FOUND', 'Profile not found');
    }
    return profile;
  }
}
