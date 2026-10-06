'use client';

import type { ReactElement, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, TopBar, MobileHeader, MobileTabBar } from '@finch/ui-web';
import { cls } from '../../_lib/cx';
import styles from './AppShell.module.css';

export interface AppShellProps {
  readonly heading: string;
  readonly date: string;
  readonly children: ReactNode;
}

export function AppShell({ heading, date, children }: AppShellProps): ReactElement {
  const pathname = usePathname();

  return (
    <div className={cls(styles, 'shell')}>
      <div className={cls(styles, 'sidebar')}>
        <Sidebar activeHref={pathname} />
      </div>
      <div className={cls(styles, 'main')}>
        <div className={cls(styles, 'topBar')} style={{ width: '100%' }}>
          <TopBar date={date} heading={heading} />
        </div>
        <div className={cls(styles, 'mobileHeader')} style={{ width: '100%' }}>
          <MobileHeader heading={heading} />
        </div>
        <div className={cls(styles, 'content')}>{children}</div>
        <div className={cls(styles, 'mobileTabBar')} style={{ marginTop: 'auto' }}>
          <MobileTabBar activeHref={pathname} />
        </div>
      </div>
    </div>
  );
}
