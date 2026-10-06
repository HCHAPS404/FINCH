import type { ReactElement } from 'react';
import { PRIMARY_NAVIGATION } from '../internal/navigation.js';
import { cls } from '../internal/cx.js';
import { TabItem } from '../TabItem/TabItem.js';
import styles from './MobileTabBar.module.css';

export interface MobileTabBarProps {
  readonly activeHref: string;
}

export function MobileTabBar({ activeHref }: MobileTabBarProps): ReactElement {
  return (
    <nav className={cls(styles, 'bar')} aria-label="Principal">
      {PRIMARY_NAVIGATION.map((item) => (
        <TabItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={item.href === activeHref}
        />
      ))}
    </nav>
  );
}
