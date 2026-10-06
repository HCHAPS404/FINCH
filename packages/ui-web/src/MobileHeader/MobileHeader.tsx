import type { ReactElement } from 'react';
import { IconBell, IconSearch } from '../icons/index.js';
import { cls } from '../internal/cx.js';
import { Logo } from '../Logo/Logo.js';
import styles from './MobileHeader.module.css';

export interface MobileHeaderProps {
  readonly heading: string;
  readonly onSearch?: () => void;
  readonly onNotifications?: () => void;
}

export function MobileHeader({
  heading,
  onSearch,
  onNotifications,
}: MobileHeaderProps): ReactElement {
  return (
    <header className={cls(styles, 'header')}>
      <Logo variant="mark" tone="green" height={24} />
      <h1 className={cls(styles, 'heading')}>{heading}</h1>
      <button
        type="button"
        className={cls(styles, 'action')}
        onClick={onSearch}
        aria-label="Buscar"
      >
        <IconSearch className={cls(styles, 'icon')} />
      </button>
      <button
        type="button"
        className={cls(styles, 'action')}
        onClick={onNotifications}
        aria-label="Notificaciones"
      >
        <IconBell className={cls(styles, 'icon')} />
      </button>
    </header>
  );
}
