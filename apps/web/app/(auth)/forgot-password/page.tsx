'use client';

import type { ReactElement, SubmitEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, IconLock, IconArrowLeft, IconArrowRight } from '@finch/ui-web';
import { AuthCardLayout } from '../_components/AuthCardLayout';
import { requestPasswordReset } from '../../_lib/api';

export default function ForgotPasswordPage(): ReactElement {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  // Only ever populated locally/dev — there is no email sender in this repo yet
  // (ADR-0041); the API only returns a raw token when `isAuthSandboxEligible` allows
  // it, so this stays empty in any real environment.
  const [devToken, setDevToken] = useState<string | undefined>(undefined);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      setSent(true);
      setDevToken(result.token);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthCardLayout
        icon={IconLock}
        title="Revisa tu correo"
        description="Si existe una cuenta con ese correo, te enviamos un enlace seguro. Caduca en 30 minutos."
      >
        {devToken !== undefined ? (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--fc-border-subtle)',
              background: 'var(--fc-surface-base)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: 'var(--fc-text-secondary)',
              width: '100%',
            }}
          >
            Entorno local, sin envío de correo todavía:{' '}
            <Link
              href={`/reset-password?token=${encodeURIComponent(devToken)}`}
              style={{ color: 'var(--fc-positive-fg)', fontWeight: 500 }}
            >
              continuar el restablecimiento
            </Link>
          </div>
        ) : null}
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

  return (
    <AuthCardLayout
      icon={IconLock}
      title="Recupera tu acceso"
      description="Escribe el correo con el que te registraste y te enviaremos un enlace seguro. Caduca en 30 minutos."
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}
      >
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          required
        />
        <Button type="submit" size="large" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar enlace'}
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
