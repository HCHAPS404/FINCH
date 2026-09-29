/**
 * Fixed-window rate limiter — README §119 (rate limiting), docs/hackathon/03 §6.
 *
 * In-process and per instance: enough to protect a single-instance demo and its
 * inference credit from a runaway client. A multi-instance deployment needs a shared
 * store (README §90 names Redis as the trigger), and that change goes through an ADR.
 */

export interface RateLimitDecision {
  readonly allowed: boolean;
  /** Seconds until the window resets; sent as `retry-after` when refused. */
  readonly retryAfterSeconds: number;
}

export class FixedWindowLimiter {
  private readonly windows = new Map<string, { start: number; count: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  check(key: string): RateLimitDecision {
    const now = this.now();
    const current = this.windows.get(key);
    if (current === undefined || now - current.start >= this.windowMs) {
      this.windows.set(key, { start: now, count: 1 });
      this.evictExpired(now);
      return { allowed: true, retryAfterSeconds: 0 };
    }
    const retryAfterSeconds = Math.ceil((current.start + this.windowMs - now) / 1_000);
    if (current.count >= this.limit) return { allowed: false, retryAfterSeconds };
    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  /** Bound memory: a stream of one-off clients must not grow the map forever. */
  private evictExpired(now: number): void {
    if (this.windows.size < 10_000) return;
    for (const [key, window] of this.windows) {
      if (now - window.start >= this.windowMs) this.windows.delete(key);
    }
  }
}
