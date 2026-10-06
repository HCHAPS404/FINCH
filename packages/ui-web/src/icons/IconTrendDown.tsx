import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconTrendDown(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 7L9 13L13 9L21 17" />
      <path d="M15 17H21V11" />
    </Icon>
  );
}
