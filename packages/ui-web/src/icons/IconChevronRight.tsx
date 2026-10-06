import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconChevronRight(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M9 6L15 12L9 18" />
    </Icon>
  );
}
