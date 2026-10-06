import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconArrowLeft(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M19 12H5M11 18L5 12L11 6" />
    </Icon>
  );
}
