import type { ReactElement } from 'react';
import {
  Banner,
  TruthBadge,
  StatusChip,
  EnvelopeRow,
  FreshnessStamp,
  IconShield,
  IconCard,
  IconTarget,
  IconAlert,
  IconReceipt,
  IconSparkles,
  IconMic,
  IconSend,
  IconChevronRight,
} from '@finch/ui-web';
import { AppShell } from '../_components/AppShell';
import { cls } from '../../_lib/cx';
import styles from './page.module.css';

const THINGS_TODAY = [
  {
    icon: IconCard,
    title: 'Paga $412.000 de tu Visa antes del viernes',
    subtitle: 'Evitas $38.900 de intereses este mes.',
    chip: { tone: 'warning' as const, icon: IconAlert, label: 'Vence en 3 días' },
  },
  {
    icon: IconTarget,
    title: 'Mueve $300.000 a tu meta "Viaje a Cartagena"',
    subtitle: 'Vas al 62 %. Llegas en diciembre a este ritmo.',
    chip: { tone: 'positive' as const, icon: IconShield, label: 'Al día' },
  },
  {
    icon: IconAlert,
    title: 'Revisa un cobro nuevo de $49.900',
    subtitle: '"STREAMPLUS" no aparecía en meses anteriores.',
    chip: { tone: 'info' as const, icon: IconAlert, label: 'Nuevo' },
  },
];

const ENVELOPES = [
  {
    name: 'Mercado',
    status: 'Disponible $660.000',
    meta: '$540.000 de $1.200.000',
    progress: 45,
    tone: 'ok' as const,
  },
  {
    name: 'Transporte',
    status: 'Quedan $54.000 · 80 %',
    meta: '$246.000 de $300.000',
    progress: 82,
    tone: 'warning' as const,
  },
  {
    name: 'Salidas',
    status: 'Sobre agotado',
    meta: '$200.000 de $200.000',
    progress: 100,
    tone: 'full' as const,
  },
  {
    name: 'Suscripciones',
    status: 'Excedido por $22.000',
    meta: '$112.000 de $90.000',
    progress: 100,
    tone: 'overspent' as const,
  },
];

const SUGGESTED_QUESTIONS = [
  '¿Me alcanza para un portátil de $3.200.000?',
  '¿Qué pasa si pago solo el mínimo?',
  '¿Cuánto gasté en domicilios este mes?',
];

const CARDS = [
  {
    name: 'Visa Oro ·· 4821',
    percent: 82,
    meta: '$3.280.000 de $4.000.000 · Corte 5 oct · Pago 20 oct',
  },
  {
    name: 'Mastercard ·· 1190',
    percent: 18,
    meta: '$640.000 de $3.500.000 · Corte 12 oct · Pago 27 oct',
  },
];

const UPCOMING = [
  { date: '30 sep', label: 'Arriendo', amount: '$1.350.000' },
  { date: '2 oct', label: 'Plan celular', amount: '$62.900' },
  { date: '5 oct', label: 'Corte Visa Oro', amount: '—' },
  { date: '6 oct', label: 'Cuota crédito libre inversión', amount: '$486.200' },
];

