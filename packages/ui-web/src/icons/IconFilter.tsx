import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconFilter(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 5H20L14 13V19L10 21V13L4 5Z" />
    </Icon>
  );
}
