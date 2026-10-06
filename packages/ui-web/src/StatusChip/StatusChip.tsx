import type { ReactElement, ReactNode } from 'react';
import { cls, cx } from '../internal/cx.js';
import styles from './StatusChip.module.css';

export type StatusTone = 'positive' | 'negative' | 'warning' | 'info' | 'accent';

export interface StatusChipProps {
  readonly tone: StatusTone;
  readonly children: ReactNode;
  readonly className?: string;
}

export function StatusChip({ tone, children, className }: StatusChipProps): ReactElement {
  return (
    <span className={cx(cls(styles, 'chip'), cls(styles, tone), className)} role="status">
      {children}
    </span>
  );
}
