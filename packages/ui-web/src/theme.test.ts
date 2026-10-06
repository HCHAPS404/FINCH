/**
 * Proves theme.css has not drifted from @finch/design-tokens — the CSS file is a
 * hand-authored mirror (no build step generates it), so this is the only thing
 * stopping the two from silently diverging.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { light, dark } from '@finch/design-tokens';

// Not resolved via `import.meta.url`: under vitest's jsdom environment, Vite rewrites
// `import.meta.url` to `self.location`, which is not a file: URL and breaks
// `fileURLToPath`. `process.cwd()` is this package's root when vitest runs via
// `pnpm --filter`, which is the only way this test is run.
const css = readFileSync(join(process.cwd(), 'src/theme.css'), 'utf-8');

describe('theme.css matches @finch/design-tokens', () => {
  it(':root (light) block matches the light palette', () => {
    const root = css.split("[data-theme='dark']")[0]!;
    const vars: Record<string, string> = {
      'surface-base': light.surface.base,
      'surface-raised': light.surface.raised,
      'text-primary': light.text.primary,
      'text-secondary': light.text.secondary,
      'text-muted': light.text.muted,
      'border-default': light.border.default,
      'border-subtle': light.border.subtle,
      'border-strong': light.border.strong,
    };
    for (const key of [
      'positive',
      'negative',
      'warning',
      'critical',
      'verified',
      'estimated',
      'stale',
      'pending',
    ] as const) {
      vars[`${key}-bg`] = light[key].bg;
      vars[`${key}-fg`] = light[key].fg;
    }
    for (const [name, expected] of Object.entries(vars)) {
      const match = new RegExp(`--fc-${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(root);
      expect(match, `--fc-${name} present in :root`).not.toBeNull();
      expect(match![1]!.toUpperCase()).toBe(expected.toUpperCase());
    }
  });

  it("[data-theme='dark'] block matches the dark palette", () => {
    const darkBlock = css.split("[data-theme='dark']")[1]!;
    const vars: Record<string, string> = {
      'surface-base': dark.surface.base,
      'surface-raised': dark.surface.raised,
      'text-primary': dark.text.primary,
      'text-secondary': dark.text.secondary,
      'text-muted': dark.text.muted,
      'border-default': dark.border.default,
      'border-subtle': dark.border.subtle,
      'border-strong': dark.border.strong,
    };
    for (const key of [
      'positive',
      'negative',
      'warning',
      'critical',
      'verified',
      'estimated',
      'stale',
      'pending',
    ] as const) {
      vars[`${key}-bg`] = dark[key].bg;
      vars[`${key}-fg`] = dark[key].fg;
    }
    for (const [name, expected] of Object.entries(vars)) {
      const match = new RegExp(`--fc-${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(darkBlock);
      expect(match, `--fc-${name} present in [data-theme='dark']`).not.toBeNull();
      expect(match![1]!.toUpperCase()).toBe(expected.toUpperCase());
    }
  });
});
