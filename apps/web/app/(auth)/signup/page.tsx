'use client';

import type { ReactElement, SubmitEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Checkbox, Input, IconGlobe, IconArrowRight } from '@finch/ui-web';
import { AuthLayout } from '../_components/AuthLayout';
import { FormHeading } from '../_components/FormHeading';
import { LabeledDivider } from '../_components/LabeledDivider';
import { signup, ApiError } from '../../_lib/api';
import { setSession } from '../../_lib/session';

export default function SignUpPage(): ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      const session = await signup({ email, password, displayName });
      setSession(session);
      router.push('/onboarding/1');
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.code === 'FINCH_VALIDATION_EMAIL_TAKEN'
          ? 'Ya existe una cuenta con ese correo.'
          : 'No pudimos crear tu cuenta. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      headline="Tu CFO personal, privado y siempre atento."
      subhead="Planea tu quincena, controla tus tarjetas y encuentra el dinero que estás perdiendo."
    >
      <FormHeading title="Crea tu cuenta" subtitle="Empieza gratis. Sin conectar tu banco." />

      <Button variant="secondary" size="large" style={{ width: '100%' }} disabled>
        <IconGlobe size={18} />
        Continuar con Google
      </Button>

      <LabeledDivider label="o con tu correo" />

      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <Input
          label="Nombre"
          name="name"
          autoComplete="name"
          helperText="Lo usaremos solo para tu cuenta."
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
          }}
          required
        />
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          helperText="Te enviaremos un enlace para verificarlo."
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
          autoComplete="new-password"
          helperText="Mínimo 12 caracteres, con un número."
          minLength={12}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          {...(error ? { error } : {})}
          required
        />
        <Checkbox label="Acepto los Términos y la Política de datos" name="acceptTerms" required />
        <Button type="submit" size="large" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
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
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color: 'var(--fc-positive-fg)', fontWeight: 500 }}>
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
