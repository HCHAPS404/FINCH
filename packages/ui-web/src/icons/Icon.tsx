import type { ReactElement, ReactNode, SVGProps } from 'react';

/**
 * Shared wrapper for the 24px/stroke-1.75 icon set — read from the FINCH Figma file's
 * "Icons (24px, stroke 1.75)" section (file key aA7KzO0a2hg4cJY3zhDzkS) on 2026-10-06
 * via the Images API (format=svg), one per icon, so path data is vector-exact rather
 * than hand-traced.
 *
 * Stroke color defaults to `currentColor` (every exported path had its literal fill
 * stripped) so an icon inherits the text color of whatever renders it — the same
 * component works inside a `positive`, `negative` or `muted` text color without a
 * color prop of its own.
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  readonly size?: number;
}

export function Icon({
  size = 24,
  children,
  ...rest
}: IconProps & { children: ReactNode }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}
