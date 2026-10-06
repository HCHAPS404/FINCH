'use client';

import type { ReactElement, SubmitEvent } from 'react';
import { Button, IconMail, IconArrowRight } from '@finch/ui-web';
import { AuthCardLayout } from '../_components/AuthCardLayout';
import { OtpInput } from '../_components/OtpInput';

function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
  event.preventDefault();
}

export default function CheckEmailPage(): ReactElement {
  return (
    <AuthCardLayout
      icon={IconMail}
      title="Revisa tu correo"
      description="Enviamos un enlace a laura@correo.com. Ábrelo desde este dispositivo para verificar tu cuenta."
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          width: '100%',
        }}
      >
        <OtpInput />
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'var(--fc-text-muted)',
          }}
        >
          ¿No lo encuentras? Revisa spam o promociones.
        </p>
        <Button type="submit" size="large" style={{ width: '100%' }}>
          Verificar código
          <IconArrowRight size={18} />
        </Button>
        <Button type="button" variant="ghost" size="large" style={{ width: '100%' }} disabled>
          Reenviar en 0:42
        </Button>
      </form>
    </AuthCardLayout>
  );
}
