'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Button, Input, Banner, IconPlus, IconX } from '@finch/ui-web';
import { Money } from '@finch/financial-engine';
import { cls } from '../../../_lib/cx';
import styles from '../../yo/_components/shared.module.css';
import {
  listDebts,
  createDebt,
  deleteDebt,
  listCards,
  createCard,
  deleteCard,
  type Debt,
  type Card,
} from '../../../_lib/api';
import { getSession } from '../../../_lib/session';

function formatMoney(minorUnits: string, currency: string): string {
  // `Money.toDecimalString()` is the authoritative, loss-free decimal representation
  // (ADR-0016); `Intl.NumberFormat` only formats it for display, it never computes
  // with it, so this stays safe even though it takes the detour through `Number`.
  const decimal = Money.fromMinorUnits(BigInt(minorUnits), currency).toDecimalString();
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(Number(decimal));
}

function DebtForm({
  onCancel,
  onCreated,
}: {
  readonly onCancel: () => void;
  readonly onCreated: (debt: Debt) => void;
}): ReactElement {
  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(): Promise<void> {
    setError(undefined);
    let minorUnits: bigint;
    try {
      minorUnits = Money.fromDecimalString(amount, 'COP').minorUnits;
    } catch {
      setError('Monto inválido. Usa un número como 1500000 o 1500000.50.');
      return;
    }
    setSubmitting(true);
    try {
      const session = getSession();
      if (session === undefined) return;
      const debt = await createDebt(session.workspaceId, {
        name,
        creditor,
        principalAmountMinor: minorUnits.toString(),
        currency: 'COP',
      });
      onCreated(debt);
    } catch {
      setError('No pudimos guardar la deuda.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cls(styles, 'card')} style={{ marginTop: 12 }}>
      {error !== undefined ? (
        <Banner tone="negative" title="Algo salió mal">
          {error}
        </Banner>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
        <Input
          label="Nombre"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          required
        />
        <Input
          label="Acreedor"
          name="creditor"
          value={creditor}
          onChange={(event) => {
            setCreditor(event.target.value);
          }}
          required
        />
        <Input
          label="Monto (COP)"
          name="amount"
          inputMode="decimal"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
          }}
          required
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={submitting || name === '' || creditor === '' || amount === ''}
          >
            {submitting ? 'Guardando…' : 'Guardar deuda'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

function CardForm({
  onCancel,
  onCreated,
}: {
  readonly onCancel: () => void;
  readonly onCreated: (card: Card) => void;
}): ReactElement {
  const [issuer, setIssuer] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(): Promise<void> {
    setError(undefined);
    if (!/^\d{4}$/.test(lastFour)) {
      setError('Los últimos 4 dígitos deben ser exactamente 4 números.');
      return;
    }
    setSubmitting(true);
    try {
      const session = getSession();
      if (session === undefined) return;
      const card = await createCard(session.workspaceId, { issuer, lastFour, currency: 'COP' });
      onCreated(card);
    } catch {
      setError('No pudimos guardar la tarjeta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cls(styles, 'card')} style={{ marginTop: 12 }}>
      {error !== undefined ? (
        <Banner tone="negative" title="Algo salió mal">
          {error}
        </Banner>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
        <Input
          label="Emisor (banco)"
          name="issuer"
          value={issuer}
          onChange={(event) => {
            setIssuer(event.target.value);
          }}
          required
        />
        <Input
          label="Últimos 4 dígitos"
          name="lastFour"
          inputMode="numeric"
          maxLength={4}
          helperText="Nunca guardamos el número completo."
          value={lastFour}
          onChange={(event) => {
            setLastFour(event.target.value);
          }}
          required
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={submitting || issuer === '' || lastFour === ''}
          >
            {submitting ? 'Guardando…' : 'Guardar tarjeta'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TarjetasTab(): ReactElement {
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session === undefined) {
      setLoading(false);
      return;
    }
    setWorkspaceId(session.workspaceId);
    Promise.all([listDebts(session.workspaceId), listCards(session.workspaceId)])
      .then(([debtRows, cardRows]) => {
        setDebts(debtRows);
        setCards(cardRows);
      })
      .catch(() => {
        setError('No pudimos cargar tus deudas y tarjetas.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleDeleteDebt(id: string): Promise<void> {
    if (workspaceId === undefined) return;
    await deleteDebt(workspaceId, id);
    setDebts((previous) => previous.filter((debt) => debt.id !== id));
  }

  async function handleDeleteCard(id: string): Promise<void> {
    if (workspaceId === undefined) return;
    await deleteCard(workspaceId, id);
    setCards((previous) => previous.filter((card) => card.id !== id));
  }

  if (workspaceId === undefined && !loading) {
    return (
      <section className={cls(styles, 'card')}>
        <p className={cls(styles, 'cardSubtitle')}>Inicia sesión para ver tus tarjetas y deudas.</p>
      </section>
    );
  }

  return (
    <div className={cls(styles, 'stack')}>
      {error !== undefined ? (
        <Banner tone="negative" title="Algo salió mal">
          {error}
        </Banner>
      ) : null}

      <section className={cls(styles, 'card')}>
        <div className={cls(styles, 'cardHeader')}>
          <h2 className={cls(styles, 'cardTitle')}>
            {loading ? 'Cargando…' : `${debts.length} deudas`}
          </h2>
          <Button
            size="medium"
            onClick={() => {
              setShowDebtForm((value) => !value);
            }}
          >
            <IconPlus size={16} />
            Agregar deuda
          </Button>
        </div>
        {showDebtForm ? (
          <DebtForm
            onCancel={() => {
              setShowDebtForm(false);
            }}
            onCreated={(debt) => {
              setDebts((previous) => [debt, ...previous]);
              setShowDebtForm(false);
            }}
          />
        ) : null}
        {!loading && debts.length === 0 && !showDebtForm ? (
          <p className={cls(styles, 'cardSubtitle')}>Todavía no has agregado deudas.</p>
        ) : null}
        {debts.map((debt) => (
          <div key={debt.id} className={cls(styles, 'row')}>
            <div className={cls(styles, 'rowBody')}>
              <p className={cls(styles, 'rowTitle')}>{debt.name}</p>
              <p className={cls(styles, 'rowMeta')}>
                {debt.creditor} · {formatMoney(debt.principalAmountMinor, debt.currency)}
              </p>
            </div>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => {
                void handleDeleteDebt(debt.id);
              }}
            >
              <IconX size={16} />
            </Button>
          </div>
        ))}
      </section>

      <section className={cls(styles, 'card')}>
        <div className={cls(styles, 'cardHeader')}>
          <h2 className={cls(styles, 'cardTitle')}>
            {loading ? 'Cargando…' : `${cards.length} tarjetas`}
          </h2>
          <Button
            size="medium"
            onClick={() => {
              setShowCardForm((value) => !value);
            }}
          >
            <IconPlus size={16} />
            Agregar tarjeta
          </Button>
        </div>
        {showCardForm ? (
          <CardForm
            onCancel={() => {
              setShowCardForm(false);
            }}
            onCreated={(card) => {
              setCards((previous) => [card, ...previous]);
              setShowCardForm(false);
            }}
          />
        ) : null}
        {!loading && cards.length === 0 && !showCardForm ? (
          <p className={cls(styles, 'cardSubtitle')}>Todavía no has agregado tarjetas.</p>
        ) : null}
        {cards.map((card) => (
          <div key={card.id} className={cls(styles, 'row')}>
            <div className={cls(styles, 'rowBody')}>
              <p className={cls(styles, 'rowTitle')}>
                {card.issuer} •••• {card.lastFour}
              </p>
              <p className={cls(styles, 'rowMeta')}>{card.network ?? 'Tarjeta'}</p>
            </div>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => {
                void handleDeleteCard(card.id);
              }}
            >
              <IconX size={16} />
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
