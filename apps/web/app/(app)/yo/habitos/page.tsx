import type { ReactElement } from 'react';
import { Button, StatusChip, IconCheck } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const HABITS = [
  {
    name: '7 días sin domicilios',
    meta: 'Día 5 de 7 · llevas ahorrados $84.000',
    tone: 'positive' as const,
    label: 'En curso',
  },
  {
    name: 'Redondeo al ahorro',
    meta: 'Activo desde agosto · $62.300 acumulados',
    tone: 'positive' as const,
    label: 'Activo',
  },
  {
    name: 'No usar la Visa Oro este mes',
    meta: '12 de 29 días sin usarla',
    tone: 'info' as const,
    label: 'En curso',
  },
];

export default function HabitosPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Hábitos"
        description="Retos que eliges tú, con progreso en pesos reales. Sin gamificación infantil."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          <div className={cls(styles, 'cardHeader')}>
            <h2 className={cls(styles, 'cardTitle')}>Retos activos</h2>
            <Button variant="secondary" size="medium">
              Elegir un nuevo reto
            </Button>
          </div>
          {HABITS.map((habit) => (
            <div key={habit.name} className={cls(styles, 'row')}>
              <span className={cls(styles, 'rowIcon')}>
                <IconCheck size={18} />
              </span>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{habit.name}</p>
                <p className={cls(styles, 'rowMeta')}>{habit.meta}</p>
              </div>
              <StatusChip tone={habit.tone}>{habit.label}</StatusChip>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
