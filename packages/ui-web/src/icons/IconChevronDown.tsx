import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconChevronDown(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 9L12 15L18 9" />
    </Icon>
  );
}
