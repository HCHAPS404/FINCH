import type { ReactElement, ReactNode } from 'react';
import { cls, cx } from '../internal/cx.js';
import styles from './Banner.module.css';

export type BannerTone = 'positive' | 'negative' | 'warning' | 'info';

export interface BannerProps {
  readonly tone: BannerTone;
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Banner({ tone, title, children, className }: BannerProps): ReactElement {
  return (
    <div className={cx(cls(styles, 'banner'), cls(styles, tone), className)} role="status">
      <p className={cls(styles, 'title')}>{title}</p>
      <p className={cls(styles, 'body')}>{children}</p>
    </div>
  );
}
