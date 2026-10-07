/**
 * Cards CRUD — same shape as `DebtsController`. Only `lastFour` is ever stored, never
 * a full card number (ADR-0041's plan: "the one hard security line in this table").
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '@finch/db';
import { schema } from '@finch/db';
import { systemClock } from '@finch/domain';
import { DATABASE } from '../infrastructure/db/db.tokens.js';
import { AuthGuard } from '../infrastructure/auth/auth.guard.js';
import { CurrentPrincipal } from '../infrastructure/auth/principal.decorator.js';
import { AuthorizationGuard } from '../infrastructure/authorization/authorization.guard.js';
import { RequireCapability } from '../infrastructure/authorization/require-capability.decorator.js';
import { FinchHttpException } from '../common/errors/finch-http-exception.js';
import { firstOrThrow } from '../common/first-or-throw.js';
import { systemIdGenerator } from '../infrastructure/security/id-generator.adapter.js';

const createCardSchema = z.object({
  issuer: z.string().min(1),
  network: z.string().min(1).optional(),
  lastFour: z.string().regex(/^\d{4}$/, 'must be exactly 4 digits'),
  creditLimitMinor: z.string().regex(/^\d+$/, 'must be a non-negative integer string').optional(),
  currency: z.string().length(3),
  cutDay: z.number().int().min(1).max(31).optional(),
  paymentDueDay: z.number().int().min(1).max(31).optional(),
});

const updateCardSchema = createCardSchema.partial();

type CardRow = typeof schema.cards.$inferSelect;
interface CardResponse extends Omit<CardRow, 'creditLimitMinor'> {
  readonly creditLimitMinor: string | null;
}

function toResponse(row: CardRow): CardResponse {
  return { ...row, creditLimitMinor: row.creditLimitMinor?.toString() ?? null };
}

@Controller('workspaces/:workspaceId/cards')
@UseGuards(AuthGuard, AuthorizationGuard)
export class CardsController {
  private readonly idGenerator = systemIdGenerator();

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  @Get()
  @RequireCapability('finance.cards.read')
  async list(@Param('workspaceId') workspaceId: string): Promise<CardResponse[]> {
    const rows = await this.db
      .select()
      .from(schema.cards)
      .where(eq(schema.cards.workspaceId, workspaceId));
    return rows.map(toResponse);
  }

  @Get(':id')
  @RequireCapability('finance.cards.read')
  async get(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<CardResponse> {
    return toResponse(await this.findOrThrow(workspaceId, id));
  }

  @Post()
  @RequireCapability('finance.cards.write')
  async create(
    @Param('workspaceId') workspaceId: string,
    @CurrentPrincipal() principalId: string,
    @Body() body: unknown,
  ): Promise<CardResponse> {
    const parsed = createCardSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid card payload');
    }
    const now = systemClock.now();
    const rows = await this.db
      .insert(schema.cards)
      .values({
        id: this.idGenerator.next('card'),
        workspaceId,
        createdByPrincipalId: principalId,
        issuer: parsed.data.issuer,
        network: parsed.data.network,
        lastFour: parsed.data.lastFour,
        creditLimitMinor:
          parsed.data.creditLimitMinor !== undefined
            ? BigInt(parsed.data.creditLimitMinor)
            : undefined,
        currency: parsed.data.currency,
        cutDay: parsed.data.cutDay,
        paymentDueDay: parsed.data.paymentDueDay,
        observedAt: now,
        effectiveAt: now,
        ingestedAt: now,
      })
      .returning();
    return toResponse(firstOrThrow(rows));
  }

  @Patch(':id')
  @RequireCapability('finance.cards.write')
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<CardResponse> {
    await this.findOrThrow(workspaceId, id);
    const parsed = updateCardSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid card payload');
    }
    const { creditLimitMinor, ...rest } = parsed.data;
    const rows = await this.db
      .update(schema.cards)
      .set({
        ...rest,
        ...(creditLimitMinor !== undefined ? { creditLimitMinor: BigInt(creditLimitMinor) } : {}),
        updatedAt: systemClock.now(),
      })
      .where(and(eq(schema.cards.workspaceId, workspaceId), eq(schema.cards.id, id)))
      .returning();
    return toResponse(firstOrThrow(rows));
  }

  @Delete(':id')
  @RequireCapability('finance.cards.write')
  async remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<{ readonly ok: true }> {
    await this.findOrThrow(workspaceId, id);
    await this.db
      .delete(schema.cards)
      .where(and(eq(schema.cards.workspaceId, workspaceId), eq(schema.cards.id, id)));
    return { ok: true };
  }

  private async findOrThrow(workspaceId: string, id: string): Promise<CardRow> {
    const rows = await this.db
      .select()
      .from(schema.cards)
      .where(and(eq(schema.cards.workspaceId, workspaceId), eq(schema.cards.id, id)))
      .limit(1);
    const row = rows[0];
    if (row === undefined) {
      throw new FinchHttpException('FINCH_VALIDATION_NOT_FOUND', 'Card not found');
    }
    return row;
  }
}
