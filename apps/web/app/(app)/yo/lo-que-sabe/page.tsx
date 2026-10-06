import type { ReactElement } from 'react';
import { Button, Banner, IconX } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const MEMORIES = [
  'Vive en Medellín, trabaja en Empresa Andina SAS con ingreso quincenal.',
  'Su meta prioritaria es el viaje a Cartagena, seguida de la cuota inicial del apartamento.',
  'Prefiere respuestas cortas y directas, sin explicaciones largas.',
  'No quiere notificaciones después de las 9 p. m.',
  'Tiene un hogar compartido con Andrés Rojas, división de gastos proporcional al ingreso.',
];

export default function LoQueSabePage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Lo que FINCH sabe de ti"
        description="Memoria controlable: tus metas, preferencias y restricciones. Revisa y olvida lo que quieras."
      />

      <div className={cls(styles, 'stack')}>
        <Banner tone="positive" title="Tus datos son tuyos">
          Exporta o borra todo en un clic. Nunca vendemos ni compartimos tu información, y no hay
          publicidad dentro de FINCH.
        </Banner>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
            Recuerdos activos
          </h2>
          {MEMORIES.map((memory) => (
            <div key={memory} className={cls(styles, 'row')}>
              <p
                className={cls(styles, 'rowBody')}
                style={{
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: 'var(--fc-text-primary)',
                }}
              >
                {memory}
              </p>
              <Button variant="ghost" size="medium">
                <IconX size={16} />
                Olvidar
              </Button>
            </div>
          ))}
        </section>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 4 }}>
            Exportar o borrar todo
          </h2>
          <p className={cls(styles, 'cardSubtitle')} style={{ marginBottom: 16 }}>
            Descarga una copia de todo lo que FINCH recuerda, o bórralo por completo.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary">Exportar mis datos</Button>
            <Button variant="danger">Borrar toda la memoria</Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
