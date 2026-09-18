/**
 * Event publisher port — README §21.1, §21.3, ADR-0014, ADR-0022.
 *
 * `apps/worker` drains `@finch/db`'s outbox table and publishes each row through this
 * port. Foundation ships a local/log-based adapter; the eventual SQS/EventBridge
 * adapter is vendor-shaped and belongs at the composition root, never in the domain
 * (`domain-does-not-import-adapters`).
 */
import type { EventEnvelope } from '@finch/contracts';

export interface EventPublisher {
  publish(envelope: EventEnvelope): Promise<void>;
}
