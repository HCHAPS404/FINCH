/**
 * Model tiers — docs/hackathon/04 §1, ADR-0036.
 *
 * Callers ask for a tier, never for a model. Which model serves a tier is
 * configuration, confirmed against the provider's `GET /v1/models` (task S0-05), so a
 * renamed or retired model is a config change rather than a code change.
 */
export const MODEL_TIERS = ['FAST', 'AGENT', 'DEEP'] as const;

export type ModelTier = (typeof MODEL_TIERS)[number];

/** Model ID per tier. A missing tier is unavailable; it is never silently rerouted. */
export type TierModels = Readonly<Partial<Record<ModelTier, string | undefined>>>;
