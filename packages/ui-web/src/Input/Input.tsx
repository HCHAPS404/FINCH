import type { InputHTMLAttributes, ReactElement } from 'react';
import { useId } from 'react';
import { cls, cx } from '../internal/cx.js';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  readonly label: string;
  readonly helperText?: string;
  readonly error?: string;
  readonly id?: string;
}

export function Input({
  label,
  helperText,
  error,
  id,
  className,
  ...rest
}: InputProps): ReactElement {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const message = error ?? helperText;

  return (
    <div className={cx(cls(styles, 'wrapper'), className)}>
      <label className={cls(styles, 'label')} htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className={cls(styles, 'field')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={message ? helperId : undefined}
        {...rest}
      />
      {message ? (
        <p
          id={helperId}
          className={cx(cls(styles, 'helper'), error ? cls(styles, 'helperError') : undefined)}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
