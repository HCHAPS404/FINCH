import type { ReactElement, ReactNode } from 'react';
import { Logo, IconCheck } from '@finch/ui-web';
import { cls } from '../../_lib/cx';
import styles from './AuthLayout.module.css';

export interface AuthLayoutProps {
  readonly headline: string;
  readonly subhead: string;
  readonly children: ReactNode;
}

const TRUST_POINTS = [
  'Cada cifra con su comprobante: fórmula, fuente y fecha.',
  'Nemotron explica; las matemáticas deciden.',
  'Tus datos son tuyos: nunca vendemos ni movemos tu dinero.',
];

export function AuthLayout({ headline, subhead, children }: AuthLayoutProps): ReactElement {
  return (
    <div className={cls(styles, 'wrapper')}>
      <aside className={cls(styles, 'brandPanel')}>
        <div className={cls(styles, 'brand')}>
          <Logo variant="mark" tone="white" height={28} />
          <Logo variant="wordmark" tone="white" height={16} />
        </div>
        <div className={cls(styles, 'pitch')}>
          <h1 className={cls(styles, 'headline')}>{headline}</h1>
          <p className={cls(styles, 'subhead')}>{subhead}</p>
          <ul
            className={cls(styles, 'points')}
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {TRUST_POINTS.map((point) => (
              <li key={point} className={cls(styles, 'point')}>
                <IconCheck className={cls(styles, 'pointIcon')} />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <figure className={cls(styles, 'testimonial')} style={{ margin: 0 }}>
          <blockquote className={cls(styles, 'quote')} style={{ margin: 0 }}>
            “Por primera vez sé exactamente cuánto me queda para el mes, y por qué.”
          </blockquote>
          <figcaption className={cls(styles, 'attribution')}>
            Laura, 29 · Bogotá (persona sintética)
          </figcaption>
        </figure>
      </aside>
      <main className={cls(styles, 'formArea')}>
        <div className={cls(styles, 'form')}>{children}</div>
      </main>
    </div>
  );
}
