import type { ComponentType, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { Logo, type IconProps } from '@finch/ui-web';
import { cls } from '../../_lib/cx';
import styles from './AuthCardLayout.module.css';

export interface AuthCardLayoutProps {
  readonly icon: ComponentType<IconProps>;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}

export function AuthCardLayout({
  icon: IconComponent,
  title,
  description,
  children,
}: AuthCardLayoutProps): ReactElement {
  return (
    <div className={cls(styles, 'page')}>
      <header className={cls(styles, 'header')}>
        <div className={cls(styles, 'brand')}>
          <Logo variant="mark" tone="green" height={24} />
          <Logo variant="wordmark" tone="green" height={14} />
        </div>
        <Link href="/soporte" className={cls(styles, 'help')}>
          ¿Necesitas ayuda?
        </Link>
      </header>
      <main className={cls(styles, 'body')}>
        <div className={cls(styles, 'card')}>
          <span className={cls(styles, 'iconBadge')}>
            <IconComponent size={22} />
          </span>
          <h1 className={cls(styles, 'title')}>{title}</h1>
          <p className={cls(styles, 'description')}>{description}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
