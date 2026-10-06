import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconArrowRight(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M5 12H19M13 18L19 12L13 6" />
    </Icon>
  );
}
