import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconReceipt(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 3H18V21L15 19L12 21L9 19L6 21V3Z" />
      <path d="M9 8H15M9 12H15M9 16H12" />
    </Icon>
  );
}
