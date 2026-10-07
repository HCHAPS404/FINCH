'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  TruthBadge,
  StatusChip,
  FreshnessStamp,
  IconTrendUp,
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconReceipt,
  Button,
  IconArrowRight,
} from '@finch/ui-web';
import type { TruthClass } from '@finch/contracts';
import { AppShell } from '../_components/AppShell';
import { cls, cx } from '../../_lib/cx';
import styles from './page.module.css';
import { TarjetasTab } from './_components/TarjetasTab';

const TABS = ['Resumen', 'Sobres', 'Tarjetas', 'Movimientos', 'Patrimonio', 'Ingresos'] as const;

const NET_WORTH_CHART = [
  { month: 'abr', height: 55 },
  { month: 'may', height: 62 },
  { month: 'jun', height: 58 },
  { month: 'jul', height: 70 },
  { month: 'ago', height: 78 },
  { month: 'sep', height: 100 },
];

const HEALTH_ROWS = [
  { label: 'Colchón de emergencia', tone: 'warning' as const, value: '2,1 meses' },
  { label: 'Deuda sobre ingreso', tone: 'positive' as const, value: '34 %' },
  { label: 'Ahorro mensual', tone: 'positive' as const, value: '10 %' },
  { label: 'Pagos a tiempo', tone: 'positive' as const, value: '12 de 12' },
];

interface TransactionRow {
  readonly date: string;
  readonly description: string;
  readonly category: string;
  readonly truthClass: TruthClass;
  readonly amount: string;
  readonly positive?: boolean;
}

const TRANSACTIONS: readonly TransactionRow[] = [
  {
    date: '28 sep',
    description: 'Nómina · Empresa Andina SAS',
    category: 'Ingreso',
    truthClass: 'USER_ASSERTED',
    amount: '+$2.400.000',
    positive: true,
  },
  {
    date: '27 sep',
    description: 'Éxito Calle 80',
    category: 'Mercado',
    truthClass: 'OBSERVED',
    amount: '−$186.400',
  },
  {
    date: '27 sep',
    description: 'STREAMPLUS',
    category: 'Suscripciones',
    truthClass: 'ESTIMATED',
    amount: '−$49.900',
  },
  {
    date: '26 sep',
    description: 'Uber',
    category: 'Transporte',
    truthClass: 'OBSERVED',
    amount: '−$23.700',
  },
  {
    date: '25 sep',
    description: 'Farmacia Cruz Verde',
    category: 'Salud',
    truthClass: 'OBSERVED',
    amount: '−$64.300',
  },
  {
    date: '24 sep',
    description: 'Transferencia a Ahorro Viaje',
    category: 'Meta',
    truthClass: 'DERIVED_DETERMINISTIC',
    amount: '−$300.000',
  },
  {
    date: '23 sep',
    description: 'Restaurante Árbol',
    category: 'Salidas',
    truthClass: 'GENERATED_NARRATIVE',
    amount: '−$112.000',
  },
];

export default function DineroPage(): ReactElement {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Resumen');

  return (
    <AppShell heading="Dinero" date="Martes, 29 de septiembre">
      <nav className={cls(styles, 'tabs')} aria-label="Secciones de Dinero">
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

      {activeTab === 'Tarjetas' ? <TarjetasTab /> : null}

      {activeTab !== 'Tarjetas' ? (
        <>
          <div className={cls(styles, 'summary')}>
            <section className={cls(styles, 'card')}>
              <div className={cls(styles, 'cardHeader')}>
                <h2 className={cls(styles, 'cardTitle')}>Patrimonio neto</h2>
                <TruthBadge truthClass="DERIVED_DETERMINISTIC" />
              </div>
              <p className={cls(styles, 'netWorthAmount')}>$18.742.300</p>
              <p className={cls(styles, 'netWorthChange')}>
                <IconTrendUp size={16} />
                +$1.120.000 en 6 meses
              </p>
              <div className={cls(styles, 'chart')}>
                {NET_WORTH_CHART.map((bar) => (
                  <div key={bar.month} className={cls(styles, 'chartBarWrap')}>
                    <div className={cls(styles, 'chartBar')} style={{ height: `${bar.height}%` }} />
                    <span className={cls(styles, 'chartLabel')}>{bar.month}</span>
                  </div>
                ))}
              </div>
              <p className={cls(styles, 'chartFooter')}>Activos $24.910.000 · Deudas $6.167.700</p>
            </section>

            <section className={cls(styles, 'card')}>
              <h2 className={cls(styles, 'cardTitle')}>Salud financiera</h2>
              <div className={cls(styles, 'healthScore')}>
                <span className={cls(styles, 'healthScoreValue')}>72</span>
                <span className={cls(styles, 'healthScoreSuffix')}>/ 100 · Buena</span>
              </div>
              {HEALTH_ROWS.map((row) => (
                <div key={row.label} className={cls(styles, 'healthRow')}>
                  {row.label}
                  <StatusChip tone={row.tone}>{row.value}</StatusChip>
                </div>
              ))}
              <div className={cls(styles, 'healthExplainer')}>
                <IconReceipt size={14} />
                Cómo se calcula · health.score@1
              </div>
            </section>
          </div>

          <section className={cls(styles, 'card')}>
            <div className={cls(styles, 'transactionsHeader')}>
              <h2 className={cls(styles, 'transactionsTitle')}>Movimientos</h2>
              <span className={cls(styles, 'pill')}>
                <IconSearch size={14} />
                Buscar
              </span>
              <span className={cls(styles, 'pill')}>
                <IconFilter size={14} />
                Septiembre
                <IconChevronDown size={14} />
              </span>
              <Button variant="secondary">
                Importar
                <IconArrowRight size={16} />
              </Button>
              <Button variant="secondary">
                Foto de recibo
                <IconArrowRight size={16} />
              </Button>
            </div>

            <table className={cls(styles, 'table')}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Origen</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((row) => (
                  <tr key={`${row.date}-${row.description}`}>
                    <td>{row.date}</td>
                    <td>{row.description}</td>
                    <td>{row.category}</td>
                    <td>
                      <TruthBadge truthClass={row.truthClass} />
                    </td>
                    <td className={cls(styles, row.positive ? 'amountPositive' : 'amountNegative')}>
                      {row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={cls(styles, 'tableFooter')}>
              <span>Mostrando 7 de 64 · Ver más</span>
              <FreshnessStamp freshness="RECENT" />
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
