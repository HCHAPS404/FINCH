'use client';

import type { ReactElement, SubmitEvent } from 'react';
import Link from 'next/link';
import { Button, Input, IconLock, IconArrowLeft, IconArrowRight } from '@finch/ui-web';
import { AuthCardLayout } from '../_components/AuthCardLayout';

function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
  event.preventDefault();
}

export default function ForgotPasswordPage(): ReactElement {
  return (
    <AuthCardLayout
      icon={IconLock}
      title="Recupera tu acceso"
      description="Escribe el correo con el que te registraste y te enviaremos un enlace seguro. Caduca en 30 minutos."
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}
      >
        <Input label="Correo electrónico" name="email" type="email" autoComplete="email" required />
        <Button type="submit" size="large" style={{ width: '100%' }}>
          Enviar enlace
          <IconArrowRight size={18} />
        </Button>
      </form>
      <Link
        href="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: 'var(--fc-text-secondary)',
        }}
      >
        <IconArrowLeft size={16} />
        Volver a iniciar sesión
      </Link>
    </AuthCardLayout>
  );
}
