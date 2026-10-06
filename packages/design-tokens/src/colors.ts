/**
 * Semantic color tokens — README §34.
 *
 * Provenance (Constitution §4.2 applies to this file by the same logic it applies to
 * money: a value with no traceable origin cannot be trusted).
 *
 * - `light`: read directly from the "02 · Components" page of the FINCH Figma file
 *   (file key aA7KzO0a2hg4cJY3zhDzkS) via the REST API on 2026-10-06. Every hex value
 *   below is a fill or stroke actually used by a built component (Button, Input,
 *   TruthBadge, StatusChip, Banner, Checkbox, Toggle, Sidebar, TopBar). None are
 *   invented.
 * - `dark`: Figma has no built dark-mode components yet (the "06 · States" and
 *   "01 · Foundations" pages are empty) except the literal brand surfaces used behind
 *   the logo lockup (`#0B2B20`, `#0E4331`, reused here as `surface.base` /
 *   `surface.raised`). Every other dark value is derived from its light-theme
 *   counterpart by holding hue and saturation constant and searching for the lowest
 *   lightness that still clears a 4.5:1 contrast ratio (or 3:1 for non-text borders,
 *   per WCAG 1.4.11) against both dark surfaces. `colors.test.ts` asserts this for
 *   every pair — it is not merely eyeballed. This is a provisional palette: replace it
 *   wholesale once an actual dark-mode pass exists in Figma, not by hand-editing
 *   individual values here.
 */

export interface StatusTokenPair {
  /** Background fill for a badge/chip/banner surface. */
  readonly bg: string;
  /** Foreground: text, icon stroke, border. */
  readonly fg: string;
}

export interface SemanticPalette {
  readonly surface: {
    readonly base: string;
    readonly raised: string;
  };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly muted: string;
  };
  readonly border: {
    readonly default: string;
    readonly subtle: string;
    readonly strong: string;
  };
  readonly positive: StatusTokenPair;
  readonly negative: StatusTokenPair;
  readonly warning: StatusTokenPair;
  /**
   * Figma has no component that distinguishes `critical` from `negative` yet — both
   * currently resolve to the same values. Kept as a separate token (not an alias of
   * `negative` in code) because Constitution §34 lists them as distinct semantic
   * concepts: `negative` describes a financial direction (a loss, a debit), `critical`
   * describes severity (a failure, a security condition). They are expected to diverge
   * once a design pass defines that distinction.
   */
  readonly critical: StatusTokenPair;
  /** Truth class OBSERVED — Figma `TruthBadge` / `Kind=Verified`. */
  readonly verified: StatusTokenPair;
  /** Truth class ESTIMATED — Figma `TruthBadge` / `Kind=Estimated`. */
  readonly estimated: StatusTokenPair;
  /** Freshness STALE — Figma `TruthBadge` / `Kind=Stale` and `FreshnessStamp` / `State=Stale`. */
  readonly stale: StatusTokenPair;
  /**
   * No Figma component currently represents "pending" (an action awaiting
   * confirmation). Mapped to the same blue family Figma already uses for
   * `StatusChip` / `Tone=Info` and `TruthBadge` / `Kind=Declared`, since both describe
   * "asserted, not yet confirmed" states — the closest existing precedent. Revisit once
   * a dedicated Pending variant exists.
   */
  readonly pending: StatusTokenPair;
}

export const light: SemanticPalette = {
  surface: {
    base: '#F7FAF8',
    raised: '#FFFFFF',
  },
  text: {
    primary: '#101A16',
    secondary: '#48554F',
    muted: '#5F6C66',
  },
  border: {
    default: '#E2E8E4',
    subtle: '#CFD8D3',
    strong: '#6F7E77',
  },
  positive: { bg: '#E6F4EC', fg: '#146044' },
  negative: { bg: '#FCEBE9', fg: '#A4221A' },
  warning: { bg: '#FDF1E1', fg: '#8A4B08' },
  critical: { bg: '#FCEBE9', fg: '#A4221A' },
  verified: { bg: '#E6F4EC', fg: '#146044' },
  estimated: { bg: '#F7EFDD', fg: '#6B4E12' },
  stale: { bg: '#ECEFED', fg: '#4E5A55' },
  pending: { bg: '#E8EFFB', fg: '#1C4E9A' },
};

export const dark: SemanticPalette = {
  surface: {
    base: '#0B2B20',
    raised: '#0E4331',
  },
  text: {
    primary: '#F7FAF8',
    secondary: '#CFD8D3',
    muted: '#9DA9A4',
  },
  border: {
    default: '#688371',
    subtle: '#60766A',
    strong: '#73827B',
  },
  positive: { bg: '#0E4430', fg: '#2CD395' },
  negative: { bg: '#460F0B', fg: '#EB8A84' },
  warning: { bg: '#4D2A04', fg: '#F28D21' },
  critical: { bg: '#460F0B', fg: '#EB8A84' },
  verified: { bg: '#0E4430', fg: '#2CD395' },
  estimated: { bg: '#46330C', fg: '#DA9F25' },
  stale: { bg: '#262C29', fg: '#9DAAA4' },
  pending: { bg: '#0D2345', fg: '#7EA8E7' },
};

export const palettes = { light, dark } as const;
export type ThemeName = keyof typeof palettes;
