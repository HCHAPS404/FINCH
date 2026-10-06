import type { ReactElement } from 'react';
import { StatusChip, Banner, Button, IconArrowRight } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const GOALS = [
  {
    name: 'Viaje a Cartagena',
    target: '$2.400.000',
    date: 'Diciembre 2026',
    progress: 62,
    monthly: '$300.000/mes',
    probability: { tone: 'positive' as const, label: 'Probabilidad alta' },
  },
  {
    name: 'Cuota inicial apartamento',
    target: '$18.000.000',
    date: 'Junio 2028',
    progress: 24,
    monthly: '$650.000/mes',
    probability: { tone: 'warning' as const, label: 'Probabilidad media' },
  },
  {
    name: 'Fondo de emergencia',
    target: '$7.200.000',
    date: 'Sin fecha límite',
    progress: 41,
    monthly: '$200.000/mes',
    probability: { tone: 'positive' as const, label: 'Probabilidad alta' },
  },
];

export default function MetasPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Metas"
        description="Factibilidad bajo un escenario conservador, aporte mensual y qué le cuesta a cada una."
      />

      <div className={cls(styles, 'stack')}>
        <Banner tone="warning" title="Adelantar el viaje atrasa la cuota inicial">
          Si subes el aporte del viaje a $450.000/mes para llegar en octubre, la cuota inicial del
          apartamento se atrasa 4 meses.
        </Banner>

        {GOALS.map((goal) => (
          <section key={goal.name} className={cls(styles, 'card')}>
            <div className={cls(styles, 'cardHeader')}>
              <div>
                <h2 className={cls(styles, 'cardTitle')}>{goal.name}</h2>
                <p className={cls(styles, 'cardSubtitle')}>
                  {goal.target} · {goal.date}
                </p>
              </div>
              <StatusChip tone={goal.probability.tone}>{goal.probability.label}</StatusChip>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: 'var(--fc-border-default)',
                overflow: 'hidden',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: `${goal.progress}%`,
                  height: '100%',
                  background: 'var(--fc-positive-fg)',
                  borderRadius: 999,
                }}
              />
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: 'var(--fc-text-secondary)',
              }}
            >
              {goal.progress}% completado · aportando {goal.monthly}
            </p>
          </section>
        ))}

        <Button style={{ alignSelf: 'flex-start' }}>
          Crear nueva meta
          <IconArrowRight size={18} />
        </Button>
      </div>
    </AppShell>
  );
}
