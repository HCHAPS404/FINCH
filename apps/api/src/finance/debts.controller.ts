/**
 * Debts CRUD — user-asserted personal financial data (R1, `RESTRICTED_FINANCIAL`,
 * ADR-0041's plan). Same `AuthGuard` + `AuthorizationGuard` + `RequireCapability`
 * chain as `WorkspaceSampleController`. Money stays `bigint` minor units end to end
 * (ADR-0016) — the wire format is a decimal string, never a JSON number, since a
 * JSON number cannot round-trip an arbitrary-precision integer losslessly.
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

const createDebtSchema = z.object({
  name: z.string().min(1),
  creditor: z.string().min(1),
  principalAmountMinor: z.string().regex(/^\d+$/, 'must be a non-negative integer string'),
  currency: z.string().length(3),
  interestRateBps: z.number().int().nonnegative().optional(),
  dueDate: z.string().optional(),
  status: z.string().min(1).optional(),
});

const updateDebtSchema = createDebtSchema.partial();

type DebtRow = typeof schema.debts.$inferSelect;
interface DebtResponse extends Omit<DebtRow, 'principalAmountMinor'> {
  readonly principalAmountMinor: string;
}

function toResponse(row: DebtRow): DebtResponse {
  return { ...row, principalAmountMinor: row.principalAmountMinor.toString() };
}

@Controller('workspaces/:workspaceId/debts')
@UseGuards(AuthGuard, AuthorizationGuard)
export class DebtsController {
  private readonly idGenerator = systemIdGenerator();

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  @Get()
  @RequireCapability('finance.debts.read')
  async list(@Param('workspaceId') workspaceId: string): Promise<DebtResponse[]> {
    const rows = await this.db
      .select()
      .from(schema.debts)
      .where(eq(schema.debts.workspaceId, workspaceId));
    return rows.map(toResponse);
  }

  @Get(':id')
  @RequireCapability('finance.debts.read')
  async get(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<DebtResponse> {
    return toResponse(await this.findOrThrow(workspaceId, id));
  }

  @Post()
  @RequireCapability('finance.debts.write')
  async create(
    @Param('workspaceId') workspaceId: string,
    @CurrentPrincipal() principalId: string,
    @Body() body: unknown,
  ): Promise<DebtResponse> {
    const parsed = createDebtSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid debt payload');
    }
    const now = systemClock.now();
    const rows = await this.db
      .insert(schema.debts)
      .values({
        id: this.idGenerator.next('debt'),
        workspaceId,
        createdByPrincipalId: principalId,
        name: parsed.data.name,
        creditor: parsed.data.creditor,
        principalAmountMinor: BigInt(parsed.data.principalAmountMinor),
        currency: parsed.data.currency,
        interestRateBps: parsed.data.interestRateBps,
        dueDate: parsed.data.dueDate,
        status: parsed.data.status ?? 'ACTIVE',
        observedAt: now,
        effectiveAt: now,
        ingestedAt: now,
      })
      .returning();
    return toResponse(firstOrThrow(rows));
  }

  @Patch(':id')
  @RequireCapability('finance.debts.write')
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<DebtResponse> {
    await this.findOrThrow(workspaceId, id);
    const parsed = updateDebtSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid debt payload');
    }
    const { principalAmountMinor, ...rest } = parsed.data;
    const rows = await this.db
      .update(schema.debts)
      .set({
        ...rest,
        ...(principalAmountMinor !== undefined
          ? { principalAmountMinor: BigInt(principalAmountMinor) }
          : {}),
        updatedAt: systemClock.now(),
      })
      .where(and(eq(schema.debts.workspaceId, workspaceId), eq(schema.debts.id, id)))
      .returning();
    return toResponse(firstOrThrow(rows));
  }

  @Delete(':id')
  @RequireCapability('finance.debts.write')
  async remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<{ readonly ok: true }> {
    await this.findOrThrow(workspaceId, id);
    await this.db
      .delete(schema.debts)
      .where(and(eq(schema.debts.workspaceId, workspaceId), eq(schema.debts.id, id)));
    return { ok: true };
  }

  private async findOrThrow(workspaceId: string, id: string): Promise<DebtRow> {
    const rows = await this.db
      .select()
      .from(schema.debts)
      .where(and(eq(schema.debts.workspaceId, workspaceId), eq(schema.debts.id, id)))
      .limit(1);
    const row = rows[0];
    if (row === undefined) {
      throw new FinchHttpException('FINCH_VALIDATION_NOT_FOUND', 'Debt not found');
    }
    return row;
  }
}
