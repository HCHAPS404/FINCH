'use client';

import type { ChangeEvent, KeyboardEvent, ReactElement } from 'react';
import { useRef, useState } from 'react';

const LENGTH = 6;

export function OtpInput(): ReactElement {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <div role="group" aria-label="Código de verificación" style={{ display: 'flex', gap: 8 }}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={digit}
          onChange={(event) => {
            handleChange(index, event);
          }}
          onKeyDown={(event) => {
            handleKeyDown(index, event);
          }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Dígito ${index + 1}`}
          style={{
            width: 44,
            height: 52,
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--fc-text-primary)',
            border: '1px solid var(--fc-border-subtle)',
            borderRadius: 10,
            background: 'var(--fc-surface-raised)',
          }}
        />
      ))}
    </div>
  );
}
