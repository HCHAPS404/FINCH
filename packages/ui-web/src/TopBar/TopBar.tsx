import type { ReactElement } from 'react';
import { IconBell, IconSearch } from '../icons/index.js';
import { cls } from '../internal/cx.js';
import styles from './TopBar.module.css';

export interface TopBarProps {
  readonly date: string;
  readonly heading: string;
  readonly searchPlaceholder?: string;
  readonly onNotifications?: () => void;
}

export function TopBar({
  date,
  heading,
  searchPlaceholder = 'Busca un gasto, sobre o documento',
  onNotifications,
}: TopBarProps): ReactElement {
  return (
    <header className={cls(styles, 'bar')}>
      <div className={cls(styles, 'title')}>
        <span className={cls(styles, 'date')}>{date}</span>
        <h1 className={cls(styles, 'heading')}>{heading}</h1>
      </div>
      <div className={cls(styles, 'spacer')} />
      <label className={cls(styles, 'search')}>
        <IconSearch className={cls(styles, 'icon')} />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className={cls(styles, 'searchInput')}
        />
      </label>
      <button
        type="button"
        className={cls(styles, 'notifications')}
        onClick={onNotifications}
        aria-label="Notificaciones"
      >
        <IconBell className={cls(styles, 'icon')} />
      </button>
    </header>
  );
}
