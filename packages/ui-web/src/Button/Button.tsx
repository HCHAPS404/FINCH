import type { ButtonHTMLAttributes, ReactElement } from 'react';
import { cls, cx } from '../internal/cx.js';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  className,
  type = 'button',
  ...rest
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={cx(cls(styles, 'button'), cls(styles, variant), cls(styles, size), className)}
      {...rest}
    />
  );
}
