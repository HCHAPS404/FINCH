import type { ReactElement } from 'react';
import { Button, IconReceipt } from '@finch/ui-web';
import { cls } from '../../../_lib/cx';
import styles from '../page.module.css';

const COMPARISONS = [
  {
    category: 'Plan celular',
    current: { name: 'Claro Postpago 10GB', price: '$62.900/mes' },
    best: { name: 'WOM Postpago 12GB', price: '$42.900/mes' },
    savings: 'Ahorras $240.000/año · misma cobertura 4G, sin permanencia',
  },
  {
    category: 'Internet hogar',
    current: { name: 'Claro Hogar 100MB', price: '$89.900/mes' },
    best: { name: 'ETB Fibra 150MB', price: '$79.900/mes' },
    savings: 'Ahorras $120.000/año · más velocidad por menos',
  },
  {
    category: 'Streaming',
    current: { name: 'STREAMPLUS Premium', price: '$49.900/mes' },
    best: { name: 'STREAMPLUS Estándar', price: '$32.900/mes' },
    savings: 'Ahorras $204.000/año · pierdes solo 4K en 2 pantallas',
  },
  {
    category: 'Gimnasio',
    current: { name: 'BodyTech Full', price: '$139.900/mes' },
    best: { name: 'BodyTech Off-Peak', price: '$89.900/mes' },
    savings: 'Ahorras $600.000/año · mismo gimnasio, fuera de hora pico',
  },
];

export function GastosFijosTab(): ReactElement {
  return (
    <div className={cls(styles, 'stack')}>
      <div className={cls(styles, 'grid2')}>
        {COMPARISONS.map((item) => (
          <section key={item.category} className={cls(styles, 'compareCard')}>
            <div className={cls(styles, 'compareHeader')}>
              <span className={cls(styles, 'cardTitle')}>{item.category}</span>
            </div>
            <div className={cls(styles, 'compareRow')}>
              <span className={cls(styles, 'compareLabel')}>Tienes</span>
              <span className={cls(styles, 'compareCurrent')}>
                {item.current.name} · {item.current.price}
              </span>
            </div>
            <div className={cls(styles, 'compareRow')}>
              <span className={cls(styles, 'compareLabel')}>Mejor opción</span>
              <span className={cls(styles, 'compareBest')}>
                {item.best.name} · {item.best.price}
              </span>
            </div>
            <p className={cls(styles, 'compareSavings')}>{item.savings}</p>
            <div style={{ marginTop: 12 }}>
              <Button variant="secondary" size="medium">
                Preparar solicitud de cambio
              </Button>
            </div>
          </section>
        ))}
      </div>
      <div className={cls(styles, 'sourceLine')}>
        <IconReceipt size={14} />
        Comparado contra tarifas públicas el 29 sep 2026 · market.search_plans@1
      </div>
    </div>
  );
}
