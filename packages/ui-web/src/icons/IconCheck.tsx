import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconCheck(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M5 12L10 17L19 7" />
    </Icon>
  );
}
