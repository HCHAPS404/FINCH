import type { AnchorHTMLAttributes, ReactElement } from 'react';
import type { IconProps } from '../icons/index.js';
import { cls, cx } from '../internal/cx.js';
import styles from './TabItem.module.css';

export interface TabItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly icon: (props: IconProps) => ReactElement;
  readonly label: string;
  readonly active?: boolean;
}

export function TabItem({
  icon: IconComponent,
  label,
  active = false,
  className,
  ...rest
}: TabItemProps): ReactElement {
  return (
    <a
      className={cx(cls(styles, 'item'), active ? cls(styles, 'active') : undefined, className)}
      aria-current={active ? 'page' : undefined}
      {...rest}
    >
      <IconComponent className={cls(styles, 'icon')} />
      {label}
    </a>
  );
}
