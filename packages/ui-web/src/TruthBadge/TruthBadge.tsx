import type { ReactElement } from 'react';
import type { TruthClass } from '@finch/contracts';
import { cls, cx } from '../internal/cx.js';
import styles from './TruthBadge.module.css';

/**
 * Renders a value's truth classification — Constitution §4.2/§4.7: financial truth
 * never depends on an LLM, and this is the UI's one enforcement point for that rule.
 *
 * Deliberately takes the real `TruthClass` union from `@finch/contracts`, not a
 * free-form string: a badge that does not type-check against the taxonomy cannot
 * silently fall out of sync with it.
 *
 * The label is the primary signal (design-tokens §34/§35: never color alone); the
 * class name only changes the tint.
 */
export interface TruthBadgeProps {
  readonly truthClass: TruthClass;
  readonly className?: string;
}

const CLASS_NAME: Record<TruthClass, string> = {
  OBSERVED: cls(styles, 'observed'),
  USER_ASSERTED: cls(styles, 'userAsserted'),
  DERIVED_DETERMINISTIC: cls(styles, 'derivedDeterministic'),
  ESTIMATED: cls(styles, 'estimated'),
  GENERATED_NARRATIVE: cls(styles, 'generatedNarrative'),
};

const LABEL: Record<TruthClass, string> = {
  OBSERVED: 'Verificado',
  USER_ASSERTED: 'Declarado',
  DERIVED_DETERMINISTIC: 'Calculado',
  ESTIMATED: 'Estimado',
  GENERATED_NARRATIVE: 'Generado por IA',
};

export function TruthBadge({ truthClass, className }: TruthBadgeProps): ReactElement {
  return (
    <span className={cx(cls(styles, 'badge'), CLASS_NAME[truthClass], className)} role="status">
      {LABEL[truthClass]}
    </span>
  );
}