export default function HoyPage(): ReactElement {
  return (
    <AppShell heading="Buenos días, Laura" date="Martes, 29 de septiembre">
      <Banner tone="positive" title="Tu quincena llegó: $2.400.000">
        Planéala en un minuto: asignamos cada peso a un sobre antes de que se vaya.
      </Banner>

      <div className={cls(styles, 'layout')} style={{ marginTop: 20 }}>
        <div className={cls(styles, 'column')}>
          <section className={cls(styles, 'card')}>
            <div className={cls(styles, 'safeToSpendLabel')}>
              Disponible para gastar hasta el 15 de octubre
              <TruthBadge truthClass="DERIVED_DETERMINISTIC" />
            </div>
            <p className={cls(styles, 'safeToSpendAmount')}>$1.284.500</p>
            <p className={cls(styles, 'safeToSpendPerDay')}>≈ $80.300 por día</p>
            <div className={cls(styles, 'metrics')}>
              <div>
                <p className={cls(styles, 'metricLabel')}>Ingresos del mes</p>
                <p className={cls(styles, 'metricValue')}>$4.800.000</p>
                <p className={cls(styles, 'metricMeta')}>Declarado</p>
              </div>
              <div>
                <p className={cls(styles, 'metricLabel')}>Comprometido</p>
                <p className={cls(styles, 'metricValue')}>$2.310.000</p>
                <p className={cls(styles, 'metricMeta')}>Calculado</p>
              </div>
              <div>
                <p className={cls(styles, 'metricLabel')}>Ahorro automático</p>
                <p className={cls(styles, 'metricValue')}>$480.000</p>
                <p className={cls(styles, 'metricMeta')}>10 % del ingreso</p>
              </div>
            </div>
            <div className={cls(styles, 'receiptLink')}>
              <IconReceipt size={16} />
              Ver comprobante · safe_to_spend@1
            </div>
          </section>

          <section className={cls(styles, 'card')}>
            <div className={cls(styles, 'cardHeader')}>
              <h2 className={cls(styles, 'cardTitle')}>Tres cosas para hoy</h2>
              <a href="#" className={cls(styles, 'cardLink')}>
                Ver todas
              </a>
            </div>
            {THINGS_TODAY.map((item) => (
              <div key={item.title} className={cls(styles, 'taskRow')}>
                <span className={cls(styles, 'taskIcon')}>
                  <item.icon size={18} />
                </span>
                <div className={cls(styles, 'taskBody')}>
                  <p className={cls(styles, 'taskTitle')}>{item.title}</p>
                  <p className={cls(styles, 'taskSubtitle')}>{item.subtitle}</p>
                </div>
                <StatusChip tone={item.chip.tone}>{item.chip.label}</StatusChip>
                <IconChevronRight
                  size={18}
                  style={{ color: 'var(--fc-text-muted)', flexShrink: 0 }}
                />
              </div>
            ))}
          </section>

          <section className={cls(styles, 'card')}>
            <div className={cls(styles, 'cardHeader')}>
              <h2 className={cls(styles, 'cardTitle')}>Sobres de esta quincena</h2>
              <a href="/dinero" className={cls(styles, 'cardLink')}>
                Administrar
              </a>
            </div>
            <div className={cls(styles, 'envelopeGrid')}>
              {ENVELOPES.map((envelope) => (
                <EnvelopeRow key={envelope.name} {...envelope} />
              ))}
            </div>
          </section>
        </div>

        <div className={cls(styles, 'column')}>
          <section className={cls(styles, 'card')}>
            <div className={cls(styles, 'askFinchHeader')}>
              <IconSparkles size={18} />
              Pregúntale a FINCH
            </div>
            <p className={cls(styles, 'askFinchSubtitle')}>
              Nemotron explica. Las cifras salen siempre de fórmulas verificadas.
            </p>
            {SUGGESTED_QUESTIONS.map((question) => (
              <button key={question} type="button" className={cls(styles, 'suggestedQuestion')}>
                {question}
              </button>
            ))}
            <div className={cls(styles, 'askFinchInput')}>
              Escribe tu pregunta…
              <IconMic size={16} style={{ marginLeft: 'auto' }} />
              <IconSend size={16} />
            </div>
          </section>

          <section className={cls(styles, 'card')}>
            <div className={cls(styles, 'cardHeader')}>
              <h2 className={cls(styles, 'cardTitle')}>Tarjetas</h2>
              <a href="/dinero" className={cls(styles, 'cardLink')}>
                Detalle
              </a>
            </div>
            {CARDS.map((card) => (
              <div key={card.name} className={cls(styles, 'cardUsageRow')}>
                <div className={cls(styles, 'cardUsageHeader')}>
                  <span>{card.name}</span>
                  <span>{card.percent} %</span>
                </div>
                <div className={cls(styles, 'cardUsageTrack')}>
                  <div
                    className={cls(styles, 'cardUsageFill')}
                    style={{ width: `${card.percent}%` }}
                  />
                </div>
                <p className={cls(styles, 'cardUsageMeta')}>{card.meta}</p>
              </div>
            ))}
          </section>

          <section className={cls(styles, 'card')}>
            <div className={cls(styles, 'cardHeader')}>
              <h2 className={cls(styles, 'cardTitle')}>Próximos 7 días</h2>
              <a href="#" className={cls(styles, 'cardLink')}>
                Calendario
              </a>
            </div>
            {UPCOMING.map((item) => (
              <div key={item.label} className={cls(styles, 'upcomingRow')}>
                <span className={cls(styles, 'upcomingDate')}>{item.date}</span>
                <span className={cls(styles, 'upcomingLabel')}>{item.label}</span>
                <span className={cls(styles, 'upcomingAmount')}>{item.amount}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <FreshnessStamp freshness="RECENT" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
