import type { ReactElement } from 'react';
import type { IconProps } from '../icons/index.js';
import { IconHome, IconWallet, IconSparkles, IconTarget, IconUser } from '../icons/index.js';

/**
 * The five primary destinations — Figma `Sidebar` / `MobileTabBar`, and the product
 * spec's navigation model (Hoy, Dinero, FINCH, Oportunidades, Yo).
 */
export interface NavDestination {
  readonly href: string;
  readonly label: string;
  readonly icon: (props: IconProps) => ReactElement;
}

export const PRIMARY_NAVIGATION: readonly NavDestination[] = [
  { href: '/hoy', label: 'Hoy', icon: IconHome },
  { href: '/dinero', label: 'Dinero', icon: IconWallet },
  { href: '/finch', label: 'FINCH', icon: IconSparkles },
  { href: '/oportunidades', label: 'Oportunidades', icon: IconTarget },
  { href: '/yo', label: 'Yo', icon: IconUser },
];
