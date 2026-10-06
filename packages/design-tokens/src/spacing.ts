/**
 * Spacing and radius scales — README §34.
 *
 * Read from `itemSpacing` and `cornerRadius` properties actually used on the FINCH
 * Figma file's "02 · Components" page (file key aA7KzO0a2hg4cJY3zhDzkS) on 2026-10-06.
 * Keyed by pixel value rather than a t-shirt-size name: Figma did not use a named scale,
 * and inventing one here would misrepresent what was actually designed.
 */

export const spacing = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
} as const;

export type SpacingToken = keyof typeof spacing;

export const radius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  /** Pill / fully-rounded — TruthBadge, StatusChip (Accent), Toggle track. */
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;
