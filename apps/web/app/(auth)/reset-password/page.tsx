'use client';

import type { ReactElement, SubmitEvent } from 'react';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, IconLock, IconArrowLeft, IconArrowRight } from '@finch/ui-web';
import { AuthCardLayout } from '../_components/AuthCardLayout';
import { confirmPasswordReset, ApiError } from '../../_lib/api';

function ResetPasswordForm(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      await confirmPasswordReset(token, newPassword);
      setDone(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? 'El enlace es inválido o ya expiró. Pide uno nuevo.'
          : 'No pudimos conectar con el servidor. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthCardLayout
        icon={IconLock}
        title="Contraseña actualizada"
        description="Ya puedes iniciar sesión con tu nueva contraseña."
      >
        <Button
          size="large"
          style={{ width: '100%' }}
          onClick={() => {
            router.push('/login');
          }}
        >
          Ir a iniciar sesión
          <IconArrowRight size={18} />
        </Button>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout
      icon={IconLock}
      title="Elige una nueva contraseña"
      description="Mínimo 8 caracteres."
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}
      >
        <Input
          label="Nueva contraseña"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
          }}
          {...(error ? { error } : {})}
          required
        />
        <Button
          type="submit"
          size="large"
          style={{ width: '100%' }}
          disabled={submitting || token === ''}
        >
          {submitting ? 'Guardando…' : 'Guardar contraseña'}
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

export default function ResetPasswordPage(): ReactElement {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
