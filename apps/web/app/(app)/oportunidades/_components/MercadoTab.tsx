import type { ReactElement } from 'react';
import { TruthBadge, IconReceipt } from '@finch/ui-web';
import { cls } from '../../../_lib/cx';
import styles from '../page.module.css';

const CDTS = [
  {
    name: 'Banco Falabella · CDT 360 días',
    meta: 'Tasa E.A. 12,4 % · liquidez al vencimiento',
    value: '+$118.400/año por $1.000.000',
  },
  {
    name: 'Banco Pichincha · CDT 180 días',
    meta: 'Tasa E.A. 11,8 % · Fogafín hasta $50M',
    value: '+$109.200/año por $1.000.000',
  },
  {
    name: 'Coltefinanciera · CDT 360 días',
    meta: 'Tasa E.A. 11,5 % · liquidez al vencimiento',
    value: '+$105.900/año por $1.000.000',
  },
];

const REFINANCE = [
  {
    name: 'Banco de Bogotá · Compra de cartera',
    meta: 'Consolida Visa Oro + Mastercard a 24 meses',
    value: 'Ahorras $486.000',
  },
  {
    name: 'Bancolombia · Compra de cartera',
    meta: 'Consolida Visa Oro + Mastercard a 24 meses',
    value: 'Ahorras $412.300',
  },
  {
    name: 'Scotiabank Colpatria · Compra de cartera',
    meta: 'Consolida solo Visa Oro a 18 meses',
    value: 'Ahorras $298.500',
  },
];

export function MercadoTab(): ReactElement {
  return (
    <div className={cls(styles, 'grid2')}>
      <section className={cls(styles, 'card')}>
        <div className={cls(styles, 'cardHeader')}>
          <div>
            <h2 className={cls(styles, 'cardTitle')}>Mejores CDTs para ti</h2>
            <p className={cls(styles, 'cardSubtitle')}>
              Rentabilidad neta: después de retención en la fuente e inflación.
            </p>
          </div>
          <TruthBadge truthClass="ESTIMATED" />
        </div>
        <div className={cls(styles, 'stack')}>
          {CDTS.map((item, index) => (
            <div key={item.name} className={cls(styles, 'rankRow')}>
              <span className={cls(styles, 'rankBadge')}>{index + 1}</span>
              <div className={cls(styles, 'rankBody')}>
                <p className={cls(styles, 'rankName')}>{item.name}</p>
                <p className={cls(styles, 'rankMeta')}>{item.meta}</p>
              </div>
              <span className={cls(styles, 'rankValue')}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className={cls(styles, 'sourceLine')}>
          <IconReceipt size={14} />
          Fuente: tasas publicadas 29 sep 2026 · market.search_deposits@1
        </div>
      </section>

      <section className={cls(styles, 'card')}>
        <div className={cls(styles, 'cardHeader')}>
          <div>
            <h2 className={cls(styles, 'cardTitle')}>Compra de cartera</h2>
            <p className={cls(styles, 'cardSubtitle')}>
              Costo total real, no solo la tasa anunciada.
            </p>
          </div>
          <TruthBadge truthClass="ESTIMATED" />
        </div>
        <div className={cls(styles, 'stack')}>
          {REFINANCE.map((item, index) => (
            <div key={item.name} className={cls(styles, 'rankRow')}>
              <span className={cls(styles, 'rankBadge')}>{index + 1}</span>
              <div className={cls(styles, 'rankBody')}>
                <p className={cls(styles, 'rankName')}>{item.name}</p>
                <p className={cls(styles, 'rankMeta')}>{item.meta}</p>
              </div>
              <span className={cls(styles, 'rankValue')}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className={cls(styles, 'sourceLine')}>
          <IconReceipt size={14} />
          Fuente: comparador 29 sep 2026 · credit.compare_refinance@1
        </div>
      </section>
    </div>
  );
}
