/**
 * Truth classification — README §3.3, §11.
 *
 * FINCH must never let an estimate, or a sentence written by a language model, be
 * mistaken for something a bank confirmed. The distinction is not presentational:
 * it decides what the system is allowed to act on (Constitution §4.2, §4.7).
 *
 * This is the single most load-bearing type in the codebase. Every financial value
 * that crosses a module boundary carries it.
 */

export const TRUTH_CLASSES = [
  /** Confirmed by a provider, a verified document, or a reconciled action. */
  'OBSERVED',
  /** Entered or confirmed by the user. Trusted, but not independently verified. */
  'USER_ASSERTED',
  /** Output of a versioned, reproducible formula over other facts. */
  'DERIVED_DETERMINISTIC',
  /** Forecast, probabilistic classification or inference. Never authoritative. */
  'ESTIMATED',
  /** Prose produced by a language model. Explains; never establishes. */
  'GENERATED_NARRATIVE',
] as const;

export type TruthClass = (typeof TRUTH_CLASSES)[number];

/**
 * Truth classes that may drive an irreversible financial action.
 *
 * Constitution §4.2 ("financial truth does not depend on an LLM") and §4.7 ("an
 * unconfirmed document cannot trigger an irreversible monetary action") are enforced
 * here rather than restated in prose at each call site.
 */
const ACTIONABLE = new Set<TruthClass>(['OBSERVED', 'DERIVED_DETERMINISTIC']);

export function canDriveIrreversibleAction(truthClass: TruthClass): boolean {
  return ACTIONABLE.has(truthClass);
}

/** An LLM may describe a calculation; it may never promote its own output. */
export function isAuthoritative(truthClass: TruthClass): boolean {
  return truthClass === 'OBSERVED' || truthClass === 'DERIVED_DETERMINISTIC';
}

// ---------------------------------------------------------------------------
// Provenance — README §11.
// ---------------------------------------------------------------------------

export const SOURCE_TYPES = [
  'PROVIDER',
  'DOCUMENT',
  'USER_INPUT',
  'COMPUTATION',
  'MODEL',
  'IMPORT',
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

/**
 * Every significant figure declares where it came from.
 *
 * Note that `confidence` is deliberately optional and never substitutes for
 * `sourceType` (README §11): a high-confidence estimate is still an estimate.
 */
export interface Provenance {
  readonly truthClass: TruthClass;
  readonly sourceType: SourceType;
  /** Opaque reference to the originating record: provider payload, document, run. */
  readonly sourceRef: string;
  /** When the fact was true in the outside world. */
  readonly observedAt: Date;
  /** When the fact takes effect for FINCH's purposes. */
  readonly effectiveAt: Date;
  /** When FINCH first recorded it. */
  readonly ingestedAt: Date;
  /** Only meaningful for ESTIMATED / model-derived values. Range 0..1. */
  readonly confidence?: number;
  /** Principal who verified it, when a human confirmation exists. */
  readonly verifiedByPrincipalId?: string;
  /** Version of the normalizer that produced the canonical shape. */
  readonly normalizerVersion?: string;
  /** Version of the formula, when truthClass is DERIVED_DETERMINISTIC. */
  readonly formulaVersion?: string;
  readonly schemaVersion: string;
}

/** Data freshness as presented to the user (README §48, §116). */
export type Freshness = 'FRESH' | 'RECENT' | 'STALE' | 'UNKNOWN';
