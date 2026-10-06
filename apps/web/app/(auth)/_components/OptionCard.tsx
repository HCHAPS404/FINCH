import type { ComponentType, ReactElement } from 'react';
import type { IconProps } from '@finch/ui-web';
import { cls, cx } from '../../_lib/cx';
import styles from './OptionCard.module.css';

export interface OptionCardProps {
  readonly icon: ComponentType<IconProps>;
  readonly title: string;
  readonly subtitle: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
}

export function OptionCard({
  icon: IconComponent,
  title,
  subtitle,
  selected,
  onToggle,
}: OptionCardProps): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cx(cls(styles, 'card'), selected ? cls(styles, 'selected') : undefined)}
    >
      <span className={cls(styles, 'iconBadge')}>
        <IconComponent size={18} />
      </span>
      <span className={cls(styles, 'title')}>{title}</span>
      <span className={cls(styles, 'subtitle')}>{subtitle}</span>
    </button>
  );
}
