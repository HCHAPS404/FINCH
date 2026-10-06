import type { ReactElement } from 'react';

export interface FormHeadingProps {
  readonly title: string;
  readonly subtitle: string;
}

export function FormHeading({ title, subtitle }: FormHeadingProps): ReactElement {
  return (
    <div>
      <h2
        style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 24,
          color: 'var(--fc-text-primary)',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: '4px 0 0',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: 'var(--fc-text-secondary)',
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
