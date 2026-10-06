import type { ReactElement } from 'react';
import markGreen from './assets/mark-green.svg';
import markWhite from './assets/mark-white.svg';
import wordmarkGreen from './assets/wordmark-green.svg';
import wordmarkWhite from './assets/wordmark-white.svg';

/**
 * The brand mark is a masked raster image in Figma (not a clean vector path like the
 * icon set), already exported pre-tinted for each (variant, tone) pair — so this
 * component selects a static asset rather than recoloring one at runtime.
 */
export type LogoVariant = 'mark' | 'wordmark';
export type LogoTone = 'green' | 'white';

export interface LogoProps {
  readonly variant?: LogoVariant;
  readonly tone?: LogoTone;
  readonly height?: number;
  readonly className?: string;
}

const ASSET: Record<LogoVariant, Record<LogoTone, string>> = {
  mark: { green: markGreen, white: markWhite },
  wordmark: { green: wordmarkGreen, white: wordmarkWhite },
};

export function Logo({
  variant = 'mark',
  tone = 'green',
  height = 32,
  className,
}: LogoProps): ReactElement {
  return <img src={ASSET[variant][tone]} alt="FINCH" height={height} className={className} />;
}
