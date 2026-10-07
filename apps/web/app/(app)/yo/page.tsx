import type { ComponentType, ReactElement } from 'react';
import Link from 'next/link';
import {
  type IconProps,
  IconTarget,
  IconUsers,
  IconShield,
  IconLock,
  IconSun,
  IconFile,
  IconReceipt,
  IconChart,
  IconEye,
  IconBell,
  IconSettings,
  IconUser,
} from '@finch/ui-web';
import { AppShell } from '../_components/AppShell';
import { cls } from '../../_lib/cx';
import styles from './page.module.css';

interface Tile {
  readonly href: string;
  readonly icon: ComponentType<IconProps>;
  readonly title: string;
  readonly description: string;
}

const TILES: readonly Tile[] = [
  {
    href: '/yo/perfil',
    icon: IconUser,
    title: 'Mi perfil',
    description: 'Tus datos personales: nombre, teléfono y fecha de nacimiento.',
  },
  {
    href: '/yo/metas',
    icon: IconTarget,
    title: 'Metas',
    description: 'Factibilidad, aporte mensual y qué le cuesta a cada una.',
  },
  {
    href: '/yo/hogar',
    icon: IconUsers,
    title: 'Hogar compartido',
    description: 'Divide gastos, liquida quién le debe a quién.',
  },
  {
    href: '/yo/proteccion',
    icon: IconShield,
    title: 'Radar de protección',
    description: 'Colchón de emergencia, dependientes y coberturas.',
  },
  {
    href: '/yo/boveda',
    icon: IconLock,
    title: 'Bóveda',
    description: 'Pólizas, contratos y documentos con vencimientos.',
  },
  {
    href: '/yo/habitos',
    icon: IconSun,
    title: 'Hábitos',
    description: 'Retos que eliges tú, con progreso en pesos reales.',
  },
  {
    href: '/yo/pasaporte',
    icon: IconFile,
    title: 'Pasaporte financiero',
    description: 'Demuestra solidez sin mostrar tus movimientos.',
  },
  {
    href: '/yo/casos',
    icon: IconReceipt,
    title: 'Mis casos',
    description: 'Copiloto de derechos: reclamos con ruta y plazos.',
  },
  {
    href: '/yo/impuestos',
    icon: IconChart,
    title: 'Impuestos',
    description: 'Si declaras, calendario DIAN y estimador de renta.',
  },
  {
    href: '/yo/lo-que-sabe',
    icon: IconEye,
    title: 'Lo que FINCH sabe de ti',
    description: 'Memoria controlable — revisa y olvida lo que quieras.',
  },
  {
    href: '/yo/vigia',
    icon: IconBell,
    title: 'Vigía',
    description: 'El repaso diario que corre por ti a las 6 a. m.',
  },
  {
    href: '/yo/ajustes',
    icon: IconSettings,
    title: 'Canales y ajustes',
    description: 'Bandeja, correo privado, calendario y notificaciones.',
  },
];

export default function YoPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <div className={cls(styles, 'grid')}>
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href} className={cls(styles, 'tile')}>
            <span className={cls(styles, 'tileIcon')}>
              <tile.icon size={20} />
            </span>
            <span className={cls(styles, 'tileTitle')}>{tile.title}</span>
            <span className={cls(styles, 'tileDescription')}>{tile.description}</span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
