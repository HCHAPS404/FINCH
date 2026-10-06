'use client';

import type { ReactElement, SubmitEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Checkbox, Input, IconGlobe, IconFingerprint, IconArrowRight } from '@finch/ui-web';
import { AuthLayout } from '../_components/AuthLayout';
import { FormHeading } from '../_components/FormHeading';
import { LabeledDivider } from '../_components/LabeledDivider';
import { DEMO_EMAIL, DEMO_PASSWORD, isDemoCredentials } from '../_lib/demo-auth';

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isDemoCredentials(email, password)) {
      router.push('/hoy');
      return;
    }
    setError(`Ese usuario no existe en este demo. Usa ${DEMO_EMAIL} / ${DEMO_PASSWORD}.`);
  }

  return (
    <AuthLayout
      headline="Qué bueno verte de nuevo."
      subhead="Tu plan del mes te está esperando. Revisamos tasas y tarjetas mientras no estabas."
    >
      <FormHeading title="Inicia sesión" subtitle="Entra con tu correo o con tu llave de acceso." />

      <div
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid var(--fc-border-subtle)',
          background: 'var(--fc-surface-base)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: 'var(--fc-text-secondary)',
        }}
      >
        Demo local, sin backend. Usuario de prueba:{' '}
        <strong style={{ color: 'var(--fc-text-primary)' }}>{DEMO_EMAIL}</strong> / contraseña{' '}
        <strong style={{ color: 'var(--fc-text-primary)' }}>{DEMO_PASSWORD}</strong>
      </div>

      <Button variant="secondary" size="large" style={{ width: '100%' }} disabled>
        <IconFingerprint size={18} />
        Entrar con llave de acceso
      </Button>
      <Button variant="secondary" size="large" style={{ width: '100%' }} disabled>
        <IconGlobe size={18} />
        Continuar con Google
      </Button>

      <LabeledDivider label="o con tu correo" />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          {...(error ? { error } : {})}
          required
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Checkbox label="Recordarme" name="remember" />
          <Link
            href="/forgot-password"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: 'var(--fc-positive-fg)',
              fontWeight: 500,
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" size="large" style={{ width: '100%' }}>
          Iniciar sesión
          <IconArrowRight size={18} />
        </Button>
      </form>

      <p
        style={{
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: 'var(--fc-text-secondary)',
          margin: 0,
        }}
      >
        ¿Nuevo en FINCH?{' '}
        <Link href="/signup" style={{ color: 'var(--fc-positive-fg)', fontWeight: 500 }}>
          Crea una cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
