import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconEyeOff(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 3L21 21" />
      <path d="M10.6 5.1C11.0637 5.03392 11.5316 5.0005 12 5C18 5 22 12 22 12C21.1332 13.4519 20.0547 14.7664 18.8 15.9M6.6 6.6C3.8 8.4 2 12 2 12C2 12 6 19 12 19C13.9195 19.0185 15.8004 18.4612 17.4 17.4" />
    </Icon>
  );
}
