/**
 * Proves the invariant declared in README.md and Constitution §34/§35: every
 * foreground/background pair in both themes meets WCAG contrast — not asserted by eye,
 * computed from the actual exported hex values.
 */
import { describe, it, expect } from 'vitest';
import { light, dark, type SemanticPalette, type StatusTokenPair } from './colors.js';

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(hexToRgb(a));
  const lb = relativeLuminance(hexToRgb(b));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT_MIN = 4.5;
const UI_MIN = 3;

const statusKeys = [
  'positive',
  'negative',
  'warning',
  'critical',
  'verified',
  'estimated',
  'stale',
  'pending',
] as const satisfies readonly (keyof SemanticPalette)[];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s palette contrast', (_themeName, palette: SemanticPalette) => {
  it('surface vs every text tone clears 4.5:1 in both surfaces', () => {
    for (const surface of [palette.surface.base, palette.surface.raised]) {
      for (const text of [palette.text.primary, palette.text.secondary, palette.text.muted]) {
        expect(contrastRatio(surface, text)).toBeGreaterThanOrEqual(TEXT_MIN);
      }
    }
  });

  it('border.strong (the only tier Figma uses as an interactive-component boundary, e.g. the unchecked Checkbox) clears 3:1 (WCAG 1.4.11)', () => {
    expect(contrastRatio(palette.surface.base, palette.border.strong)).toBeGreaterThanOrEqual(
      UI_MIN,
    );
  });

  it.each(statusKeys)('status token "%s" fg clears 4.5:1 against its own bg', (key) => {
    const pair: StatusTokenPair = palette[key];
    expect(contrastRatio(pair.bg, pair.fg)).toBeGreaterThanOrEqual(TEXT_MIN);
  });
});

describe('theme parity', () => {
  it('light and dark declare exactly the same semantic keys', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
    for (const key of statusKeys) {
      expect(Object.keys(dark[key]).sort()).toEqual(Object.keys(light[key]).sort());
    }
  });
});
