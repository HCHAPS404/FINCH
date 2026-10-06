import type { ReactElement } from 'react';
import Link from 'next/link';
import { IconArrowLeft } from '@finch/ui-web';
import { cls } from '../../../_lib/cx';
import styles from './shared.module.css';

export function SubPageHeader({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}): ReactElement {
  return (
    <div style={{ marginBottom: 20 }}>
      <Link href="/yo" className={cls(styles, 'backLink')}>
        <IconArrowLeft size={16} />
        Yo
      </Link>
      <h1
        style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 22,
          color: 'var(--fc-text-primary)',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          margin: '4px 0 0',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: 'var(--fc-text-secondary)',
        }}
      >
        {description}
      </p>
    </div>
  );
}
