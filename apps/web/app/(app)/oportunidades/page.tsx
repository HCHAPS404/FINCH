'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import { AppShell } from '../_components/AppShell';
import { cls, cx } from '../../_lib/cx';
import styles from './page.module.css';
import { MercadoTab } from './_components/MercadoTab';
import { SuscripcionesTab } from './_components/SuscripcionesTab';
import { AnomaliasTab } from './_components/AnomaliasTab';
import { GastosFijosTab } from './_components/GastosFijosTab';
import { RemesasTab } from './_components/RemesasTab';

const TABS = ['Mercado', 'Suscripciones', 'Anomalías', 'Gastos fijos', 'Remesas'] as const;
type Tab = (typeof TABS)[number];

const TAB_CONTENT: Record<Tab, () => ReactElement> = {
  Mercado: MercadoTab,
  Suscripciones: SuscripcionesTab,
  Anomalías: AnomaliasTab,
  'Gastos fijos': GastosFijosTab,
  Remesas: RemesasTab,
};

export default function OportunidadesPage(): ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('Mercado');
  const ActiveContent = TAB_CONTENT[activeTab];

  return (
    <AppShell heading="Oportunidades" date="Martes, 29 de septiembre">
      <nav className={cls(styles, 'tabs')} aria-label="Secciones de Oportunidades">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
            }}
            className={cx(
              cls(styles, 'tab'),
              tab === activeTab ? cls(styles, 'tabActive') : undefined,
            )}
          >
            {tab}
          </button>
        ))}
      </nav>
      <ActiveContent />
    </AppShell>
  );
}
