import type { ReactElement } from 'react';

export function LabeledDivider({ label }: { readonly label: string }): ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--fc-border-subtle)' }} />
      <span
        style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--fc-text-muted)' }}
      >
        {label}
      </span>
      <hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--fc-border-subtle)' }} />
    </div>
  );
}
