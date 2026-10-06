import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TRUTH_CLASSES } from '@finch/contracts';
import { TruthBadge } from './TruthBadge.js';

describe('TruthBadge', () => {
  it.each(TRUTH_CLASSES)(
    'renders a distinct, non-empty text label for %s (never color alone)',
    (truthClass) => {
      render(<TruthBadge truthClass={truthClass} />);
      const badge = screen.getByRole('status');
      expect(badge.textContent?.trim().length).toBeGreaterThan(0);
    },
  );

  it('gives every truth class its own label text', () => {
    const labels = TRUTH_CLASSES.map((truthClass) => {
      const { unmount } = render(<TruthBadge truthClass={truthClass} />);
      const text = screen.getByRole('status').textContent;
      unmount();
      return text;
    });
    expect(new Set(labels).size).toBe(TRUTH_CLASSES.length);
  });
});
