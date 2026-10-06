import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@finch/ui-web';
import { cls, cx } from '../../_lib/cx';
import styles from './OnboardingLayout.module.css';

export interface OnboardingLayoutProps {
  readonly step: number;
  readonly stepCount: number;
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
  readonly footer: ReactNode;
}

export function OnboardingLayout({
  step,
  stepCount,
  title,
  subtitle,
  children,
  footer,
}: OnboardingLayoutProps): ReactElement {
  return (
    <div className={cls(styles, 'page')}>
      <header className={cls(styles, 'header')}>
        <div className={cls(styles, 'brand')}>
          <Logo variant="mark" tone="green" height={24} />
          <Logo variant="wordmark" tone="green" height={14} />
        </div>
        <Link href="/soporte" className={cls(styles, 'help')}>
          ¿Necesitas ayuda?
        </Link>
      </header>
      <main className={cls(styles, 'body')}>
        <div className={cls(styles, 'content')}>
          <div className={cls(styles, 'progress')}>
            {Array.from({ length: stepCount }, (_, index) => (
              <span
                key={index}
                className={cx(
                  cls(styles, 'progressSegment'),
                  index < step ? cls(styles, 'progressSegmentActive') : undefined,
                )}
              />
            ))}
          </div>
          <span className={cls(styles, 'step')}>
            {step} de {stepCount}
          </span>
          <h1 className={cls(styles, 'title')}>{title}</h1>
          <p className={cls(styles, 'subtitle')}>{subtitle}</p>
          <div className={cls(styles, 'grid')}>{children}</div>
          <div className={cls(styles, 'footer')}>{footer}</div>
        </div>
      </main>
    </div>
  );
}
