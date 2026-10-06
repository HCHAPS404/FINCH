import type { ReactElement } from 'react';
import type { Freshness } from '@finch/contracts';
import { IconCheck, IconClock, IconRefresh, IconWifiOff } from '../icons/index.js';
import { cls, cx } from '../internal/cx.js';
import styles from './FreshnessStamp.module.css';

/**
 * How recently a value was confirmed — README §48/§116. Distinct from `TruthBadge`:
 * a value can be OBSERVED (truth class) and still STALE (freshness) if it hasn't been
 * re-confirmed recently. The two badges are meant to be shown together, not as
 * alternatives.
 */
export interface FreshnessStampProps {
  readonly freshness: Freshness;
  readonly className?: string;
}

const ICON: Record<Freshness, typeof IconCheck> = {
  FRESH: IconCheck,
  RECENT: IconClock,
  STALE: IconRefresh,
  UNKNOWN: IconWifiOff,
};

const LABEL: Record<Freshness, string> = {
  FRESH: 'Actualizado',
  RECENT: 'Reciente',
  STALE: 'Desactualizado',
  UNKNOWN: 'Sin conexión',
};

const CLASS_NAME: Record<Freshness, string> = {
  FRESH: 'fresh',
  RECENT: 'recent',
  STALE: 'stale',
  UNKNOWN: 'unknown',
};

export function FreshnessStamp({ freshness, className }: FreshnessStampProps): ReactElement {
  const IconComponent = ICON[freshness];
  return (
    <span
      className={cx(cls(styles, 'stamp'), cls(styles, CLASS_NAME[freshness]), className)}
      role="status"
    >
      <IconComponent className={cls(styles, 'icon')} />
      {LABEL[freshness]}
    </span>
  );
}
