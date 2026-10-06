import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconWallet(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M18 6H6C4.34315 6 3 7.34315 3 9V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V9C21 7.34315 19.6569 6 18 6Z" />
      <path d="M3 10H21" />
      <path d="M16 15H18" />
      <path d="M6 6L15 3L16 6" />
    </Icon>
  );
}
