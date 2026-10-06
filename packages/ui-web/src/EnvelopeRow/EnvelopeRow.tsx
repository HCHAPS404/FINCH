import type { ReactElement } from 'react';
import { cls, cx } from '../internal/cx.js';
import styles from './EnvelopeRow.module.css';

export type EnvelopeTone = 'ok' | 'warning' | 'full' | 'overspent';

export interface EnvelopeRowProps {
  readonly name: string;
  readonly status: string;
  readonly meta: string;
  /** 0–100. Values above 100 (overspent) are clamped for the bar fill width only. */
  readonly progress: number;
  readonly tone: EnvelopeTone;
}

const STATUS_CLASS: Record<EnvelopeTone, string> = {
  ok: 'statusOk',
  warning: 'statusWarning',
  full: 'statusFull',
  overspent: 'statusOverspent',
};

const FILL_CLASS: Record<EnvelopeTone, string> = {
  ok: 'fillOk',
  warning: 'fillWarning',
  full: 'fillFull',
  overspent: 'fillOverspent',
};

export function EnvelopeRow({
  name,
  status,
  meta,
  progress,
  tone,
}: EnvelopeRowProps): ReactElement {
  const width = Math.max(0, Math.min(100, progress));
  return (
    <div className={cls(styles, 'row')}>
      <div className={cls(styles, 'header')}>
        <span className={cls(styles, 'name')}>{name}</span>
        <span className={cls(styles, STATUS_CLASS[tone])}>{status}</span>
      </div>
      <div
        className={cls(styles, 'track')}
        role="progressbar"
        aria-label={name}
        aria-valuenow={Math.round(width)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cx(cls(styles, 'fill'), cls(styles, FILL_CLASS[tone]))}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={cls(styles, 'meta')}>{meta}</span>
    </div>
  );
}
