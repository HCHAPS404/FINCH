/**
 * Domain event envelope — README §21.2.
 *
 * Delivery is at-least-once (§21.3, Constitution §4.13), so every consumer must be
 * idempotent. `eventId` is the deduplication key; `causationId` reconstructs why a
 * thing happened, which is what makes an audit trail answerable (§114).
 *
 * README §54: a domain event is not an audit event, not a telemetry span and not a
 * product-analytics event. They differ in purpose, retention and sensitivity, so they
 * do not share a type.
 */

export interface EventEnvelope<TPayload = unknown> {
  /** Deduplication key. Consumers MUST treat a repeat as a no-op. */
  readonly eventId: string;
  readonly eventType: string;
  /** Incremented on any breaking payload change; consumers pin what they understand. */
  readonly eventVersion: number;
  /** Tenant boundary. Present on every tenant-owned event (README §8.6). */
  readonly workspaceId: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  /** Service that emitted it, for provenance and blast-radius analysis. */
  readonly producer: string;
  /** Constant across a whole user-visible operation. */
  readonly correlationId: string;
  /** The eventId that caused this one. Null for an operation's first event. */
  readonly causationId: string | null;
  /** W3C trace id, so events stitch into the same trace as the HTTP request (§46). */
  readonly traceId?: string;
  readonly payload: TPayload;
}

/**
 * Transactional outbox row — README §21.1.
 *
 * Written in the SAME database transaction as the domain state change. This is what
 * makes "state changed but event lost" impossible; a separate publisher then moves
 * rows to SQS/EventBridge.
 */
export interface OutboxRecord {
  readonly id: string;
  readonly envelope: EventEnvelope;
  readonly createdAt: Date;
  readonly publishedAt: Date | null;
  readonly attempts: number;
  readonly lastError: string | null;
}
