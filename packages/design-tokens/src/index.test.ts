import { describe, expect, it } from 'vitest';
import {
  color,
  contrastRatio,
  cssVarName,
  primitives,
  renderCss,
  resolve,
  semanticSource,
  themes,
  type ThemeName,
} from './index.js';

const THEMES: readonly ThemeName[] = ['light', 'dark'];
const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

const SURFACES = [
  'color.surface.canvas',
  'color.surface.default',
  'color.surface.raised',
  'color.surface.sunken',
];
const TEXTS = [
  'color.text.primary',
  'color.text.secondary',
  'color.text.tertiary',
  'color.text.link',
];
const PAIRS: readonly [fg: string, bg: string][] = [
  ['color.text.onBrand', 'color.surface.brand'],
  ['color.text.inverse', 'color.surface.inverse'],
  ['color.action.primaryText', 'color.action.primary'],
  ['color.action.primaryText', 'color.action.primaryHover'],
  ['color.action.secondaryText', 'color.action.secondary'],
  ['color.action.secondaryText', 'color.action.secondaryHover'],
  ...['positive', 'negative', 'warning', 'info'].map(
    (k) => [`color.feedback.${k}Fg`, `color.feedback.${k}Bg`] as [string, string],
  ),
  ...['verified', 'declared', 'calculated', 'estimated', 'stale'].map(
    (k) => [`color.truth.${k}Fg`, `color.truth.${k}Bg`] as [string, string],
  ),
];

describe('design tokens — structure', () => {
  it('light and dark themes define exactly the same token names', () => {
    expect([...themes.dark.keys()].sort()).toEqual([...themes.light.keys()].sort());
  });

  it('semantic layers contain only aliases, never raw values', () => {
    for (const theme of THEMES) {
      for (const [path, value] of semanticSource[theme]) {
        expect(value, `${theme}:${path}`).toMatch(/^\{[^}]+\}$/);
      }
    }
  });

  it('every alias resolves to a concrete #RRGGBB color', () => {
    for (const theme of THEMES) {
      for (const [path, value] of themes[theme]) {
        expect(value, `${theme}:${path}`).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('rejects unknown aliases instead of passing them through', () => {
    expect(() => resolve('{color.green.9999}')).toThrow(/Unknown token alias/);
  });

  it('keeps the brand greens sampled from the logo', () => {
    expect(primitives.get('color.green.900')).toBe('#0E4331');
    expect(primitives.get('color.green.950')).toBe('#053F2B');
  });
});

describe('design tokens — WCAG 2.2 AA contrast', () => {
  for (const theme of THEMES) {
    for (const surface of SURFACES) {
      for (const text of TEXTS) {
        it(`${theme}: ${text} on ${surface} ≥ ${AA_TEXT}:1`, () => {
          expect(contrastRatio(color(theme, text), color(theme, surface))).toBeGreaterThanOrEqual(
            AA_TEXT,
          );
        });
      }
      it(`${theme}: focus ring and strong border on ${surface} ≥ ${AA_NON_TEXT}:1`, () => {
        expect(
          contrastRatio(color(theme, 'color.border.focus'), color(theme, surface)),
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
        expect(
          contrastRatio(color(theme, 'color.border.strong'), color(theme, surface)),
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }
    for (const [fg, bg] of PAIRS) {
      it(`${theme}: ${fg} on ${bg} ≥ ${AA_TEXT}:1`, () => {
        expect(contrastRatio(color(theme, fg), color(theme, bg))).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
  }

  it('computes the reference ratios correctly', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });
});

describe('design tokens — CSS output', () => {
  it('names variables in kebab case under the finch prefix', () => {
    expect(cssVarName('color.text.onBrand')).toBe('--finch-color-text-on-brand');
    expect(cssVarName('motion.duration.base')).toBe('--finch-motion-duration-base');
  });

  it('renders light by default, dark by media query and by explicit override', () => {
    const css = renderCss();
    expect(css).toContain(
      `--finch-color-surface-default: ${color('light', 'color.surface.default')};`,
    );
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain("[data-theme='dark']");
    expect(css).toContain('--finch-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);');
    expect(css).toContain('--finch-font-family-sans: Geist, system-ui');
  });
});
