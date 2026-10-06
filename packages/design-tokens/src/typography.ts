/**
 * Type scale — README §34.
 *
 * Read from text nodes on the FINCH Figma file's "02 · Components" page (file key
 * aA7KzO0a2hg4cJY3zhDzkS) on 2026-10-06. These are exactly the (family, weight, size,
 * line-height) combinations already used by built components — no sizes were added
 * beyond what Figma actually uses.
 */

export interface TypeStyle {
  readonly fontFamily: string;
  readonly fontWeight: 400 | 500 | 600;
  readonly fontSize: number;
  readonly lineHeight: number;
}

const fontFamily = 'Inter';

export const typography = {
  caption: { fontFamily, fontWeight: 400, fontSize: 12, lineHeight: 16 },
  captionMedium: { fontFamily, fontWeight: 500, fontSize: 12, lineHeight: 16 },
  body: { fontFamily, fontWeight: 400, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily, fontWeight: 500, fontSize: 14, lineHeight: 20 },
  bodyLarge: { fontFamily, fontWeight: 400, fontSize: 16, lineHeight: 24 },
  bodyLargeMedium: { fontFamily, fontWeight: 500, fontSize: 16, lineHeight: 24 },
  headingSmall: { fontFamily, fontWeight: 600, fontSize: 18, lineHeight: 26 },
  headingLarge: { fontFamily, fontWeight: 600, fontSize: 24, lineHeight: 32 },
} as const satisfies Record<string, TypeStyle>;

export type TypographyToken = keyof typeof typography;
