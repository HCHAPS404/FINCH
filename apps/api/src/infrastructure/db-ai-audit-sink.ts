/**
 * Persists every AI Gateway call to `audit.ai_calls` (docs/hackathon/04 §9, ADR-0027).
 *
 * The gateway's audit interface is synchronous so an audit write can never delay or fail
 * a user's answer. Writes are therefore queued; a failed write is logged with the
 * correlation ID (never with content) and does not affect the request. `flush()` lets
 * shutdown and tests wait for pending writes.
 */
import type { AiAuditSink, AiCallRecord } from '@finch/ai-core';
import { aiCalls, type FinchDatabase } from '@finch/db';

export interface AuditLogger {
  error(details: Record<string, unknown>, message: string): void;
}

export class DatabaseAiAuditSink implements AiAuditSink {
  private readonly pending = new Set<Promise<void>>();

  constructor(
    private readonly db: FinchDatabase,
    private readonly logger: AuditLogger,
  ) {}

  record(entry: AiCallRecord): void {
    const write = this.db
      .insert(aiCalls)
      .values({
        correlationId: entry.correlationId,
        workspaceId: entry.workspaceId ?? null,
        tier: entry.tier,
        model: entry.model ?? null,
        promptId: entry.promptId,
        outcome: entry.outcome,
        failure: entry.failure ?? null,
        inputTokens: entry.inputTokens ?? null,
        outputTokens: entry.outputTokens ?? null,
        latencyMs: Math.max(0, Math.round(entry.latencyMs)),
        redactionsCount: entry.redactionsCount,
      })
      .then(() => undefined)
      .catch((error: unknown) => {
        this.logger.error(
          { correlationId: entry.correlationId, err: error },
          'failed to persist ai_calls audit record',
        );
      })
      .finally(() => {
        this.pending.delete(write);
      });
    this.pending.add(write);
  }

  async flush(): Promise<void> {
    await Promise.all([...this.pending]);
  }
}
