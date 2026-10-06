import type { ReactElement } from 'react';
import { Toggle, Button, Input, IconRefresh } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

export default function AjustesPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Canales y ajustes"
        description="Bandeja interna, correo privado, calendario y cómo quieres que te avisemos."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 14 }}>
            Notificaciones
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Toggle label="Bandeja interna + notificaciones push" name="inbox" defaultChecked />
            <Toggle label="Alertas de Decision Cards nuevas" name="decision-cards" defaultChecked />
            <Toggle
              label="Recordatorios de vencimientos (Bóveda)"
              name="vault-reminders"
              defaultChecked
            />
            <Toggle label="Briefing diario por correo" name="daily-briefing" />
            <Toggle
              label="Horario silencioso (10 p. m. – 7 a. m.)"
              name="quiet-hours"
              defaultChecked
            />
          </div>
        </section>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 4 }}>
            Correo privado de FINCH
          </h2>
          <p className={cls(styles, 'cardSubtitle')} style={{ marginBottom: 14 }}>
            Reenvía aquí notificaciones del banco, facturas o documentos para que entren directo a
            tu Bóveda.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Tu dirección"
                name="inboundEmail"
                value="laura-f82a@buzon.finch.co"
                readOnly
              />
            </div>
            <Button variant="secondary">
              <IconRefresh size={16} />
              Rotar dirección
            </Button>
          </div>
        </section>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 4 }}>
            Calendario
          </h2>
          <p className={cls(styles, 'cardSubtitle')} style={{ marginBottom: 14 }}>
            Exporta tus fechas clave (vencimientos, cortes, pagos) a tu calendario personal — solo
            fechas, sin montos.
          </p>
          <Button variant="secondary">Exportar calendario (.ics)</Button>
        </section>
      </div>
    </AppShell>
  );
}
