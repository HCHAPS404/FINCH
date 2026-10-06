'use client';

import type { ReactElement, SubmitEvent } from 'react';
import { useId, useState } from 'react';
import { AppShell } from '../_components/AppShell';
import { TruthBadge, IconMic, IconSend, IconReceipt } from '@finch/ui-web';
import type { TruthClass } from '@finch/contracts';
import { cls, cx } from '../../_lib/cx';
import styles from './page.module.css';

interface Message {
  readonly id: string;
  readonly role: 'user' | 'finch';
  readonly text: string;
  readonly truthClass?: TruthClass;
  readonly receipt?: string;
}

const SUGGESTIONS = [
  '¿Me alcanza para un portátil de $3.200.000?',
  '¿Qué pasa si pago solo el mínimo?',
  '¿Cuánto gasté en domicilios este mes?',
] as const;

// Canned, hand-written answers — there is no model behind this screen yet. Keeping
// them keyed by the exact suggestion text (rather than faking a live call) is
// deliberate: real responses come from C1 (afford simulation) and E3 (natural-language
// search over a bounded DSL, never free SQL) once those exist.
const CANNED_RESPONSES: Record<string, { text: string; receipt: string }> = {
  '¿Me alcanza para un portátil de $3.200.000?': {
    text: 'Sí, pero con cuidado. Tu disponible hasta el 15 de octubre es $1.284.500 — de contado quedarías en negativo este corte. A 12 cuotas en tu Visa Oro (24,3 % E.A.) pagarías $298.700/mes, $584.000 en intereses totales. A 36 cuotas, $118.200/mes pero $1.052.000 en intereses. Mi recomendación: espera al próximo corte o hazlo a 12 cuotas.',
    receipt: 'afford.simulate@1 · tasa Visa Oro del 29 sep 2026',
  },
  '¿Qué pasa si pago solo el mínimo?': {
    text: 'Tu mínimo en la Visa Oro es $164.000 este mes sobre un saldo de $3.280.000. Pagando solo el mínimo, a la tasa actual, tardarías 4 años y 7 meses en pagar la deuda completa y pagarías $2.890.000 en intereses — casi el valor de la deuda original otra vez.',
    receipt: 'credit.minimum_payment_projection@1',
  },
  '¿Cuánto gasté en domicilios este mes?': {
    text: 'En septiembre llevas $312.400 en domicilios (8 pedidos): $198.200 en Rappi y $114.200 en iFood. Es 34 % más que tu promedio de los últimos 3 meses ($233.000).',
    receipt: 'search.natural_language@1 · categoría "Domicilios"',
  },
};

const FALLBACK_RESPONSE =
  'Esta pantalla todavía es una maqueta de interfaz — no hay un agente conectado detrás. Prueba una de las preguntas sugeridas para ver cómo se vería una respuesta real.';

let messageCounter = 0;
function nextId(): string {
  messageCounter += 1;
  return `m${messageCounter}`;
}

export default function FinchPage(): ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const composerId = useId();

  function send(text: string): void {
    if (!text.trim()) return;
    const userMessage: Message = { id: nextId(), role: 'user', text };
    const canned = CANNED_RESPONSES[text];
    const finchMessage: Message = canned
      ? {
          id: nextId(),
          role: 'finch',
          text: canned.text,
          truthClass: 'GENERATED_NARRATIVE',
          receipt: canned.receipt,
        }
      : { id: nextId(), role: 'finch', text: FALLBACK_RESPONSE, truthClass: 'GENERATED_NARRATIVE' };
    setMessages((prev) => [...prev, userMessage, finchMessage]);
    setDraft('');
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    send(draft);
  }

  return (
    <AppShell heading="FINCH" date="Martes, 29 de septiembre">
      <div className={cls(styles, 'layout')}>
        <div className={cls(styles, 'thread')}>
          {messages.length === 0 ? (
            <div className={cls(styles, 'suggestions')}>
              {SUGGESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  className={cls(styles, 'suggestion')}
                  onClick={() => {
                    send(question);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cx(
                cls(styles, 'bubbleRow'),
                message.role === 'user' ? cls(styles, 'bubbleRowUser') : undefined,
              )}
            >
              <div
                className={cx(
                  cls(styles, 'bubble'),
                  cls(styles, message.role === 'user' ? 'bubbleUser' : 'bubbleFinch'),
                )}
              >
                {message.truthClass ? (
                  <div className={cls(styles, 'bubbleMeta')}>
                    <TruthBadge truthClass={message.truthClass} />
                  </div>
                ) : null}
                {message.text}
                {message.receipt ? (
                  <div className={cls(styles, 'receipt')}>
                    <IconReceipt size={14} />
                    {message.receipt}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={cls(styles, 'composer')}>
          <label htmlFor={composerId} style={{ display: 'none' }}>
            Escribe tu pregunta
          </label>
          <input
            id={composerId}
            className={cls(styles, 'composerInput')}
            placeholder="Escribe tu pregunta…"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
          />
          <button
            type="button"
            className={cls(styles, 'composerButton')}
            aria-label="Dictar por voz"
          >
            <IconMic size={18} />
          </button>
          <button type="submit" className={cls(styles, 'composerButton')} aria-label="Enviar">
            <IconSend size={18} />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
