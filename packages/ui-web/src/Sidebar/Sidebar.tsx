import type { ReactElement } from 'react';
import { IconSettings } from '../icons/index.js';
import { PRIMARY_NAVIGATION } from '../internal/navigation.js';
import { cls } from '../internal/cx.js';
import { Logo } from '../Logo/Logo.js';
import { NavItem } from '../NavItem/NavItem.js';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  readonly activeHref: string;
}

export function Sidebar({ activeHref }: SidebarProps): ReactElement {
  return (
    <nav className={cls(styles, 'sidebar')} aria-label="Principal">
      <div className={cls(styles, 'brand')}>
        <Logo variant="mark" tone="green" height={28} />
        <Logo variant="wordmark" tone="green" height={16} />
      </div>
      {PRIMARY_NAVIGATION.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={item.href === activeHref}
        />
      ))}
      <div className={cls(styles, 'spacer')} />
      <NavItem
        href="/ajustes"
        icon={IconSettings}
        label="Ajustes"
        active={activeHref === '/ajustes'}
      />
    </nav>
  );
}
